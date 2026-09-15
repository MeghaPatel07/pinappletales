import { NextResponse } from 'next/server'
import { listPodcasts } from '@/lib/content'

export async function GET() {
  const podcasts = await listPodcasts()
  return NextResponse.json(podcasts)
}
