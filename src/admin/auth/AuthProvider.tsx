'use client'

/**
 * Admin session state, backed by the JWT access/refresh token pair.
 *
 * The access token lives in memory only (lib/api-client.ts); the refresh
 * token is an httpOnly cookie this code never touches directly. On mount, a
 * silent call to /api/auth/refresh re-establishes the session from that
 * cookie, so a page reload does not force a fresh sign-in.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { setAccessToken } from '@/lib/api-client'

export type AdminSession = {
  uid: string
  email: string
  name: string
}

type AuthState = {
  /** Null once resolved and nobody is signed in. */
  session: AdminSession | null
  /** True until the first session check lands — render nothing before. */
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

export class AuthError extends Error {}

function messageForStatus(status: number, fallback: string): string {
  if (status === 401) return 'Incorrect email or password.'
  if (status === 429) return 'Too many attempts. Wait a minute and try again.'
  return fallback
}

type LoginResponse = { accessToken: string; user: { id: string; email: string; name: string } }

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AdminSession | null>(null)
  const [loading, setLoading] = useState(true)

  // Restore a session from the refresh cookie on first load.
  useEffect(() => {
    let cancelled = false

    void (async () => {
      try {
        const response = await fetch('/api/auth/refresh', {
          method: 'POST',
          credentials: 'include',
        })
        if (!response.ok) throw new Error('not signed in')

        const data = (await response.json()) as LoginResponse
        if (cancelled) return

        setAccessToken(data.accessToken)
        setSession({ uid: data.user.id, email: data.user.email, name: data.user.name })
      } catch {
        if (!cancelled) {
          setAccessToken(null)
          setSession(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    let response: Response
    try {
      response = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      })
    } catch {
      throw new AuthError('Could not reach the server. Check your connection.')
    }

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}) as { error?: string })
      throw new AuthError(
        messageForStatus(response.status, payload.error ?? 'Sign in failed. Please try again.'),
      )
    }

    const data = (await response.json()) as LoginResponse
    setAccessToken(data.accessToken)
    setSession({ uid: data.user.id, email: data.user.email, name: data.user.name })
  }, [])

  const signOut = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    } catch {
      // Sign the user out locally regardless of whether the request landed.
    }
    setAccessToken(null)
    setSession(null)
  }, [])

  const value = useMemo<AuthState>(
    () => ({ session, loading, signIn, signOut }),
    [session, loading, signIn, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside <AuthProvider>.')
  }
  return context
}
