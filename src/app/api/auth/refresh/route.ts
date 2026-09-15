import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { connectToDatabase } from '@/lib/db'
import { AdminUser } from '@/lib/models/AdminUser'
import { REFRESH_COOKIE, signAccessToken, verifyRefreshToken } from '@/lib/auth/jwt'

export async function POST() {
  const store = await cookies()
  const token = store.get(REFRESH_COOKIE)?.value ?? ''

  if (!token) {
    return NextResponse.json({ error: 'Not signed in.' }, { status: 401 })
  }

  let subject: string
  try {
    ;({ sub: subject } = await verifyRefreshToken(token))
  } catch {
    return NextResponse.json({ error: 'Session expired. Please sign in again.' }, { status: 401 })
  }

  await connectToDatabase()
  const user = await AdminUser.findById(subject)
  if (!user) {
    return NextResponse.json({ error: 'Account no longer exists.' }, { status: 401 })
  }

  const id = String(user._id)
  const email = String(user.get('email') ?? '')
  const name = String(user.get('name') ?? '')

  const accessToken = await signAccessToken({ sub: id, email, name })

  return NextResponse.json({ accessToken, user: { id, email, name } })
}
