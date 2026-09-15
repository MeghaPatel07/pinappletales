import type { NextRequest } from 'next/server'
import { Event } from '@/lib/models/Event'
import { handleCreate, handleList } from '@/lib/adminCrud'

export async function GET(request: NextRequest) {
  return handleList(Event, request)
}

export async function POST(request: NextRequest) {
  return handleCreate(Event, request, { primaryField: 'isPrimary' })
}
