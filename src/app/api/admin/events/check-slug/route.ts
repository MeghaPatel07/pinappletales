import type { NextRequest } from 'next/server'
import { Event } from '@/lib/models/Event'
import { handleCheckSlug } from '@/lib/adminCrud'

export async function GET(request: NextRequest) {
  return handleCheckSlug(Event, request)
}
