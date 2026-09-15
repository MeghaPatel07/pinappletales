import type { NextRequest } from 'next/server'
import { Podcast } from '@/lib/models/Podcast'
import { handleDelete, handleGet, handleUpdate } from '@/lib/adminCrud'

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return handleGet(Podcast, id)
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return handleUpdate(Podcast, id, request)
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return handleDelete(Podcast, id)
}
