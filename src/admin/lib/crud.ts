/**
 * Firestore reads and writes for the admin, using the full SDK.
 *
 * The public site reads the same collections over REST (lib/firestore/rest.ts)
 * and shares the mapper functions, so documents written here are decoded by
 * exactly the code that will render them.
 */

import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit as limitTo,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
  type DocumentData,
  type QueryConstraint,
} from 'firebase/firestore'
import { db } from '@/lib/firebase/client'
import { invalidateCache } from '@/lib/firestore/rest'
import type { RawDocument } from '@/lib/firestore/rest'

/**
 * Ceiling on an admin listing. Everything below this is filtered, sorted and
 * paginated in memory, which makes search instant and needs no extra indexes.
 * If a collection ever outgrows this the list warns rather than silently
 * truncating — see useCollection.
 */
export const ADMIN_PAGE_CAP = 500

/**
 * Firestore hands back Timestamp instances; the REST path hands back ISO
 * strings. Normalising here means the mappers only ever see one shape.
 */
function normalise(value: unknown): unknown {
  if (value === null || value === undefined) return value

  if (typeof value === 'object') {
    const candidate = value as { toDate?: () => Date }
    if (typeof candidate.toDate === 'function') {
      return candidate.toDate().toISOString()
    }
    if (Array.isArray(value)) return value.map(normalise)

    const out: Record<string, unknown> = {}
    for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
      out[key] = normalise(entry)
    }
    return out
  }

  return value
}

function toRaw(id: string, data: DocumentData): RawDocument {
  return { ...(normalise(data) as Record<string, unknown>), id }
}

export type ListOptions = {
  /** Field to sort on server-side. Omit for collections without a sort key. */
  orderByField?: string
  direction?: 'asc' | 'desc'
  max?: number
}

/** Reads a whole collection, mapped and capped. */
export async function listRecords<T>(
  collectionName: string,
  map: (doc: RawDocument) => T,
  options: ListOptions = {},
): Promise<T[]> {
  const constraints: QueryConstraint[] = []
  if (options.orderByField) {
    constraints.push(orderBy(options.orderByField, options.direction ?? 'desc'))
  }
  constraints.push(limitTo(options.max ?? ADMIN_PAGE_CAP))

  const snapshot = await getDocs(
    query(collection(db(), collectionName), ...constraints),
  )

  return snapshot.docs.map((entry) => map(toRaw(entry.id, entry.data())))
}

export async function getRecord<T>(
  collectionName: string,
  id: string,
  map: (doc: RawDocument) => T,
): Promise<T | null> {
  const snapshot = await getDoc(doc(db(), collectionName, id))
  if (!snapshot.exists()) return null
  return map(toRaw(snapshot.id, snapshot.data()))
}

/** Stamped on every write so lists can show when something last changed. */
const stamp = () => new Date().toISOString()

/**
 * Creates a document with a generated id and returns it.
 *
 * setDoc against a pre-made reference rather than addDoc, so the id is known
 * before the write resolves — the form navigates to the edit URL immediately.
 */
export async function createRecord(
  collectionName: string,
  data: Record<string, unknown>,
): Promise<string> {
  const reference = doc(collection(db(), collectionName))
  const now = stamp()
  await setDoc(reference, { ...data, createdAt: now, updatedAt: now })
  invalidateCache()
  return reference.id
}

export async function updateRecord(
  collectionName: string,
  id: string,
  data: Record<string, unknown>,
): Promise<void> {
  await updateDoc(doc(db(), collectionName, id), { ...data, updatedAt: stamp() })
  invalidateCache()
}

/** Clears the exclusive home flag on every other record before saving one. */
export async function clearOtherPrimaries(
  collectionName: string,
  exceptId: string | undefined,
): Promise<void> {
  const snapshot = await getDocs(
    query(collection(db(), collectionName), where('isPrimary', '==', true)),
  )
  await Promise.all(
    snapshot.docs
      .filter((entry) => entry.id !== exceptId)
      .map((entry) => updateDoc(entry.ref, { isPrimary: false, updatedAt: stamp() })),
  )
}

/**
 * Creates or replaces a document at a chosen id.
 * Used for eventForms, where the document id is the event id.
 */
export async function putRecord(
  collectionName: string,
  id: string,
  data: Record<string, unknown>,
): Promise<void> {
  const existing = await getDoc(doc(db(), collectionName, id))
  const now = stamp()

  await setDoc(doc(db(), collectionName, id), {
    ...data,
    createdAt: existing.exists() ? (existing.data().createdAt ?? now) : now,
    updatedAt: now,
  })
  invalidateCache()
}

/**
 * True when another document already uses this slug.
 *
 * Slugs are canonical URLs, so a duplicate would make two posts fight over the
 * same address. `exceptId` lets a record keep its own slug while editing.
 */
export async function isSlugTaken(
  collectionName: string,
  slug: string,
  exceptId?: string,
): Promise<boolean> {
  const snapshot = await getDocs(
    query(collection(db(), collectionName), where('slug', '==', slug), limitTo(2)),
  )

  return snapshot.docs.some((entry) => entry.id !== exceptId)
}

export async function deleteRecord(
  collectionName: string,
  id: string,
): Promise<void> {
  await deleteDoc(doc(db(), collectionName, id))
  invalidateCache()
}

/**
 * Turns a Firestore error into something an admin can act on. The most common
 * one by far is a missing composite index, which Firestore reports with a
 * console link to create it.
 */
export function describeFirestoreError(error: unknown): string {
  const code = (error as { code?: string })?.code ?? ''
  const message = (error as Error)?.message ?? ''

  if (code === 'permission-denied') {
    return 'Permission denied. Your account may no longer have admin access, or firestore.rules has not been deployed.'
  }
  if (code === 'unavailable' || code === 'failed-precondition') {
    if (message.includes('index')) {
      return 'This query needs a Firestore index. Open the browser console — Firestore logs a link that creates it.'
    }
    return 'Could not reach Firestore. Check your connection and try again.'
  }
  if (code === 'not-found') return 'That record no longer exists.'

  return message || 'Something went wrong. Please try again.'
}
