/**
 * The one authentication middleware, covering both the admin pages and the
 * admin API:
 *
 *   /admin/*      (except /admin/login) — verifies the refresh-token cookie
 *                 (signature + expiry only, no DB call) and redirects to
 *                 /admin/login when it is missing or invalid.
 *
 *   /api/admin/*  — verifies the `Authorization: Bearer <accessToken>`
 *                   header and returns 401 JSON when it is missing or
 *                   invalid. On success, the verified identity is forwarded
 *                   to the route handler as x-admin-id / x-admin-email /
 *                   x-admin-name headers — see lib/auth/adminSession.ts.
 *
 * Runs on the Edge runtime, which is why token verification goes through
 * `jose` rather than `jsonwebtoken`.
 */

import { jwtVerify } from 'jose'
import { NextResponse, type NextRequest } from 'next/server'
import { REFRESH_COOKIE } from '@/lib/auth/jwt'

function key(secret: string): Uint8Array {
  return new TextEncoder().encode(secret)
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/api/admin')) {
    const header = request.headers.get('authorization') ?? ''
    const token = header.startsWith('Bearer ') ? header.slice(7) : ''

    if (!token) {
      return NextResponse.json({ error: 'Missing credentials.' }, { status: 401 })
    }

    try {
      const { payload } = await jwtVerify(token, key(process.env.JWT_ACCESS_SECRET ?? ''))

      const forwarded = new Headers(request.headers)
      forwarded.set('x-admin-id', String(payload.sub ?? ''))
      forwarded.set('x-admin-email', String(payload.email ?? ''))
      forwarded.set('x-admin-name', String(payload.name ?? ''))

      return NextResponse.next({ request: { headers: forwarded } })
    } catch {
      return NextResponse.json({ error: 'Invalid or expired session.' }, { status: 401 })
    }
  }

  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const token = request.cookies.get(REFRESH_COOKIE)?.value ?? ''

    const loginUrl = new URL('/admin/login', request.url)
    loginUrl.searchParams.set('from', pathname + request.nextUrl.search)

    if (!token) {
      return NextResponse.redirect(loginUrl)
    }

    try {
      await jwtVerify(token, key(process.env.JWT_REFRESH_SECRET ?? ''))
      return NextResponse.next()
    } catch {
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
