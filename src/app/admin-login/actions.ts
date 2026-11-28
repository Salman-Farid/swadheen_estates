'use server'

import { AuthError } from 'next-auth'
import { signIn } from '@/auth'

// The admin panel signs in with a password only — no email field. The
// account is fixed server-side: the seeded staff (manager) account whose
// password is the shared admin password.
const ADMIN_EMAIL = 'manager@swadheen.example'

export type AdminLoginState = { error?: string }

export async function adminPasswordLogin(
  _previous: AdminLoginState,
  formData: FormData,
): Promise<AdminLoginState> {
  const password = String(formData.get('password') ?? '')
  if (password.length < 8) return { error: 'পাসওয়ার্ড সঠিক নয়, আবার চেষ্টা করুন' }
  try {
    await signIn('credentials', { email: ADMIN_EMAIL, password, redirectTo: '/admin' })
  } catch (error) {
    if (error instanceof AuthError) return { error: 'পাসওয়ার্ড মেলেনি, আবার চেষ্টা করুন' }
    throw error
  }
  return {}
}
