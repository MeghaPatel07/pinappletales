import type { NextRequest } from 'next/server'
import { BlogPost } from '@/lib/models/BlogPost'
import { handleCheckSlug } from '@/lib/adminCrud'

export async function GET(request: NextRequest) {
  return handleCheckSlug(BlogPost, request)
}
