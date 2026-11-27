import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { can } from '@/lib/auth/rbac'
import { env } from '@/lib/env'

const STAFF_ROLES = ['SUPER_ADMIN', 'MANAGER', 'SALES_AGENT', 'CONTENT_EDITOR'] as const

// GET /api/admin/staff — staff users for assignee / visit-agent pickers.
export async function GET() {
  const session = await auth()
  if (!session?.user)
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
  if (!can({ userId: session.user.id, role: session.user.role }, 'lead:read'))
    return NextResponse.json(
      { error: 'You do not have permission to view staff.' },
      { status: 403 },
    )
  if (!env.DATABASE_URL) return NextResponse.json({ ok: true, staff: [] })
  try {
    const { db } = await import('@/lib/db')
    const staff = await db.user.findMany({
      where: { role: { in: [...STAFF_ROLES] } },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, email: true, role: true },
    })
    return NextResponse.json({ ok: true, staff })
  } catch (error) {
    console.error('admin_staff_failed', error instanceof Error ? error.message : 'unknown error')
    return NextResponse.json({ error: 'Staff could not be loaded.' }, { status: 500 })
  }
}
