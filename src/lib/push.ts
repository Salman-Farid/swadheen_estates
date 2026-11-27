import { createSign } from 'node:crypto'

/**
 * Push alerts to the admin mobile app via Firebase Cloud Messaging
 * (HTTP v1 API, service-account JWT — no extra dependencies).
 *
 * Completely optional: until the FIREBASE_SERVICE_ACCOUNT env var (the
 * service-account JSON, as a single line) is set on the host, every call
 * is a no-op. Failures are logged and swallowed — a push problem must
 * never break the request that triggered it.
 */

type ServiceAccount = {
  project_id: string
  client_email: string
  private_key: string
}

let cachedToken: { value: string; expiresAt: number } | null = null

function serviceAccount(): ServiceAccount | null {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as ServiceAccount
    if (!parsed.project_id || !parsed.client_email || !parsed.private_key) return null
    return parsed
  } catch {
    console.error('push_config_invalid', 'FIREBASE_SERVICE_ACCOUNT is not valid JSON')
    return null
  }
}

function base64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
}

async function accessToken(sa: ServiceAccount): Promise<string | null> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) return cachedToken.value
  try {
    const now = Math.floor(Date.now() / 1000)
    const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
    const claims = base64url(
      JSON.stringify({
        iss: sa.client_email,
        scope: 'https://www.googleapis.com/auth/firebase.messaging',
        aud: 'https://oauth2.googleapis.com/token',
        iat: now,
        exp: now + 3600,
      }),
    )
    const signer = createSign('RSA-SHA256')
    signer.update(`${header}.${claims}`)
    const signature = base64url(signer.sign(sa.private_key))
    const jwt = `${header}.${claims}.${signature}`

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt,
      }),
    })
    if (!response.ok) {
      console.error('push_token_failed', response.status)
      return null
    }
    const body = (await response.json()) as { access_token: string; expires_in: number }
    cachedToken = {
      value: body.access_token,
      expiresAt: Date.now() + body.expires_in * 1000,
    }
    return cachedToken.value
  } catch (error) {
    console.error('push_token_failed', error instanceof Error ? error.message : 'unknown error')
    return null
  }
}

export async function sendAdminPush(input: {
  title: string
  body: string
  data?: Record<string, string>
}): Promise<void> {
  const sa = serviceAccount()
  if (!sa || !process.env.DATABASE_URL) return
  try {
    const token = await accessToken(sa)
    if (!token) return
    const { db } = await import('@/lib/db')
    const rows = await db.adminPushToken.findMany({ select: { id: true, token: true } })
    if (rows.length === 0) return

    await Promise.all(
      rows.map(async (row) => {
        try {
          const response = await fetch(
            `https://fcm.googleapis.com/v1/projects/${sa.project_id}/messages:send`,
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                message: {
                  token: row.token,
                  notification: { title: input.title, body: input.body },
                  data: input.data ?? {},
                  android: {
                    priority: 'HIGH',
                    notification: { channel_id: 'estates_admin_alerts' },
                  },
                },
              }),
            },
          )
          if (!response.ok) {
            const text = await response.text()
            // Dead token (app uninstalled / token rotated): stop sending to it.
            if (text.includes('UNREGISTERED') || text.includes('INVALID_ARGUMENT')) {
              await db.adminPushToken.delete({ where: { id: row.id } }).catch(() => undefined)
            } else {
              console.error('push_send_failed', response.status)
            }
          }
        } catch (error) {
          console.error(
            'push_send_failed',
            error instanceof Error ? error.message : 'unknown error',
          )
        }
      }),
    )
  } catch (error) {
    console.error('push_send_failed', error instanceof Error ? error.message : 'unknown error')
  }
}
