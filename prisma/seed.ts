import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/lib/password'
import { properties as catalogue } from '../src/data/properties'
import { buildPropertyWriteData } from '../src/features/listings/services/property-persistence'

const prisma = new PrismaClient()

const seedImages = [
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=85',
  'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1600&q=85',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85',
  'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1600&q=85',
]

// The static catalogue in src/data/properties.ts is the canonical copy of the
// public listings; this sync mirrors every entry into the Property table
// (slug-keyed, full overwrite) so the DB-backed pages render the same set.
// Admin edits made later are preserved until the next seed run.
async function syncCatalogue() {
  for (const [index, property] of catalogue.entries()) {
    const projectSlug = property.projectSlug?.trim()
    const project = projectSlug
      ? await prisma.project.findUnique({ where: { slug: projectSlug }, select: { id: true } })
      : null
    const { projectSlug: _projectSlug, ...data } = buildPropertyWriteData(property, {
      sortOrder: index,
    })
    await prisma.property.upsert({
      where: { slug: property.slug },
      update: data,
      create: { ...data, projectId: project?.id ?? null },
    })
  }
}

async function main() {
  const manager = await prisma.user.upsert({
    where: { email: 'manager@swadheen.example' },
    update: {},
    create: {
      email: 'manager@swadheen.example',
      name: 'Ayesha Rahman',
      role: 'MANAGER',
      passwordHash: process.env.SEED_ADMIN_PASSWORD
        ? await hashPassword(process.env.SEED_ADMIN_PASSWORD)
        : null,
    },
  })

  const project = await prisma.project.upsert({
    where: { slug: 'the-grove-bashundhara' },
    update: {},
    create: {
      slug: 'the-grove-bashundhara',
      name: 'The Grove, Bashundhara',
      location: 'Bashundhara R/A, Dhaka',
      description: 'A low-density address shaped around shade, light and everyday rituals.',
      coverImage: seedImages[0] ?? '',
      totalUnits: 48,
    },
  })

  const videos = [
    {
      id: 'video-grove-short-01',
      kind: 'SHORT',
      title: 'Morning light at The Grove',
      description: 'A 30-second walk through the courtyard as the first light reaches home.',
      youtubeUrl: 'https://www.youtube.com/shorts/ScMzIvxBSi4',
      youtubeId: 'ScMzIvxBSi4',
      thumbnailUrl: 'https://i.ytimg.com/vi/ScMzIvxBSi4/hqdefault.jpg',
      sortOrder: 0,
    },
    {
      id: 'video-grove-short-02',
      kind: 'SHORT',
      title: 'A threshold made for shade',
      description: 'Small architectural details that make arrival feel different.',
      youtubeUrl: 'https://www.youtube.com/shorts/M7lc1UVf-VE',
      youtubeId: 'M7lc1UVf-VE',
      thumbnailUrl: 'https://i.ytimg.com/vi/M7lc1UVf-VE/hqdefault.jpg',
      sortOrder: 1,
    },
    {
      id: 'video-grove-film-01',
      kind: 'VIDEO',
      title: 'The Grove: a quieter kind of city life',
      description: 'A three-minute film about the landscape, light and daily rituals behind the project.',
      youtubeUrl: 'https://www.youtube.com/watch?v=ScMzIvxBSi4',
      youtubeId: 'ScMzIvxBSi4',
      thumbnailUrl: 'https://i.ytimg.com/vi/ScMzIvxBSi4/maxresdefault.jpg',
      sortOrder: 0,
    },
  ] as const
  for (const video of videos) {
    await prisma.projectVideo.upsert({
      where: { id: video.id },
      update: video,
      create: { ...video, projectId: project.id, published: true },
    })
  }

  await syncCatalogue()

  const existingLead = await prisma.lead.findFirst({ where: { email: 'nusrat@example.com' } })
  if (!existingLead) {
    await prisma.lead.create({
      data: {
        name: 'Nusrat Jahan',
        email: 'nusrat@example.com',
        phone: '+880 1712 345678',
        note: 'Looking for a three-bedroom home near Gulshan.',
        source: 'WEBSITE',
        score: 78,
        assignedTo: manager.id,
        activities: {
          create: { kind: 'NOTE', body: 'First enquiry received through the website.' },
        },
      },
    })
  }
}

main().finally(() => prisma.$disconnect())

