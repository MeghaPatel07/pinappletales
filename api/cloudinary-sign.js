/**
 * Cloudinary upload signing endpoint — the opt-in signed upload path.
 *
 * Deploy this alongside the static site and point VITE_CLOUDINARY_SIGNATURE_URL
 * at it (e.g. `/api/cloudinary-sign`). Leave that variable empty and the admin
 * keeps using the unsigned preset instead; nothing here is required.
 *
 * Written against web standards (Request in, Response out) so it runs unchanged
 * on Vercel, Netlify Functions v2 and Cloudflare Pages. Signing uses Web Crypto
 * rather than node:crypto for the same reason.
 *
 * Required environment variables, set in the hosting dashboard — note that none
 * of them carry a VITE_ prefix, so they are never compiled into the browser
 * bundle:
 *
 *   CLOUDINARY_API_KEY       from the Cloudinary console
 *   CLOUDINARY_API_SECRET    from the Cloudinary console — keep it secret
 *   ADMIN_EMAILS             comma-separated allow-list, e.g. admin@gmail.com
 *   FIREBASE_API_KEY         web API key, used to verify the caller's ID token
 */

const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY ?? ''
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET ?? ''
const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY ?? ''
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? '')
  .split(',')
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean)

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  })

/** Hex-encoded SHA-1, which is the digest Cloudinary expects. */
async function sha1Hex(input) {
  const digest = await crypto.subtle.digest(
    'SHA-1',
    new TextEncoder().encode(input),
  )
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Confirms the bearer token belongs to a real user of the Firebase project and
 * that their email is on the allow-list.
 *
 * Uses Identity Toolkit's lookup endpoint rather than verifying the JWT
 * locally: no dependencies, and it catches tokens whose account has since been
 * disabled or deleted.
 */
async function verifyAdmin(request) {
  const header = request.headers.get('authorization') ?? ''
  const idToken = header.startsWith('Bearer ') ? header.slice(7) : ''

  if (!idToken) return { ok: false, reason: 'Missing credentials.' }
  if (!FIREBASE_API_KEY) return { ok: false, reason: 'FIREBASE_API_KEY is not set.' }

  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    },
  )

  if (!response.ok) return { ok: false, reason: 'Invalid or expired session.' }

  const payload = await response.json()
  const email = (payload?.users?.[0]?.email ?? '').toLowerCase()

  if (!email) return { ok: false, reason: 'Invalid or expired session.' }
  if (ADMIN_EMAILS.length > 0 && !ADMIN_EMAILS.includes(email)) {
    return { ok: false, reason: 'This account is not allowed to upload.' }
  }

  return { ok: true, email }
}

export default async function handler(request) {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed.' }, 405)
  }

  if (!CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    return json({ error: 'Cloudinary credentials are not configured.' }, 500)
  }

  const auth = await verifyAdmin(request)
  if (!auth.ok) return json({ error: auth.reason }, 401)

  let body = {}
  try {
    body = await request.json()
  } catch {
    // An empty body is fine — folder falls back to the default below.
  }

  const folder =
    typeof body.folder === 'string' && /^[\w/-]{1,100}$/.test(body.folder)
      ? body.folder
      : 'pineappletales'

  const timestamp = Math.floor(Date.now() / 1000)

  // Cloudinary signs the upload parameters sorted by key and joined as a query
  // string, with the API secret appended. `file`, `api_key` and `resource_type`
  // are excluded by the algorithm.
  const signature = await sha1Hex(
    `folder=${folder}&timestamp=${timestamp}${CLOUDINARY_API_SECRET}`,
  )

  return json({ signature, timestamp, apiKey: CLOUDINARY_API_KEY, folder })
}

/** Vercel: run on the Edge runtime, which provides Web Crypto and fetch. */
export const config = { runtime: 'edge' }
