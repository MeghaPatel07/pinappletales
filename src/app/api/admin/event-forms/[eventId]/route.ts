import { NextResponse, type NextRequest } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import { EventForm } from '@/lib/models/EventForm'

export async function GET(_request: NextRequest, { params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params
  await connectToDatabase()
  const doc = await EventForm.findOne({ eventId })
  if (!doc) return NextResponse.json({ error: 'Not found.' }, { status: 404 })
  return NextResponse.json(doc.toJSON())
}

/** Creates or replaces the form for this event — the document id is the event id. */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params
  await connectToDatabase()

  let data: Record<string, unknown>
  try {
    data = (await request.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const doc = await EventForm.findOneAndUpdate(
    { eventId },
    { ...data, eventId },
    { new: true, upsert: true, runValidators: true },
  )

  return NextResponse.json(doc.toJSON())
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params
  await connectToDatabase()
  await EventForm.findOneAndDelete({ eventId })
  return NextResponse.json({ ok: true })
}
