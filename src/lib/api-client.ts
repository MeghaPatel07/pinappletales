/**
 * Fetch wrapper for the admin SPA.
 *
 * Holds the JWT access token in memory only (never localStorage) and attaches
 * it as `Authorization: Bearer <token>`. On a 401 it tries exactly one silent
 * refresh (via the httpOnly refresh cookie, see /api/auth/refresh) before
 * giving up — this is what lets a page reload stay signed in without ever
 * putting the refresh token where client JavaScript could read it.
 *
 * Plain module, no React components — safe to import from Server Components
 * too (only the browser-only bits, like the actual fetch calls, must not run
 * during SSR, and nothing here touches them at module load time).
 */

type TokenListener = (token: string | null) => void

let accessToken: string | null = null
const listeners = new Set<TokenListener>()

export function getAccessToken(): string | null {
  return accessToken
}

export function setAccessToken(token: string | null): void {
  accessToken = token
  listeners.forEach((listener) => listener(token))
}

export function onAccessTokenChange(listener: TokenListener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

let refreshing: Promise<string | null> | null = null

async function refreshAccessToken(): Promise<string | null> {
  if (!refreshing) {
    refreshing = (async () => {
      try {
        const response = await fetch('/api/auth/refresh', {
          method: 'POST',
          credentials: 'include',
        })
        if (!response.ok) {
          setAccessToken(null)
          return null
        }
        const data = (await response.json()) as { accessToken?: string }
        setAccessToken(data.accessToken ?? null)
        return data.accessToken ?? null
      } catch {
        setAccessToken(null)
        return null
      } finally {
        refreshing = null
      }
    })()
  }
  return refreshing
}

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function request(path: string, init: RequestInit, retried: boolean): Promise<Response> {
  const headers = new Headers(init.headers)
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`)
  if (init.body && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(path, { ...init, headers, credentials: 'include' })

  if (response.status === 401 && !retried) {
    const refreshed = await refreshAccessToken()
    if (refreshed) return request(path, init, true)
  }

  return response
}

/** JSON in, JSON out. Throws ApiError on a non-2xx response. */
export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await request(path, init, false)
  const text = await response.text()

  let payload: unknown
  if (text) {
    try {
      payload = JSON.parse(text)
    } catch {
      payload = text
    }
  }

  if (!response.ok) {
    const message =
      payload && typeof payload === 'object' && 'error' in payload
        ? String((payload as { error?: unknown }).error)
        : `Request failed (${response.status})`
    throw new ApiError(message, response.status)
  }

  return payload as T
}

/** Human-readable message for an admin toast/error state. */
export function describeApiError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 401) return 'Your session has expired. Please sign in again.'
    if (error.status === 403) return 'You do not have permission to do that.'
    if (error.status === 404) return 'That record no longer exists.'
    if (error.status === 409) return error.message || 'That value is already in use.'
    return error.message || 'Something went wrong. Please try again.'
  }
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.'
}
