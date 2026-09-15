import type { NextRequest } from 'next/server'
import { Podcast } from '@/lib/models/Podcast'
import { handleCheckSlug } from '@/lib/adminCrud'

export async function GET(request: NextRequest) {
  return handleCheckSlug(Podcast, request)
}
