import { NextResponse } from 'next/server'
import { listEvents } from '@/lib/content'

export async function GET() {
  const events = await listEvents()
  return NextResponse.json(events)
}
