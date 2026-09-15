import { NextResponse } from 'next/server'
import { REFRESH_COOKIE, REFRESH_COOKIE_PATH } from '@/lib/auth/jwt'

export async function POST() {
  const response = NextResponse.json({ ok: true })
  response.cookies.set(REFRESH_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: REFRESH_COOKIE_PATH,
    maxAge: 0,
  })
  return response
}
