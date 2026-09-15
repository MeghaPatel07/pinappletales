import { NextResponse } from 'next/server'
import { getEventForm } from '@/lib/content'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ eventId: string }> },
) {
  const { eventId } = await params
  const form = await getEventForm(eventId)
  return NextResponse.json(form)
}
