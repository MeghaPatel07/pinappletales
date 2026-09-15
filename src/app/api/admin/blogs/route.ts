import type { NextRequest } from 'next/server'
import { BlogPost } from '@/lib/models/BlogPost'
import { handleCreate, handleList } from '@/lib/adminCrud'

export async function GET(request: NextRequest) {
  return handleList(BlogPost, request)
}

export async function POST(request: NextRequest) {
  return handleCreate(BlogPost, request, { primaryField: 'isPrimary' })
}
