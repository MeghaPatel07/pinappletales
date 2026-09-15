import { NextResponse } from 'next/server'
import { getPrimaryEvent } from '@/lib/content'

export async function GET() {
  const event = await getPrimaryEvent()
  return NextResponse.json(event)
}
