import 'server-only'
import type { ProjectVideo } from '@/types/video'
import { env } from '@/lib/env'

// Published videos for the public site, served from the database so the
// admin panel controls everything the visitor sees — the Shorts, the wide
// films. Returns null when there
// is no usable database (or it has never been seeded) so callers fall back
// to the static catalogue in data/videos.
export async function getPublicVideos(): Promise<ProjectVideo[] | null> {
  if (!env.DATABASE_URL) return null
  try {
    const { db } = await import('@/lib/db')
    const rows = await db.projectVideo.findMany({
      where: { published: true },
      include: { project: { select: { slug: true, name: true } } },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    })
    if (rows.length === 0) {
      const total = await db.projectVideo.count()
      if (total === 0) return null
    }
    return rows.map((row) => ({
      id: row.id,
      projectSlug: row.project?.slug ?? '',
      projectName: row.project?.name ?? '',
      kind: row.kind,
      title: row.title,
      description: row.description,
      youtubeUrl: row.youtubeUrl,
      youtubeId: row.youtubeId,
      thumbnailUrl: row.thumbnailUrl,
      published: row.published,
      sortOrder: row.sortOrder,
    }))
  } catch (error) {
    console.error(
      'public_videos_failed',
      error instanceof Error ? error.message : 'unknown error',
    )
    return null
  }
}
