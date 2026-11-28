import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { videoInputSchema, parseYouTubeUrl } from '@/features/videos/schemas/video.schema'
import { can } from '@/lib/auth/rbac'
import { env } from '@/lib/env'
import { isSameOrigin } from '@/lib/security/validate-origin'

async function authorize(request: Request) {
  if (!isSameOrigin(request))
    return { response: NextResponse.json({ error: 'Request not allowed.' }, { status: 403 }) }
  const session = await auth()
  if (!session?.user)
    return { response: NextResponse.json({ error: 'Authentication required.' }, { status: 401 }) }
  if (!can({ userId: session.user.id, role: session.user.role }, 'property:write'))
    return {
      response: NextResponse.json(
        { error: 'You do not have permission to manage project videos.' },
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
  const parsed = videoInputSchema.partial().safeParse(body)
  if (!parsed.success)
    return NextResponse.json({ error: 'Please check the project video details.' }, { status: 400 })
  // Zod defaults survive .partial(), so a PATCH that only sends one field
  // would otherwise reset the others (sortOrder, description, views, likes).
  // Keep only the fields the client actually sent.
  const sentKeys = new Set(Object.keys(body ?? {}))
  const youtube = parsed.data.youtubeUrl ? parseYouTubeUrl(parsed.data.youtubeUrl) : null
  if (parsed.data.youtubeUrl && !youtube)
    return NextResponse.json({ error: 'Use a valid YouTube URL.' }, { status: 400 })
  if (!env.DATABASE_URL) return NextResponse.json({ ok: true, persisted: false, id })
  try {
    const { db } = await import('@/lib/db')
    const { projectSlug: _projectSlug, ...rest } = parsed.data
    const videoData = Object.fromEntries(
      Object.entries(rest).filter(([key]) => sentKeys.has(key)),
    )
    const video = await db.projectVideo.update({
      where: { id },
      data: {
        ...videoData,
        ...(youtube
          ? {
              youtubeId: youtube.youtubeId,
              youtubeUrl: youtube.normalizedUrl,
              thumbnailUrl: youtube.thumbnailUrl,
            }
          : {}),
      },
    })
    return NextResponse.json({ ok: true, persisted: true, video })
  } catch (error) {
    console.error('project_video_update_failed', error instanceof Error ? error.message : 'unknown error')
    return NextResponse.json({ error: 'The project video could not be updated.' }, { status: 500 })
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const access = await authorize(request)
  if ('response' in access) return access.response
  const { id } = await context.params
  if (!env.DATABASE_URL) return NextResponse.json({ ok: true, persisted: false, id })
  try {
    const { db } = await import('@/lib/db')
    await db.projectVideo.delete({ where: { id } })
    return NextResponse.json({ ok: true, persisted: true, id })
  } catch (error) {
    console.error('project_video_delete_failed', error instanceof Error ? error.message : 'unknown error')
    return NextResponse.json({ error: 'The project video could not be removed.' }, { status: 500 })
  }
}
