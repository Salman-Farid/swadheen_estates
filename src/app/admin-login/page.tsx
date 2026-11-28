import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { Logo } from '@/components/layout/logo'
import { AdminLoginForm } from './login-form'

export const metadata: Metadata = { title: 'এডমিন লগইন' }
export const dynamic = 'force-dynamic'

const STAFF_ROLES = ['SUPER_ADMIN', 'MANAGER', 'SALES_AGENT', 'CONTENT_EDITOR']

export default async function AdminLoginPage() {
  const session = await auth()
  const role = session?.user?.role
  if (session?.user && role && STAFF_ROLES.includes(role)) redirect('/admin')

  return (
    <main className="flex min-h-dvh items-center justify-center bg-white px-5 py-16">
      <div className="w-full max-w-sm rounded-panel border border-line bg-white p-8 text-center shadow-soft">
        <div className="flex justify-center">
          <Logo />
        </div>
        <h1 className="display-type mt-7 text-3xl text-ink">এডমিন প্যানেল</h1>
        <p className="mt-2 text-sm leading-6 text-ink/55">চালিয়ে যেতে আপনার পাসওয়ার্ড দিন</p>
        <AdminLoginForm />
      </div>
    </main>
  )
}
