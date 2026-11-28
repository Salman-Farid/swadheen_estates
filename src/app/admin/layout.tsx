import { redirect } from 'next/navigation'
import { auth } from '@/auth'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await auth()
  const role = session?.user?.role
  if (!session?.user || !role || !['SUPER_ADMIN', 'MANAGER', 'SALES_AGENT', 'CONTENT_EDITOR'].includes(role))
    redirect('/admin-login')
  return children
}

