import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { can } from '@/lib/auth/rbac'
import { env } from '@/lib/env'
import { isSameOrigin } from '@/lib/security/validate-origin'

const LEAD_STAGES = [
  'NEW',
  'CONTACTED',
  'VISIT_SCHEDULED',
  'NEGOTIATION',
  'BOOKED',
  'CLOSED_WON',
  'CLOSED_LOST',
] as const

function leadPayload(lead: {
  id: string
  name: string
  email: string
  phone: string
  note: string | null
  stage: string
  source: string
  score: number
  propertyId: string | null
  assignedTo: string | null
  nextFollow: Date | null
  createdAt: Date
  updatedAt: Date
  property?: { title: string; slug: string } | null
  assignee?: { id: string; name: string } | null
  activities?: Array<{ id: string; kind: string; body: string; createdAt: Date }>
  visits?: Array<{
    id: string
    startsAt: Date
    endsAt: Date
    status: string
    agent?: { id: string; name: string } | null
  }>
}) {
  return {
    id: lead.id,
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    note: lead.note,
    stage: lead.stage,
    source: lead.source,
    score: lead.score,
    propertyId: lead.propertyId,
    property: lead.property?.title ?? null,
    propertySlug: lead.property?.slug ?? null,
    assignedTo: lead.assignedTo,
    assigneeName: lead.assignee?.name ?? null,
    nextFollow: lead.nextFollow ? lead.nextFollow.toISOString() : null,
    createdAt: lead.createdAt.toISOString(),
    updatedAt: lead.updatedAt.toISOString(),
    activities: (lead.activities ?? []).map((activity) => ({
      id: activity.id,
      kind: activity.kind,
      body: activity.body,
      createdAt: activity.createdAt.toISOString(),
    })),
    visits: (lead.visits ?? []).map((visit) => ({
      id: visit.id,
      startsAt: visit.startsAt.toISOString(),
      endsAt: visit.endsAt.toISOString(),
      status: visit.status,
      agentId: visit.agent?.id ?? null,
      agentName: visit.agent?.name ?? null,
    })),
  }
}

// GET /api/admin/leads/[id] — one lead with its activity timeline and visits.
export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user)
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
  if (!can({ userId: session.user.id, role: session.user.role }, 'lead:read'))
    return NextResponse.json(
      { error: 'You do not have permission to view leads.' },
      { status: 403 },
    )
  if (!env.DATABASE_URL) return NextResponse.json({ error: 'Lead not found.' }, { status: 404 })
  const { id } = await context.params
  try {
    const { db } = await import('@/lib/db')
    const lead = await db.lead.findUnique({
      where: { id },
      include: {
        property: { select: { title: true, slug: true } },
        assignee: { select: { id: true, name: true } },
        activities: { orderBy: { createdAt: 'desc' } },
        visits: {
          orderBy: { startsAt: 'desc' },
          include: { agent: { select: { id: true, name: true } } },
        },
      },
    })
    if (!lead) return NextResponse.json({ error: 'Lead not found.' }, { status: 404 })
    return NextResponse.json({ ok: true, lead: leadPayload(lead) })
  } catch (error) {
    console.error('admin_lead_detail_failed', error instanceof Error ? error.message : 'unknown error')
    return NextResponse.json({ error: 'The lead could not be loaded.' }, { status: 500 })
  }
}

// PATCH /api/admin/leads/[id] — update stage, assignee, follow-up date or
// score. A stage change is recorded on the lead's activity timeline.
export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!isSameOrigin(request))
    return NextResponse.json({ error: 'Request not allowed.' }, { status: 403 })
  const session = await auth()
  if (!session?.user)
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
  if (!env.DATABASE_URL)
    return NextResponse.json({ error: 'The database is not configured.' }, { status: 503 })
  const { id } = await context.params
  const body = (await request.json().catch(() => null)) as {
    stage?: unknown
    assignedTo?: unknown
    nextFollow?: unknown
    score?: unknown
  } | null
  if (!body) return NextResponse.json({ error: 'Please send a valid request.' }, { status: 400 })

  try {
    const { db } = await import('@/lib/db')
    const existing = await db.lead.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Lead not found.' }, { status: 404 })
    if (
      !can(
        { userId: session.user.id, role: session.user.role },
        'lead:write',
        { assignedTo: existing.assignedTo ?? undefined },
      )
    )
      return NextResponse.json(
        { error: 'You do not have permission to update this lead.' },
        { status: 403 },
      )

    const data: {
      stage?: (typeof LEAD_STAGES)[number]
      assignedTo?: string | null
      nextFollow?: Date | null
      score?: number
    } = {}
    if (body.stage !== undefined) {
      if (!(LEAD_STAGES as readonly string[]).includes(String(body.stage)))
        return NextResponse.json({ error: 'Unknown lead stage.' }, { status: 400 })
      data.stage = body.stage as (typeof LEAD_STAGES)[number]
    }
    if (body.assignedTo !== undefined) {
      if (body.assignedTo !== null && typeof body.assignedTo !== 'string')
        return NextResponse.json({ error: 'Invalid assignee.' }, { status: 400 })
      data.assignedTo = body.assignedTo as string | null
    }
    if (body.nextFollow !== undefined) {
      if (body.nextFollow === null) data.nextFollow = null
      else {
        const when = new Date(String(body.nextFollow))
        if (Number.isNaN(when.getTime()))
          return NextResponse.json({ error: 'Invalid follow-up date.' }, { status: 400 })
        data.nextFollow = when
      }
    }
    if (body.score !== undefined) {
      const score = Number(body.score)
      if (!Number.isFinite(score))
        return NextResponse.json({ error: 'Invalid score.' }, { status: 400 })
      data.score = Math.min(100, Math.max(0, Math.round(score)))
    }
    if (Object.keys(data).length === 0)
      return NextResponse.json({ error: 'Nothing to update.' }, { status: 400 })

    const lead = await db.lead.update({
      where: { id },
      data,
      include: {
        property: { select: { title: true, slug: true } },
        assignee: { select: { id: true, name: true } },
        activities: { orderBy: { createdAt: 'desc' } },
        visits: {
          orderBy: { startsAt: 'desc' },
          include: { agent: { select: { id: true, name: true } } },
        },
      },
    })
    if (data.stage && data.stage !== existing.stage) {
      await db.leadActivity.create({
        data: { leadId: id, kind: 'STAGE', body: `Stage changed to ${data.stage}.` },
      })
    }
    return NextResponse.json({ ok: true, lead: leadPayload(lead) })
  } catch (error) {
    console.error('admin_lead_update_failed', error instanceof Error ? error.message : 'unknown error')
    return NextResponse.json({ error: 'The lead could not be updated.' }, { status: 500 })
  }
}
