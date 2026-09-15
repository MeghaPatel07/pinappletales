import { NextResponse } from 'next/server'
import { listHomeTestimonials } from '@/lib/content'

export async function GET() {
  const testimonials = await listHomeTestimonials()
  return NextResponse.json(testimonials)
}
