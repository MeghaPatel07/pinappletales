import type { NextRequest } from 'next/server'
import { Event } from '@/lib/models/Event'
import { handleDelete, handleGet, handleUpdate } from '@/lib/adminCrud'

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return handleGet(Event, id)
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return handleUpdate(Event, id, request, { primaryField: 'isPrimary' })
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return handleDelete(Event, id)
}
