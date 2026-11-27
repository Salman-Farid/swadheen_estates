import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { can } from '@/lib/auth/rbac'
import { env } from '@/lib/env'
import { isSameOrigin } from '@/lib/security/validate-origin'

// POST /api/admin/leads/[id]/activities — add a note to the lead's timeline.
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!isSameOrigin(request))
    return NextResponse.json({ error: 'Request not allowed.' }, { status: 403 })
  const session = await auth()
  if (!session?.user)
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
  if (!env.DATABASE_URL)
    return NextResponse.json({ error: 'The database is not configured.' }, { status: 503 })
  const { id } = await context.params
  const body = (await request.json().catch(() => null)) as { body?: unknown } | null
  const text = typeof body?.body === 'string' ? body.body.trim() : ''
  if (!text || text.length > 2000)
    return NextResponse.json({ error: 'Please write a note (up to 2000 characters).' }, { status: 400 })

  try {
    const { db } = await import('@/lib/db')
    const lead = await db.lead.findUnique({ where: { id }, select: { id: true, assignedTo: true } })
    if (!lead) return NextResponse.json({ error: 'Lead not found.' }, { status: 404 })
    if (
      !can(
        { userId: session.user.id, role: session.user.role },
        'lead:write',
        { assignedTo: lead.assignedTo ?? undefined },
      )
    )
      return NextResponse.json(
        { error: 'You do not have permission to update this lead.' },
        { status: 403 },
      )
    const activity = await db.leadActivity.create({
      data: { leadId: id, kind: 'NOTE', body: text },
    })
    return NextResponse.json(
      {
        ok: true,
        activity: {
          id: activity.id,
          kind: activity.kind,
          body: activity.body,
          createdAt: activity.createdAt.toISOString(),
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error('admin_lead_activity_failed', error instanceof Error ? error.message : 'unknown error')
    return NextResponse.json({ error: 'The note could not be saved.' }, { status: 500 })
  }
}
