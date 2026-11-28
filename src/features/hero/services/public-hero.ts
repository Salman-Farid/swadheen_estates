import 'server-only'
import { env } from '@/lib/env'

// Hero screen images for the home page, served from the database so the
// admin panel controls what the hero shows. Returns null when there is no
// usable database (or it has never been seeded) so the caller falls back
// to the site's default hero image.
export async function getHeroImages(): Promise<string[] | null> {
  if (!env.DATABASE_URL) return null
  try {
    const { db } = await import('@/lib/db')
    const rows = await db.heroImage.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      select: { url: true },
    })
    if (rows.length === 0) return null
    return rows.map((row) => row.url)
  } catch (error) {
    console.error(
      'public_hero_images_failed',
      error instanceof Error ? error.message : 'unknown error',
    )
    return null
  }
}
