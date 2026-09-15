import { NextResponse } from 'next/server'
import { getPodcastBySlug } from '@/lib/content'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  const podcast = await getPodcastBySlug(slug)
  if (!podcast) return NextResponse.json({ error: 'Not found.' }, { status: 404 })
  return NextResponse.json(podcast)
}
