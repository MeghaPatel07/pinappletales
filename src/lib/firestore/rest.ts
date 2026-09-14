/**
 * A minimal Firestore client built on the REST API.
 *
 * Why not the Firebase SDK here: the public site only ever *reads* published
 * documents, and pulling in firebase/app + firebase/firestore for that costs
 * well over 100 KB gzipped on every visit. This module is a few hundred bytes,
 * has no dependencies, and runs unchanged in the browser and in Node — which
 * means scripts/prerender.mjs bakes pages using the exact same query code the
 * runtime uses, so the two can never drift.
 *
 * Writes and anything requiring authentication go through the real SDK, which
 * is loaded lazily and only inside the admin bundle. See lib/firebase/client.ts.
 *
 * Access is governed by firestore.rules — public reads are limited to documents
 * where isActive is true.
 */

const PROJECT_ID = import.meta.env.VITE_FIREBASE_PROJECT_ID ?? 'pineappletales'
const API_KEY = import.meta.env.VITE_FIREBASE_API_KEY ?? ''

const BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`

/** Warn once rather than on every query when the project is not configured. */
let warnedAboutConfig = false

function isConfigured(): boolean {
  if (API_KEY) return true
  if (!warnedAboutConfig) {
    warnedAboutConfig = true
    console.warn(
      '[firestore] VITE_FIREBASE_API_KEY is not set — content queries will ' +
        'return nothing. Fill it in from the Firebase console (Project ' +
        'settings → Your apps → Web app) and restart the dev server.',
    )
  }
  return false
}

/**
 * Thrown when a query could not be answered at all.
 *
 * Deliberately distinct from an empty result, which is a legitimate answer. A
 * page that cannot tell the two apart tells a visitor "nothing published yet"
 * when the truth is "the request failed" — which is how a missing index once
 * made a populated blog look like an empty one.
 */
export class ContentQueryError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options)
    this.name = 'ContentQueryError'
  }
}

// -----------------------------------------------------------------------------
// Value coding
//
// Firestore's REST representation tags every value with its type:
//   { "stringValue": "hi" }, { "integerValue": "5" }, { "arrayValue": {...} }
// -----------------------------------------------------------------------------

type FirestoreValue = Record<string, unknown>

function decodeValue(value: FirestoreValue | undefined): unknown {
  if (!value) return null

  if ('stringValue' in value) return value.stringValue
  if ('booleanValue' in value) return value.booleanValue
  // Integers arrive as strings to survive JSON's 53-bit limit.
  if ('integerValue' in value) return Number(value.integerValue)
  if ('doubleValue' in value) return value.doubleValue
  if ('timestampValue' in value) return value.timestampValue
  if ('nullValue' in value) return null

  if ('arrayValue' in value) {
    const inner = value.arrayValue as { values?: FirestoreValue[] } | undefined
    return (inner?.values ?? []).map(decodeValue)
  }

  if ('mapValue' in value) {
    const inner = value.mapValue as { fields?: Record<string, FirestoreValue> }
    return decodeFields(inner?.fields)
  }

  // Types the content model never uses (geo points, references, bytes).
  return null
}

function decodeFields(
  fields: Record<string, FirestoreValue> | undefined,
): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(fields ?? {})) {
    out[key] = decodeValue(value)
  }
  return out
}

export type RawDocument = Record<string, unknown> & { id: string }

type RestDocument = {
  name?: string
  fields?: Record<string, FirestoreValue>
}

/** Turns a REST document into a plain object, with the document id folded in. */
function decodeDocument(doc: RestDocument): RawDocument {
  // `name` is the full resource path; the id is its last segment.
  const id = (doc.name ?? '').split('/').pop() ?? ''
  return { ...decodeFields(doc.fields), id }
}

/** Encodes a JS value for a structured query comparison. */
function encodeValue(value: string | number | boolean): FirestoreValue {
  if (typeof value === 'boolean') return { booleanValue: value }
  if (typeof value === 'number') {
    return Number.isInteger(value)
      ? { integerValue: String(value) }
      : { doubleValue: value }
  }
  return { stringValue: value }
}

// -----------------------------------------------------------------------------
// Response caching
//
// Public content changes rarely but a visitor may hit the same query on several
// routes (an index page, then back from a detail page). An in-flight map also
// collapses concurrent identical requests into one network call.
// -----------------------------------------------------------------------------

const CACHE_TTL_MS = 60_000

type CacheEntry = { at: number; value: RawDocument[] }

const cache = new Map<string, CacheEntry>()
const inFlight = new Map<string, Promise<RawDocument[]>>()

/** Drops cached reads. Called after an admin write so lists reflect it at once. */
export function invalidateCache(): void {
  cache.clear()
}

// -----------------------------------------------------------------------------
// Queries
// -----------------------------------------------------------------------------

export type QueryFilter = {
  field: string
  op: 'EQUAL' | 'NOT_EQUAL' | 'GREATER_THAN_OR_EQUAL' | 'LESS_THAN_OR_EQUAL'
  value: string | number | boolean
}

export type QueryOptions = {
  collection: string
  where?: QueryFilter[]
  orderBy?: { field: string; direction?: 'ASCENDING' | 'DESCENDING' }[]
  limit?: number
}

function buildStructuredQuery(options: QueryOptions): unknown {
  const filters = (options.where ?? []).map((filter) => ({
    fieldFilter: {
      field: { fieldPath: filter.field },
      op: filter.op,
      value: encodeValue(filter.value),
    },
  }))

  return {
    structuredQuery: {
      from: [{ collectionId: options.collection }],
      // A single filter must not be wrapped in a composite one.
      ...(filters.length === 1
        ? { where: filters[0] }
        : filters.length > 1
          ? { where: { compositeFilter: { op: 'AND', filters } } }
          : {}),
      ...(options.orderBy?.length
        ? {
            orderBy: options.orderBy.map((entry) => ({
              field: { fieldPath: entry.field },
              direction: entry.direction ?? 'ASCENDING',
            })),
          }
        : {}),
      ...(options.limit ? { limit: options.limit } : {}),
    },
  }
}

/**
 * Firestore rejects a query needing a composite index that does not exist with
 * 400 FAILED_PRECONDITION, naming the index in the message.
 */
function isMissingIndex(status: number, body: string): boolean {
  return (
    status === 400 &&
    body.includes('FAILED_PRECONDITION') &&
    body.includes('requires an index')
  )
}

/** One warning per collection, not one per query. */
const warnedAboutIndex = new Set<string>()

function warnAboutIndex(collection: string): void {
  if (warnedAboutIndex.has(collection)) return
  warnedAboutIndex.add(collection)
  console.warn(
    `[firestore] "${collection}" has no composite index for its sorted query, ` +
      'so it was re-read unsorted and ordered in the client. The indexes are ' +
      'declared in firestore.indexes.json but have not been deployed — run: ' +
      'firebase deploy --only firestore:indexes',
  )
}

/**
 * Issues one structured query. Throws ContentQueryError on failure.
 *
 * A missing composite index is treated as a deployment gap rather than a
 * failure: the query is retried without its orderBy so the page still fills,
 * and the caller sorts the result. Anything else propagates.
 */
async function fetchQuery(options: QueryOptions): Promise<RawDocument[]> {
  let response: Response
  try {
    response = await fetch(`${BASE}:runQuery?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildStructuredQuery(options)),
    })
  } catch (error) {
    throw new ContentQueryError(
      `query on "${options.collection}" could not reach Firestore`,
      { cause: error },
    )
  }

  // Read as text so an error payload can be inspected before parsing.
  const body = await response.text()

  if (!response.ok) {
    if (options.orderBy?.length && isMissingIndex(response.status, body)) {
      warnAboutIndex(options.collection)
      return fetchQuery({ ...options, orderBy: undefined })
    }

    throw new ContentQueryError(
      `query on "${options.collection}" failed: ${response.status} ${response.statusText} — ${body.slice(0, 300)}`,
    )
  }

  let payload: { document?: RestDocument }[]
  try {
    payload = JSON.parse(body) as { document?: RestDocument }[]
  } catch (error) {
    throw new ContentQueryError(
      `query on "${options.collection}" returned an unreadable response`,
      { cause: error },
    )
  }

  // The first element carries only a readTime when the result set is empty,
  // and any element may be a skipped-results marker without a document.
  return payload
    .filter((entry) => entry.document)
    .map((entry) => decodeDocument(entry.document as RestDocument))
}

