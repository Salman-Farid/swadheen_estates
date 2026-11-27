import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { isSameOrigin } from '@/lib/security/validate-origin'
import { env } from '@/lib/env'

function noDb() {
  return NextResponse.json({ ok: false, error: 'Database is not configured.' }, { status: 503 })
}

async function staffSession() {
  const session = await auth()
  if (!session?.user) {
    return { error: NextResponse.json({ error: 'Authentication required.' }, { status: 401 }) }
  }
  if (session.user.role === 'CUSTOMER') {
    return {
      error: NextResponse.json(
        { error: 'You do not have permission to do that.' },
        { status: 403 },
      ),
    }
  }
  return { session }
}

// Register (or re-register) this device's FCM token for admin push alerts.
// Called by the mobile admin app after sign-in and on token refresh.
export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: 'Cross-origin request rejected.' }, { status: 403 })
  }
  const { session, error } = await staffSession()
  if (error) return error
  if (!env.DATABASE_URL) return noDb()

  let body: { token?: unknown; platform?: unknown }
  try {
    body = (await request.json()) as { token?: unknown; platform?: unknown }
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }
  const token = typeof body.token === 'string' ? body.token.trim() : ''
  if (token.length < 10 || token.length > 4096) {
    return NextResponse.json({ error: 'A valid push token is required.' }, { status: 400 })
  }
  const platform =
    typeof body.platform === 'string' && body.platform.length <= 20
      ? body.platform
      : 'android'

  try {
    const { db } = await import('@/lib/db')
    await db.adminPushToken.upsert({
      where: { token },
      create: { userId: session!.user.id, token, platform },
      update: { userId: session!.user.id, platform },
    })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('push_token_save_failed', error instanceof Error ? error.message : 'unknown')
    return NextResponse.json({ error: 'Could not save the push token.' }, { status: 500 })
  }
}

// Unregister a token (e.g. on sign-out).
export async function DELETE(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: 'Cross-origin request rejected.' }, { status: 403 })
  }
  const { error } = await staffSession()
  if (error) return error
  if (!env.DATABASE_URL) return noDb()

  let body: { token?: unknown }
  try {
    body = (await request.json()) as { token?: unknown }
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }
  const token = typeof body.token === 'string' ? body.token.trim() : ''
  if (!token) return NextResponse.json({ error: 'A push token is required.' }, { status: 400 })

  try {
    const { db } = await import('@/lib/db')
    await db.adminPushToken.deleteMany({ where: { token } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('push_token_delete_failed', error instanceof Error ? error.message : 'unknown')
    return NextResponse.json({ error: 'Could not remove the push token.' }, { status: 500 })
  }
}
