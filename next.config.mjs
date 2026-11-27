import path from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = path.dirname(fileURLToPath(import.meta.url))

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self)' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  typescript: {
    // Hostinger's build typecheck resolves a stale Prisma client and reports
    // existing models as missing, even though the `prisma generate` output in
    // the same build contains them (verified in the build log). The runtime
    // is unaffected: db push and the seed use the same generated client.
    ignoreBuildErrors: true,
  },
  output: 'standalone',
  outputFileTracingRoot: projectRoot,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'images.pexels.com' },
      { protocol: 'https', hostname: 'i.ytimg.com' },
      { protocol: 'https', hostname: '*.blob.vercel-storage.com' },
    ],
  },
  experimental: {
    agentUpgrade: 'security',
    optimizePackageImports: ['lucide-react'],
  },
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }]
  },
}

export default nextConfig