/**
 * Runs a structured query and returns decoded documents.
 *
 * Throws ContentQueryError when the query cannot be answered, so a caller can
 * distinguish "could not load" from "nothing published". Returns an empty list
 * without throwing when Firebase is simply not configured yet, which keeps the
 * site building before .env has been filled in.
 */
export async function runQuery(options: QueryOptions): Promise<RawDocument[]> {
  if (!isConfigured()) return []

  const key = JSON.stringify(options)

  const cached = cache.get(key)
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) return cached.value

  const pending = inFlight.get(key)
  if (pending) return pending

  const request = (async () => {
    try {
      const documents = await fetchQuery(options)
      // Only successes are cached; a failure must be retried, not remembered.
      cache.set(key, { at: Date.now(), value: documents })
      return documents
    } finally {
      inFlight.delete(key)
    }
  })()

  inFlight.set(key, request)
  return request
}

/**
 * Fetches one document by id.
 *
 * Returns null when the document is genuinely absent or not public — that is an
 * answer, and the caller renders a 404. Throws ContentQueryError when the read
 * could not be made at all, so an unreachable Firestore is never mistaken for a
 * deleted post.
 */
export async function getDocument(
  collection: string,
  id: string,
): Promise<RawDocument | null> {
  if (!isConfigured() || !id) return null

  const key = `doc:${collection}/${id}`
  const cached = cache.get(key)
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) return cached.value[0] ?? null

  let response: Response
  try {
    response = await fetch(
      `${BASE}/${collection}/${encodeURIComponent(id)}?key=${API_KEY}`,
    )
  } catch (error) {
    throw new ContentQueryError(
      `read of ${collection}/${id} could not reach Firestore`,
      { cause: error },
    )
  }

  // 403 is the expected answer for an inactive document read by the public,
  // and 404 for one that does not exist. Neither is a failure.
  if (response.status === 404 || response.status === 403) return null

  if (!response.ok) {
    throw new ContentQueryError(
      `read of ${collection}/${id} failed: ${response.status} ${response.statusText}`,
    )
  }

  let document: RawDocument
  try {
    document = decodeDocument((await response.json()) as RestDocument)
  } catch (error) {
    throw new ContentQueryError(
      `read of ${collection}/${id} returned an unreadable response`,
      { cause: error },
    )
  }

  cache.set(key, { at: Date.now(), value: [document] })
  return document
}
