import { randomBytes, scrypt, timingSafeEqual, type ScryptOptions } from 'node:crypto'

// Password hashing with Node's built-in scrypt — no native modules, so it
// runs on any host (the argon2 prebuilt binary needs a newer glibc than
// some shared hosts ship). Stored format:
//   scrypt$N$r$p$<salt base64>$<derived key base64>
const N = 16384
const R = 8
const P = 1
const KEYLEN = 64
const SALT_BYTES = 16

function scryptAsync(
  password: string,
  salt: Buffer,
  keylen: number,
  options: ScryptOptions,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, keylen, options, (error, derived) => {
      if (error) reject(error)
      else resolve(derived)
    })
  })
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_BYTES)
  const derived = await scryptAsync(password, salt, KEYLEN, { N, r: R, p: P })
  return ['scrypt', N, R, P, salt.toString('base64'), derived.toString('base64')].join('$')
}

export async function verifyPassword(stored: string, password: string): Promise<boolean> {
  const parts = stored.split('$')
  if (parts.length !== 6 || parts[0] !== 'scrypt') return false
  const n = Number(parts[1])
  const r = Number(parts[2])
  const p = Number(parts[3])
  if (!Number.isInteger(n) || !Number.isInteger(r) || !Number.isInteger(p)) return false
  const salt = Buffer.from(parts[4] ?? '', 'base64')
  const expected = Buffer.from(parts[5] ?? '', 'base64')
  if (salt.length === 0 || expected.length === 0) return false
  const derived = await scryptAsync(password, salt, expected.length, { N: n, r, p })
  return derived.length === expected.length && timingSafeEqual(derived, expected)
}
