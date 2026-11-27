import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { publicLeadSchema } from '@/features/leads/schemas/lead.schema'
import { can } from '@/lib/auth/rbac'
import { checkRateLimit } from '@/lib/security/rate-limit'
import { isSameOrigin } from '@/lib/security/validate-origin'
import { env } from '@/lib/env'
import { getPropertyBySlug } from '@/data/properties'
import { sendAdminPush } from '@/lib/push'

function getClientKey(request: Request) {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'local-client'
}

// Staff-only: the real private-viewing requests, newest first.
export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
  if (!can({ userId: session.user.id, role: session.user.role }, 'lead:read'))
    return NextResponse.json({ error: 'You do not have permission to view leads.' }, { status: 403 })

  if (!env.DATABASE_URL) return NextResponse.json({ ok: true, leads: [] })

  try {
    const { db } = await import('@/lib/db')
    const leads = await db.lead.findMany({
      orderBy: { createdAt: 'desc' },
      take: 30,
      include: { property: { select: { title: true, slug: true } } },
    })
    return NextResponse.json({
      ok: true,
      leads: leads.map((lead) => ({
        id: lead.id,
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        note: lead.note,
        stage: lead.stage,
        source: lead.source,
        property: lead.property?.title ?? null,
        propertySlug: lead.property?.slug ?? null,
        createdAt: lead.createdAt.toISOString(),
      })),
    })
  } catch (error) {
    console.error('lead_list_failed', error instanceof Error ? error.message : 'unknown error')
    return NextResponse.json({ ok: true, leads: [] })
  }
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: 'Request not allowed.' }, { status: 403 })
  const rateLimit = checkRateLimit(`lead:${getClientKey(request)}`, 5, 60_000)
  if (!rateLimit.allowed)
    return NextResponse.json({ error: 'Too many requests. Please try again shortly.' }, { status: 429 })

  let raw: unknown
  try {
    raw = await request.json()
  } catch {
    return NextResponse.json({ error: 'Please send a valid request.' }, { status: 400 })
  }

  const parsed = publicLeadSchema.safeParse(raw)
  if (!parsed.success)
    return NextResponse.json(
      { error: 'Please check the highlighted details and try again.' },
      { status: 400 },
    )
  if (parsed.data.honeypot) return NextResponse.json({ ok: true })

  if (env.TURNSTILE_SECRET_KEY) {
    const token = request.headers.get('x-turnstile-token')
    if (!token)
      return NextResponse.json({ error: 'Please complete the verification and try again.' }, { status: 400 })
    const verification = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: env.TURNSTILE_SECRET_KEY,
        response: token,
        remoteip: getClientKey(request),
      }),
    })
    const result = (await verification.json()) as { success?: boolean }
    if (!result.success)
      return NextResponse.json({ error: 'Please complete the verification and try again.' }, { status: 400 })
  }

  try {
    if (process.env.DATABASE_URL) {
      const { db } = await import('@/lib/db')
      const property = parsed.data.propertySlug
        ? await db.property.findUnique({
            where: { slug: parsed.data.propertySlug },
            select: { id: true, title: true },
          })
        : null
      // The public site serves its listings from static data, so fall back to that
      // when the slug is not a database row — the notification still names the property.
      const propertyTitle =
        property?.title ??
        (parsed.data.propertySlug ? (getPropertyBySlug(parsed.data.propertySlug)?.title ?? null) : null)
      const lead = await db.lead.create({
        data: {
          name: parsed.data.name,
          email: parsed.data.email,
          phone: parsed.data.phone,
          note: parsed.data.note,
          propertyId: property?.id,
          source: 'WEBSITE',
          score: 20,
        },
      })
      // Fan out an in-app notification to the admin panel. A failure here must
      // never break the visitor's request, so it is logged and swallowed.
      try {
        await db.notification.create({
          data: {
            audience: 'ADMIN',
            type: 'VIEWING_REQUEST',
            title: lead.name,
            body: propertyTitle,
            link: '/admin/leads',
            meta: {
              leadId: lead.id,
              name: lead.name,
              phone: lead.phone,
              email: lead.email,
              property: propertyTitle,
              note: lead.note ?? '',
            },
          },
        })
        // Push the same alert to the admin mobile app. No-op until the
        // Firebase env is configured on the host; never blocks the reply.
        void sendAdminPush({
          title: `New viewing request \u2014 ${lead.name}`,
          body: propertyTitle ? `${propertyTitle} \u00b7 ${lead.phone}` : lead.phone,
          data: { type: 'new_lead', leadId: lead.id },
        })
      } catch (error) {
        console.error(
          'lead_notification_failed',
          error instanceof Error ? error.message : 'unknown error',
        )
      }
    }
    return NextResponse.json({ ok: true, message: 'Your request has been received.' }, { status: 201 })
  } catch (error) {
    console.error('lead_submission_failed', error instanceof Error ? error.message : 'unknown error')
    return NextResponse.json({ error: 'We could not save that request. Please try again.' }, { status: 500 })
  }
}

