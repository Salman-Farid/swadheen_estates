import { NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { can } from '@/lib/auth/rbac'
import { env } from '@/lib/env'
import { isSameOrigin } from '@/lib/security/validate-origin'

const heroImageInputSchema = z.object({
  url: z.string().trim().url().max(2000),
  sortOrder: z.number().int().min(0).max(999).default(0),
})

async function requireManager() {
  const session = await auth()
  if (!session?.user) return null
  if (!can({ userId: session.user.id, role: session.user.role }, 'property:write')) return null
  return session
}

// All hero screen images for the admin panel, in display order.
export async function GET() {
  const session = await requireManager()
  if (!session) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
  if (!env.DATABASE_URL) return NextResponse.json([])
  try {
    const { db } = await import('@/lib/db')
    const rows = await db.heroImage.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    })
    return NextResponse.json(rows)
  } catch (error) {
    console.error('hero_image_list_failed', error instanceof Error ? error.message : 'unknown error')
    return NextResponse.json({ error: 'The hero images could not be loaded.' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: 'Request not allowed.' }, { status: 403 })
  const session = await requireManager()
  if (!session) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
  const parsed = heroImageInputSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success || !parsed.data.url.startsWith('https://'))
    return NextResponse.json({ error: 'Please provide a valid https image link.' }, { status: 400 })
  if (!env.DATABASE_URL) return NextResponse.json({ error: 'No database configured.' }, { status: 500 })
  try {
    const { db } = await import('@/lib/db')
    const image = await db.heroImage.create({ data: parsed.data })
    return NextResponse.json({ ok: true, image }, { status: 201 })
  } catch (error) {
    console.error('hero_image_create_failed', error instanceof Error ? error.message : 'unknown error')
    return NextResponse.json({ error: 'The hero image could not be saved.' }, { status: 500 })
  }
}
