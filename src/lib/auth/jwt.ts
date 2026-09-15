/**
 * JWT signing and verification, shared by the login/refresh API routes and by
 * middleware.ts.
 *
 * Built on `jose` rather than `jsonwebtoken` specifically because `jose` runs
 * in both the Edge runtime (middleware) and the Node runtime (route
 * handlers) — one implementation verifies tokens in both places.
 */

import { jwtVerify, SignJWT } from 'jose'

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET ?? ''
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET ?? ''

const ACCESS_TTL = '15m'
const REFRESH_TTL = '30d'

export type AccessTokenPayload = { sub: string; email: string; name: string }
export type RefreshTokenPayload = { sub: string }

function key(secret: string): Uint8Array {
  if (!secret) {
    throw new Error(
      'JWT secret is not configured. Add JWT_ACCESS_SECRET and JWT_REFRESH_SECRET to .env.',
    )
  }
  return new TextEncoder().encode(secret)
}

export async function signAccessToken(payload: AccessTokenPayload): Promise<string> {
  return new SignJWT({ email: payload.email, name: payload.name })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(ACCESS_TTL)
    .sign(key(ACCESS_SECRET))
}

export async function signRefreshToken(payload: RefreshTokenPayload): Promise<string> {
  return new SignJWT({})
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(REFRESH_TTL)
    .sign(key(REFRESH_SECRET))
}

export async function verifyAccessToken(token: string): Promise<AccessTokenPayload> {
  const { payload } = await jwtVerify(token, key(ACCESS_SECRET))
  return {
    sub: String(payload.sub),
    email: String(payload.email ?? ''),
    name: String(payload.name ?? ''),
  }
}

export async function verifyRefreshToken(token: string): Promise<RefreshTokenPayload> {
  const { payload } = await jwtVerify(token, key(REFRESH_SECRET))
  return { sub: String(payload.sub) }
}

export const REFRESH_COOKIE = 'pt_admin_refresh'
// Must be readable on both /admin/* page navigations (middleware's page
// gate) and /api/auth/refresh, so it is scoped to the whole site rather than
// just the auth API.
export const REFRESH_COOKIE_PATH = '/'
export const REFRESH_MAX_AGE_SECONDS = 30 * 24 * 60 * 60
