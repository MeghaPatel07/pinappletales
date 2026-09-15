import { NextResponse } from 'next/server'
import { verifyAccessToken } from '@/lib/auth/jwt'

export async function GET(request: Request) {
  const header = request.headers.get('authorization') ?? ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''

  if (!token) {
    return NextResponse.json({ error: 'Missing credentials.' }, { status: 401 })
  }

  try {
    const { sub, email, name } = await verifyAccessToken(token)
    return NextResponse.json({ id: sub, email, name })
  } catch {
    return NextResponse.json({ error: 'Invalid or expired session.' }, { status: 401 })
  }
}
