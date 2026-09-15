import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import { AdminUser } from '@/lib/models/AdminUser'
import { verifyPassword } from '@/lib/auth/password'
import {
  REFRESH_COOKIE,
  REFRESH_COOKIE_PATH,
  REFRESH_MAX_AGE_SECONDS,
  signAccessToken,
  signRefreshToken,
} from '@/lib/auth/jwt'

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const { email, password } = (body ?? {}) as { email?: unknown; password?: unknown }

  if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
    return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 })
  }

  await connectToDatabase()
  const user = await AdminUser.findOne({ email: email.trim().toLowerCase() })

  const passwordHash = (user?.get('passwordHash') as string | undefined) ?? ''
  const valid = user ? await verifyPassword(password, passwordHash) : false

  if (!user || !valid) {
    return NextResponse.json({ error: 'Incorrect email or password.' }, { status: 401 })
  }

  const id = String(user._id)
  const name = String(user.get('name') ?? '')
  const userEmail = String(user.get('email') ?? '')

  const accessToken = await signAccessToken({ sub: id, email: userEmail, name })
  const refreshToken = await signRefreshToken({ sub: id })

  const response = NextResponse.json({
    accessToken,
    user: { id, email: userEmail, name },
  })

  response.cookies.set(REFRESH_COOKIE, refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: REFRESH_COOKIE_PATH,
    maxAge: REFRESH_MAX_AGE_SECONDS,
  })

  return response
}
