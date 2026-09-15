/**
 * Shared handler bodies for the /api/admin/{blogs,events,podcasts,
 * testimonials} REST routes — list, get, create, update, delete and
 * check-slug all follow the same shape for every one of those collections,
 * so the logic lives here once and each route.ts just wires it to its model.
 *
 * Authentication is already enforced by middleware.ts before any of this
 * runs — these handlers assume the caller is a verified admin.
 */

import { NextResponse } from 'next/server'
import type { Model } from 'mongoose'
import { connectToDatabase } from '@/lib/db'

export const ADMIN_LIST_CAP = 500

type MongoDuplicateKeyError = { code?: number }

function isDuplicateKeyError(error: unknown): boolean {
  return Boolean(error && typeof error === 'object' && (error as MongoDuplicateKeyError).code === 11000)
}

export async function handleList(model: Model<Record<string, unknown>>, request: Request) {
  await connectToDatabase()
  const url = new URL(request.url)
  const orderBy = url.searchParams.get('orderBy')
  const direction = url.searchParams.get('direction') === 'asc' ? 1 : -1
  const max = Math.min(Number(url.searchParams.get('max') ?? ADMIN_LIST_CAP) || ADMIN_LIST_CAP, ADMIN_LIST_CAP)

  const query = model.find({})
  if (orderBy) query.sort({ [orderBy]: direction })
  const docs = await query.limit(max)

  return NextResponse.json(docs.map((doc) => doc.toJSON()))
}

export async function handleGet(model: Model<Record<string, unknown>>, id: string) {
  await connectToDatabase()
  const doc = await model.findById(id).catch(() => null)
  if (!doc) return NextResponse.json({ error: 'Not found.' }, { status: 404 })
  return NextResponse.json(doc.toJSON())
}

export async function handleCreate(
  model: Model<Record<string, unknown>>,
  request: Request,
  options: { primaryField?: string } = {},
) {
  await connectToDatabase()

  let data: Record<string, unknown>
  try {
    data = (await request.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  if (options.primaryField && data[options.primaryField]) {
    await model.updateMany({}, { [options.primaryField]: false })
  }

  try {
    const doc = await model.create(data)
    return NextResponse.json(doc.toJSON(), { status: 201 })
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return NextResponse.json({ error: 'That slug is already taken.' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Could not create the record.' }, { status: 400 })
  }
}

export async function handleUpdate(
  model: Model<Record<string, unknown>>,
  id: string,
  request: Request,
  options: { primaryField?: string } = {},
) {
  await connectToDatabase()

  let data: Record<string, unknown>
  try {
    data = (await request.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  if (options.primaryField && data[options.primaryField]) {
    await model.updateMany({ _id: { $ne: id } }, { [options.primaryField]: false })
  }

  try {
    const doc = await model.findByIdAndUpdate(id, data, { new: true, runValidators: true })
    if (!doc) return NextResponse.json({ error: 'Not found.' }, { status: 404 })
    return NextResponse.json(doc.toJSON())
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return NextResponse.json({ error: 'That slug is already taken.' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Could not update the record.' }, { status: 400 })
  }
}

export async function handleDelete(model: Model<Record<string, unknown>>, id: string) {
  await connectToDatabase()
  await model.findByIdAndDelete(id)
  return NextResponse.json({ ok: true })
}

export async function handleCheckSlug(model: Model<Record<string, unknown>>, request: Request) {
  await connectToDatabase()
  const url = new URL(request.url)
  const slug = url.searchParams.get('slug') ?? ''
  const exceptId = url.searchParams.get('exceptId') ?? ''

  if (!slug) return NextResponse.json({ taken: false })

  const query: Record<string, unknown> = { slug }
  if (exceptId) query._id = { $ne: exceptId }

  const existing = await model.findOne(query).select('_id')
  return NextResponse.json({ taken: Boolean(existing) })
}
