import { NextResponse, type NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const nonce = btoa(crypto.randomUUID()).replace(/=/g, '')
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)
  const isPropertyDetail = request.nextUrl.pathname.startsWith('/properties/')
  const csp = [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "img-src 'self' data: https://images.unsplash.com https://images.pexels.com https://i.ytimg.com https://*.blob.vercel-storage.com",
    "media-src 'self' https:",
    "font-src 'self' https://fonts.gstatic.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "frame-src 'self' https://www.youtube-nocookie.com https://www.youtube.com https://www.google.com https://maps.google.com",
    // Next.js emits both external runtime chunks and inline hydration payloads.
    // Keep same-origin scripts working in production; the nonce remains available
    // to application scripts that opt into it.
    `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === 'development' ? " 'unsafe-eval'" : ''}`,
    "connect-src 'self' https://api.mapbox.com https://events.mapbox.com",
    isPropertyDetail ? "worker-src 'self' blob:" : "worker-src 'self'",
  ].join('; ')
  const response = NextResponse.next({ request: { headers: requestHeaders } })
  response.headers.set('Content-Security-Policy', csp)
  response.headers.set('X-Nonce', nonce)
  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
