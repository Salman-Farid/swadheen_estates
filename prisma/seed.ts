import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/lib/password'

const prisma = new PrismaClient()

// Demo seeding (sample project, videos, static catalogue sync and the example
// lead) was removed on 2026-11-28 at the owner's request: the admin panel must
// start empty and hold only real data. The seed now only ensures the manager
// account exists; its display name is just "Admin" (owner's instruction,
// 2026-11-28) — no personal name.
async function main() {
  await prisma.user.upsert({
    where: { email: 'manager@swadheen.example' },
    update: { name: 'Admin' },
    create: {
      email: 'manager@swadheen.example',
      name: 'Admin',
      role: 'MANAGER',
      passwordHash: process.env.SEED_ADMIN_PASSWORD
        ? await hashPassword(process.env.SEED_ADMIN_PASSWORD)
        : null,
    },
  })
}

main().finally(() => prisma.$disconnect())
