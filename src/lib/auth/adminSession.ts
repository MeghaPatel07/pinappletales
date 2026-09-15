/**
 * Reads the admin identity that middleware.ts already verified and forwarded
 * as request headers. Route handlers under /api/admin/** call this instead of
 * re-verifying the JWT themselves — middleware is the single point of truth.
 */

import { headers } from 'next/headers'

export type AdminSession = { id: string; email: string; name: string }

export async function getAdminSession(): Promise<AdminSession | null> {
  const list = await headers()
  const id = list.get('x-admin-id')
  const email = list.get('x-admin-email')
  if (!id || !email) return null
  return { id, email, name: list.get('x-admin-name') || email }
}
