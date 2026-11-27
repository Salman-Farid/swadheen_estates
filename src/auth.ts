import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import type { Provider } from 'next-auth/providers'
import { verifyPassword } from '@/lib/password'
import { z } from 'zod'
import { db } from '@/lib/db'

const credentialsSchema = z.object({ email: z.string().email(), password: z.string().min(8) })

const providers: Provider[] = [
  Credentials({
    name: 'Email and password',
    credentials: {
      email: { label: 'Email', type: 'email' },
      password: { label: 'Password', type: 'password' },
    },
    async authorize(credentials) {
      const parsed = credentialsSchema.safeParse(credentials)
      if (!parsed.success) return null
      const user = await db.user.findUnique({
        where: { email: parsed.data.email.toLowerCase() },
        select: { id: true, name: true, email: true, role: true, passwordHash: true },
      })
      if (!user?.passwordHash || !(await verifyPassword(user.passwordHash, parsed.data.password))) return null
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role as 'SUPER_ADMIN' | 'MANAGER' | 'SALES_AGENT' | 'CONTENT_EDITOR' | 'CUSTOMER',
      }
    },
  }),
]

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({ clientId: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET }),
  )
}

const authSecret =
  process.env.AUTH_SECRET ?? (process.env.NODE_ENV === 'production' ? undefined : 'local-development-only')

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers,
  ...(authSecret ? { secret: authSecret } : {}),
  session: { strategy: 'jwt', maxAge: 60 * 60 * 8 },
  trustHost: true,
  callbacks: {
    jwt({ token, user, session, trigger }) {
      if (user) token.role = user.role
      // After a profile save the client calls update({ name }) — carry the
      // new name into the token so the header and profile menu show it at
      // once, without another sign-in.
      if (trigger === 'update' && session && typeof session === 'object') {
        const direct = (session as { name?: unknown }).name
        const nested = (session as { user?: { name?: unknown } }).user?.name
        const nextName = typeof direct === 'string' ? direct : typeof nested === 'string' ? nested : undefined
        if (nextName && nextName.trim().length > 0) token.name = nextName.trim()
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? ''
        session.user.role =
          (token.role as
            'SUPER_ADMIN' | 'MANAGER' | 'SALES_AGENT' | 'CONTENT_EDITOR' | 'CUSTOMER' | undefined) ??
          'CUSTOMER'
      }
      return session
    },
  },
  pages: { signIn: '/login' },
})

