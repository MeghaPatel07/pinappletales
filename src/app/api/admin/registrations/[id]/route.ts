import { NextResponse, type NextRequest } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import { EventRegistration } from '@/lib/models/EventRegistration'

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await connectToDatabase()
  await EventRegistration.findByIdAndDelete(id)
  return NextResponse.json({ ok: true })
}
