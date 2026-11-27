import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { env } from '@/lib/env'

// Staff-only aggregate numbers for the admin dashboard (web + mobile app).
// The web dashboard's KPI cards are static demo values; this route serves the
// real counts from the database.
const STAFF_ROLES = ['SUPER_ADMIN', 'MANAGER', 'SALES_AGENT', 'CONTENT_EDITOR']

export async function GET() {
  const session = await auth()
  if (!session?.user)
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
  const role = session.user.role
  if (!role || !STAFF_ROLES.includes(role))
    return NextResponse.json({ error: 'You do not have permission to view stats.' }, { status: 403 })
  if (!env.DATABASE_URL)
    return NextResponse.json({
      ok: true,
      stats: {
        propertiesTotal: 0,
        propertiesPublished: 0,
        propertiesDraft: 0,
        projects: 0,
        leadsTotal: 0,
        leadsByStage: {},
        customers: 0,
        upcomingVisits: 0,
        unreadNotifications: 0,
        availableValue: 0,
      },
      recentLeads: [],
    })
  try {
    const { db } = await import('@/lib/db')
    const now = new Date()
    const [
      propertiesTotal,
      propertiesPublished,
      propertiesDraft,
      projects,
      leadsTotal,
      leadsGrouped,
      customers,
      upcomingVisits,
      unreadNotifications,
      availableAgg,
      recentLeads,
    ] = await Promise.all([
      db.property.count(),
      db.property.count({ where: { status: 'PUBLISHED' } }),
      db.property.count({ where: { status: 'DRAFT' } }),
      db.project.count(),
      db.lead.count(),
      db.lead.groupBy({ by: ['stage'], _count: { _all: true } }),
      db.user.count({ where: { role: 'CUSTOMER' } }),
      db.visit.count({ where: { startsAt: { gte: now }, status: 'SCHEDULED' } }),
      db.notification.count({ where: { audience: 'ADMIN', readAt: null } }),
      db.property.aggregate({
        where: { inventory: 'AVAILABLE' },
        _sum: { priceMinor: true },
      }),
      db.lead.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { property: { select: { title: true, slug: true } } },
      }),
    ])
    const leadsByStage: Record<string, number> = {}
    for (const row of leadsGrouped) leadsByStage[row.stage] = row._count._all
    return NextResponse.json({
      ok: true,
      stats: {
        propertiesTotal,
        propertiesPublished,
        propertiesDraft,
        projects,
        leadsTotal,
        leadsByStage,
        customers,
        upcomingVisits,
        unreadNotifications,
        availableValue: availableAgg._sum.priceMinor ? Number(availableAgg._sum.priceMinor) : 0,
      },
      recentLeads: recentLeads.map((lead) => ({
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
    console.error('admin_stats_failed', error instanceof Error ? error.message : 'unknown error')
    return NextResponse.json({ error: 'Stats could not be loaded.' }, { status: 500 })
  }
}
