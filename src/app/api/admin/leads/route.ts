import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { can } from '@/lib/auth/rbac'
import { env } from '@/lib/env'

const LEAD_STAGES = [
  'NEW',
  'CONTACTED',
  'VISIT_SCHEDULED',
  'NEGOTIATION',
  'BOOKED',
  'CLOSED_WON',
  'CLOSED_LOST',
] as const

// GET /api/admin/leads — the full lead list for staff tools (the public
// /api/leads route only serves the newest 30 for the web panel's request
// cards). Supports ?take= (1-200, default 100) and ?stage= filters.
export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user)
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
  if (!can({ userId: session.user.id, role: session.user.role }, 'lead:read'))
    return NextResponse.json(
      { error: 'You do not have permission to view leads.' },
      { status: 403 },
    )
  if (!env.DATABASE_URL) return NextResponse.json({ ok: true, leads: [] })

  const params = new URL(request.url).searchParams
  const takeRaw = Number(params.get('take') ?? 100)
  const take = Number.isFinite(takeRaw) ? Math.min(200, Math.max(1, Math.floor(takeRaw))) : 100
  const stageParam = params.get('stage')
  const stage = (LEAD_STAGES as readonly string[]).includes(stageParam ?? '')
    ? (stageParam as (typeof LEAD_STAGES)[number])
    : undefined

  try {
    const { db } = await import('@/lib/db')
    const leads = await db.lead.findMany({
      where: stage ? { stage } : undefined,
      orderBy: { createdAt: 'desc' },
      take,
      include: {
        property: { select: { title: true, slug: true } },
        assignee: { select: { id: true, name: true } },
      },
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
        score: lead.score,
        property: lead.property?.title ?? null,
        propertySlug: lead.property?.slug ?? null,
        assignedTo: lead.assignedTo,
        assigneeName: lead.assignee?.name ?? null,
        nextFollow: lead.nextFollow ? lead.nextFollow.toISOString() : null,
        createdAt: lead.createdAt.toISOString(),
        updatedAt: lead.updatedAt.toISOString(),
      })),
    })
  } catch (error) {
    console.error('admin_lead_list_failed', error instanceof Error ? error.message : 'unknown error')
    return NextResponse.json({ error: 'Leads could not be loaded.' }, { status: 500 })
  }
}
