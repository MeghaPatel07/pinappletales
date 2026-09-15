import { NextResponse, type NextRequest } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import { EventRegistration } from '@/lib/models/EventRegistration'
import { ADMIN_LIST_CAP } from '@/lib/adminCrud'

export async function GET(request: NextRequest) {
  await connectToDatabase()
  const url = new URL(request.url)
  const direction = url.searchParams.get('direction') === 'asc' ? 1 : -1
  const max = Math.min(Number(url.searchParams.get('max') ?? ADMIN_LIST_CAP) || ADMIN_LIST_CAP, ADMIN_LIST_CAP)

  const docs = await EventRegistration.find({}).sort({ createdAt: direction }).limit(max)
  return NextResponse.json(docs.map((doc) => doc.toJSON()))
}
