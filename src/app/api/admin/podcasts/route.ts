import type { NextRequest } from 'next/server'
import { Podcast } from '@/lib/models/Podcast'
import { handleCreate, handleList } from '@/lib/adminCrud'

export async function GET(request: NextRequest) {
  return handleList(Podcast, request)
}

export async function POST(request: NextRequest) {
  return handleCreate(Podcast, request)
}
