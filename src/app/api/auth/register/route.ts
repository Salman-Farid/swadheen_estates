import { hashPassword } from '@/lib/password'
import { NextResponse } from 'next/server'
import { registerSchema } from '@/features/auth/schemas/register.schema'
import { checkRateLimit } from '@/lib/security/rate-limit'
import { isSameOrigin } from '@/lib/security/validate-origin'

function getClientKey(request: Request) {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'local-client'
}

// Public sign-up. Creates a CUSTOMER account; the client signs in with the
// credentials provider immediately afterwards.
export async function POST(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: 'Request not allowed.' }, { status: 403 })

  const rateLimit = checkRateLimit(`register:${getClientKey(request)}`, 3, 60_000)
  if (!rateLimit.allowed)
    return NextResponse.json({ error: 'Too many requests. Please try again shortly.' }, { status: 429 })

  let raw: unknown
  try {
    raw = await request.json()
  } catch {
    return NextResponse.json({ error: 'Please send a valid request.' }, { status: 400 })
  }

  const parsed = registerSchema.safeParse(raw)
  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Please check the highlighted details and try again.' },
      { status: 400 },
    )

  if (!process.env.DATABASE_URL)
    return NextResponse.json({ error: 'Account creation is unavailable right now.' }, { status: 503 })

  try {
    const { db } = await import('@/lib/db')
    const email = parsed.data.email
    const existing = await db.user.findUnique({ where: { email }, select: { id: true } })
    if (existing)
      return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 })

    const passwordHash = await hashPassword(parsed.data.password)
    const user = await db.user.create({
      data: { name: parsed.data.name, email, passwordHash, role: 'CUSTOMER' },
    })
    // Best-effort: ping the admin panel so new sign-ups are visible there.
    try {
      await db.notification.create({
        data: {
          audience: 'ADMIN',
          type: 'NEW_ACCOUNT',
          title: user.name,
          body: user.email,
          link: '/admin/leads',
        },
      })
    } catch (notificationError) {
      console.error(
        'register_notification_failed',
        notificationError instanceof Error ? notificationError.message : 'unknown error',
      )
    }
    return NextResponse.json({ ok: true }, { status: 201 })
  } catch (error) {
    // Unique-constraint race: two submissions with the same email at once.
    if ((error as { code?: string })?.code === 'P2002')
      return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 })
    console.error('register_failed', error instanceof Error ? error.message : 'unknown error')
    return NextResponse.json(
      { error: 'We could not create your account. Please try again.' },
      { status: 500 },
    )
  }
}

