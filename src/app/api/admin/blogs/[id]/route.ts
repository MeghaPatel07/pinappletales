import type { NextRequest } from 'next/server'
import { BlogPost } from '@/lib/models/BlogPost'
import { handleDelete, handleGet, handleUpdate } from '@/lib/adminCrud'

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return handleGet(BlogPost, id)
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return handleUpdate(BlogPost, id, request, { primaryField: 'isPrimary' })
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return handleDelete(BlogPost, id)
}
