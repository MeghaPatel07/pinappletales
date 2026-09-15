/**
 * Cloudinary upload signing endpoint.
 *
 * Replaces the old api/cloudinary-sign.js (which verified a Firebase ID
 * token): the caller here is already verified by middleware.ts before this
 * handler runs, since the route sits under /api/admin/**.
 */

import { NextResponse, type NextRequest } from 'next/server'

const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY ?? ''
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET ?? ''
const CLOUDINARY_CLOUD_NAME =
  process.env.CLOUDINARY_CLOUD_NAME ?? process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? ''

async function sha1Hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(input))
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

export async function POST(request: NextRequest) {
  if (!CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET || !CLOUDINARY_CLOUD_NAME) {
    return NextResponse.json({ error: 'Cloudinary credentials are not configured.' }, { status: 500 })
  }

  let body: Record<string, unknown> = {}
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    // An empty body is fine — folder falls back to the default below.
  }

  const folder =
    typeof body.folder === 'string' && /^[\w/-]{1,100}$/.test(body.folder)
      ? body.folder
      : 'pineappletales'

  const timestamp = Math.floor(Date.now() / 1000)

  const signature = await sha1Hex(
    `folder=${folder}&timestamp=${timestamp}${CLOUDINARY_API_SECRET}`,
  )

  return NextResponse.json({
    signature,
    timestamp,
    apiKey: CLOUDINARY_API_KEY,
    cloudName: CLOUDINARY_CLOUD_NAME,
    folder,
  })
}
