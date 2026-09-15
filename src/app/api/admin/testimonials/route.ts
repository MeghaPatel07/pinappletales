import type { NextRequest } from 'next/server'
import { Testimonial } from '@/lib/models/Testimonial'
import { handleCreate, handleList } from '@/lib/adminCrud'

export async function GET(request: NextRequest) {
  return handleList(Testimonial, request)
}

export async function POST(request: NextRequest) {
  return handleCreate(Testimonial, request)
}
