import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { can } from '@/lib/auth/rbac'
import { env } from '@/lib/env'
import { isSameOrigin } from '@/lib/security/validate-origin'

function visitPayload(visit: {
  id: string
  leadId: string
  agentId: string
  startsAt: Date
  endsAt: Date
  status: string
  createdAt: Date
  lead?: { id: string; name: string; phone: string } | null
  agent?: { id: string; name: string } | null
}) {
  return {
    id: visit.id,
    leadId: visit.leadId,
    leadName: visit.lead?.name ?? null,
    leadPhone: visit.lead?.phone ?? null,
    agentId: visit.agentId,
    agentName: visit.agent?.name ?? null,
    startsAt: visit.startsAt.toISOString(),
    endsAt: visit.endsAt.toISOString(),
    status: visit.status,
    createdAt: visit.createdAt.toISOString(),
  }
}

// GET /api/admin/visits — real scheduled visits (the web calendar surface is
// static demo cards). Optional ?from= / ?to= ISO date filters.
export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user)
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
  if (!can({ userId: session.user.id, role: session.user.role }, 'lead:read'))
    return NextResponse.json(
      { error: 'You do not have permission to view visits.' },
      { status: 403 },
    )
  if (!env.DATABASE_URL) return NextResponse.json({ ok: true, visits: [] })

  const params = new URL(request.url).searchParams
  const from = params.get('from') ? new Date(params.get('from') as string) : undefined
  const to = params.get('to') ? new Date(params.get('to') as string) : undefined
  const range: { gte?: Date; lte?: Date } = {}
  if (from && !Number.isNaN(from.getTime())) range.gte = from
  if (to && !Number.isNaN(to.getTime())) range.lte = to

  try {
    const { db } = await import('@/lib/db')
    const visits = await db.visit.findMany({
      where: Object.keys(range).length ? { startsAt: range } : undefined,
      orderBy: { startsAt: 'asc' },
      take: 200,
      include: {
        lead: { select: { id: true, name: true, phone: true } },
        agent: { select: { id: true, name: true } },
      },
    })
    return NextResponse.json({ ok: true, visits: visits.map(visitPayload) })
  } catch (error) {
    console.error('admin_visit_list_failed', error instanceof Error ? error.message : 'unknown error')
    return NextResponse.json({ error: 'Visits could not be loaded.' }, { status: 500 })
  }
}

// POST /api/admin/visits — schedule a visit for a lead with a staff agent.
export async function POST(request: Request) {
  if (!isSameOrigin(request))
    return NextResponse.json({ error: 'Request not allowed.' }, { status: 403 })
  const session = await auth()
  if (!session?.user)
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
  if (!can({ userId: session.user.id, role: session.user.role }, 'lead:write'))
    return NextResponse.json(
      { error: 'You do not have permission to schedule visits.' },
      { status: 403 },
    )
  if (!env.DATABASE_URL)
    return NextResponse.json({ error: 'The database is not configured.' }, { status: 503 })

  const body = (await request.json().catch(() => null)) as {
    leadId?: unknown
    agentId?: unknown
    startsAt?: unknown
    endsAt?: unknown
  } | null
  const leadId = typeof body?.leadId === 'string' ? body.leadId : ''
  const agentId = typeof body?.agentId === 'string' ? body.agentId : ''
  const startsAt = new Date(String(body?.startsAt ?? ''))
  const endsAt = new Date(String(body?.endsAt ?? ''))
  if (!leadId || !agentId || Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime()))
    return NextResponse.json({ error: 'Please pick a lead, an agent and a time.' }, { status: 400 })
  if (endsAt.getTime() <= startsAt.getTime())
    return NextResponse.json({ error: 'The visit must end after it starts.' }, { status: 400 })

  try {
    const { db } = await import('@/lib/db')
    const [lead, agent] = await Promise.all([
      db.lead.findUnique({ where: { id: leadId }, select: { id: true } }),
      db.user.findUnique({ where: { id: agentId }, select: { id: true } }),
    ])
    if (!lead) return NextResponse.json({ error: 'Lead not found.' }, { status: 404 })
    if (!agent) return NextResponse.json({ error: 'Agent not found.' }, { status: 404 })
    const visit = await db.visit.create({
      data: { leadId, agentId, startsAt, endsAt },
      include: {
        lead: { select: { id: true, name: true, phone: true } },
        agent: { select: { id: true, name: true } },
      },
    })
    return NextResponse.json({ ok: true, visit: visitPayload(visit) }, { status: 201 })
  } catch (error) {
    console.error('admin_visit_create_failed', error instanceof Error ? error.message : 'unknown error')
    return NextResponse.json({ error: 'The visit could not be scheduled.' }, { status: 500 })
  }
}
