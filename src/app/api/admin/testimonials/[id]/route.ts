import type { NextRequest } from 'next/server'
import { Testimonial } from '@/lib/models/Testimonial'
import { handleDelete, handleGet, handleUpdate } from '@/lib/adminCrud'

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return handleGet(Testimonial, id)
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return handleUpdate(Testimonial, id, request)
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return handleDelete(Testimonial, id)
}
