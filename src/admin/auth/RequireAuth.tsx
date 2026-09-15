'use client'

/**
 * Guards every /admin page except the login screen.
 *
 * middleware.ts already redirects an unauthenticated request at the edge
 * before any HTML ships, using the refresh-token cookie. This is the client
 * side of that same guard — it covers the moment between mount and the
 * session check resolving, and the case where the cookie was valid but the
 * account no longer exists.
 */

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { ReactNode } from 'react'
import { Spinner } from '../components/Spinner'
import { useAuth } from './AuthProvider'

export function RequireAuth({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !session) router.replace('/admin/login')
  }, [loading, session, router])

  if (loading) return <Spinner full label="Checking your session…" />
  if (!session) return <Spinner full label="Redirecting to sign in…" />

  return <>{children}</>
}
