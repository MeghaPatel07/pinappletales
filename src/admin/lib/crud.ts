/**
 * Admin CRUD over the /api/admin/** REST API.
 *
 * The public site reads the same underlying data through lib/content.ts
 * (server-side) and shares the mapper functions in lib/mappers.ts, so a
 * document written here is decoded by exactly the code that renders it.
 *
 * Kept API-shape-compatible with the old Firestore-backed version so the
 * admin pages that call these functions did not need to change their logic —
 * only their imports.
 */

import { apiFetch } from '@/lib/api-client'
import type { RawDocument } from '@/lib/apiTypes'

export { describeApiError } from '@/lib/api-client'

/** Ceiling on an admin listing, mirrored by the API route. */
export const ADMIN_PAGE_CAP = 500

export type ListOptions = {
  orderByField?: string
  direction?: 'asc' | 'desc'
  max?: number
}

export async function listRecords<T>(
  collectionName: string,
  map: (doc: RawDocument) => T,
  options: ListOptions = {},
): Promise<T[]> {
  const params = new URLSearchParams()
  if (options.orderByField) params.set('orderBy', options.orderByField)
  if (options.direction) params.set('direction', options.direction)
  params.set('max', String(options.max ?? ADMIN_PAGE_CAP))

  const docs = await apiFetch<RawDocument[]>(
    `/api/admin/${collectionName}?${params.toString()}`,
  )
  return docs.map(map)
}

export async function getRecord<T>(
  collectionName: string,
  id: string,
  map: (doc: RawDocument) => T,
): Promise<T | null> {
  try {
    const doc = await apiFetch<RawDocument>(
      `/api/admin/${collectionName}/${encodeURIComponent(id)}`,
    )
    return map(doc)
  } catch (error) {
    if (error && typeof error === 'object' && 'status' in error && error.status === 404) {
      return null
    }
    throw error
  }
}

/** Creates a record and returns its new id. */
export async function createRecord(
  collectionName: string,
  data: Record<string, unknown>,
): Promise<string> {
  const created = await apiFetch<RawDocument>(`/api/admin/${collectionName}`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
  return created.id
}

export async function updateRecord(
  collectionName: string,
  id: string,
  data: Record<string, unknown>,
): Promise<void> {
  await apiFetch(`/api/admin/${collectionName}/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

/**
 * Creates or replaces a record at a chosen id — used for event forms, whose
 * id is the event id.
 */
export async function putRecord(
  collectionName: string,
  id: string,
  data: Record<string, unknown>,
): Promise<void> {
  await apiFetch(`/api/admin/${collectionName}/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function deleteRecord(collectionName: string, id: string): Promise<void> {
  await apiFetch(`/api/admin/${collectionName}/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
}

/**
 * True when another record already uses this slug. `exceptId` lets a record
 * keep its own slug while editing.
 */
export async function isSlugTaken(
  collectionName: string,
  slug: string,
  exceptId?: string,
): Promise<boolean> {
  const params = new URLSearchParams({ slug })
  if (exceptId) params.set('exceptId', exceptId)

  const result = await apiFetch<{ taken: boolean }>(
    `/api/admin/${collectionName}/check-slug?${params.toString()}`,
  )
  return result.taken
}

/**
 * No-op: the create/update API routes for blogs and events unset `isPrimary`
 * on every other document in the same request when the saved record sets it,
 * so there is nothing left for the client to do here. Kept (with the same
 * signature) so the admin forms that call this before saving need no change.
 */
export async function clearOtherPrimaries(
  _collectionName?: string,
  _exceptId?: string,
): Promise<void> {}
