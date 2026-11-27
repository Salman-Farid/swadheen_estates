import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { can } from '@/lib/auth/rbac'
import { env } from '@/lib/env'
import { isSameOrigin } from '@/lib/security/validate-origin'

const VISIT_STATUSES = ['SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'] as const

// PATCH /api/admin/visits/[id] — update a visit's status.
export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!isSameOrigin(request))
    return NextResponse.json({ error: 'Request not allowed.' }, { status: 403 })
  const session = await auth()
  if (!session?.user)
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
  if (!can({ userId: session.user.id, role: session.user.role }, 'lead:write'))
    return NextResponse.json(
      { error: 'You do not have permission to update visits.' },
      { status: 403 },
    )
  if (!env.DATABASE_URL)
    return NextResponse.json({ error: 'The database is not configured.' }, { status: 503 })
  const { id } = await context.params
  const body = (await request.json().catch(() => null)) as { status?: unknown } | null
  const status = String(body?.status ?? '')
  if (!(VISIT_STATUSES as readonly string[]).includes(status))
    return NextResponse.json({ error: 'Unknown visit status.' }, { status: 400 })

  try {
    const { db } = await import('@/lib/db')
    const existing = await db.visit.findUnique({ where: { id }, select: { id: true } })
    if (!existing) return NextResponse.json({ error: 'Visit not found.' }, { status: 404 })
    const visit = await db.visit.update({
      where: { id },
      data: { status },
      include: {
        lead: { select: { id: true, name: true, phone: true } },
        agent: { select: { id: true, name: true } },
      },
    })
    return NextResponse.json({
      ok: true,
      visit: {
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
      },
    })
  } catch (error) {
    console.error('admin_visit_update_failed', error instanceof Error ? error.message : 'unknown error')
    return NextResponse.json({ error: 'The visit could not be updated.' }, { status: 500 })
  }
}
