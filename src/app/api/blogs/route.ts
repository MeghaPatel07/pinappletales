import { NextResponse } from 'next/server'
import { listBlogPosts } from '@/lib/content'

export async function GET() {
  const posts = await listBlogPosts()
  return NextResponse.json(posts)
}
