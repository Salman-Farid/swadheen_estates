import { NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { can } from '@/lib/auth/rbac'
import { env } from '@/lib/env'
import { isSameOrigin } from '@/lib/security/validate-origin'

const heroImagePatchSchema = z.object({
  url: z.string().trim().url().max(2000).optional(),
  sortOrder: z.number().int().min(0).max(999).optional(),
})

async function authorize(request: Request) {
  if (!isSameOrigin(request))
    return { response: NextResponse.json({ error: 'Request not allowed.' }, { status: 403 }) }
  const session = await auth()
  if (!session?.user)
    return { response: NextResponse.json({ error: 'Authentication required.' }, { status: 401 }) }
  if (!can({ userId: session.user.id, role: session.user.role }, 'property:write'))
    return {
      response: NextResponse.json(
        { error: 'You do not have permission to manage hero images.' },
        { status: 403 },
      ),
    }
  return { session }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const access = await authorize(request)
  if ('response' in access) return access.response
  const { id } = await context.params
  const body = await request.json().catch(() => null)
  const parsed = heroImagePatchSchema.safeParse(body)
  if (!parsed.success || (parsed.data.url && !parsed.data.url.startsWith('https://')))
    return NextResponse.json({ error: 'Please check the hero image details.' }, { status: 400 })
  if (!env.DATABASE_URL) return NextResponse.json({ ok: true, persisted: false, id })
  try {
    const { db } = await import('@/lib/db')
    const image = await db.heroImage.update({ where: { id }, data: parsed.data })
    return NextResponse.json({ ok: true, persisted: true, image })
  } catch (error) {
    console.error('hero_image_update_failed', error instanceof Error ? error.message : 'unknown error')
    return NextResponse.json({ error: 'The hero image could not be updated.' }, { status: 500 })
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const access = await authorize(request)
  if ('response' in access) return access.response
  const { id } = await context.params
  if (!env.DATABASE_URL) return NextResponse.json({ ok: true, persisted: false, id })
  try {
    const { db } = await import('@/lib/db')
    await db.heroImage.delete({ where: { id } })
    return NextResponse.json({ ok: true, persisted: true, id })
  } catch (error) {
    console.error('hero_image_delete_failed', error instanceof Error ? error.message : 'unknown error')
    return NextResponse.json({ error: 'The hero image could not be removed.' }, { status: 500 })
  }
}
