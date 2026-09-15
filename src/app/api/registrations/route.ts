/**
 * Public event-registration submissions.
 *
 * Anyone may create one (no auth) — mirrors the old Firestore rule that let
 * a visitor `create` but never `read` a registration. Reading them back is
 * an admin-only action, at /api/admin/registrations.
 */

import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import { EventRegistration } from '@/lib/models/EventRegistration'

const MAX_VALUES = 40
const MAX_PAYLOAD_BYTES = 20_000

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const { eventId, eventName, values } = (body ?? {}) as {
    eventId?: unknown
    eventName?: unknown
    values?: unknown
  }

  if (typeof eventId !== 'string' || !eventId || eventId.length > 128) {
    return NextResponse.json({ error: 'A valid eventId is required.' }, { status: 400 })
  }
  if (!values || typeof values !== 'object' || Array.isArray(values)) {
    return NextResponse.json({ error: 'values must be an object.' }, { status: 400 })
  }
  if (Object.keys(values as Record<string, unknown>).length > MAX_VALUES) {
    return NextResponse.json({ error: 'Too many fields submitted.' }, { status: 400 })
  }
  if (JSON.stringify(body).length > MAX_PAYLOAD_BYTES) {
    return NextResponse.json({ error: 'Submission is too large.' }, { status: 400 })
  }

  await connectToDatabase()
  await EventRegistration.create({
    eventId,
    eventName: typeof eventName === 'string' ? eventName : '',
    values,
  })

  return NextResponse.json({ ok: true }, { status: 201 })
}
