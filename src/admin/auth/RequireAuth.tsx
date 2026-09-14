/**
 * Route guard for every /admin URL except the login screen.
 *
 * A visitor who is not signed in is sent to /admin/login with the URL they
 * wanted recorded, so signing in lands them where they were headed rather than
 * on the dashboard.
 */

import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Spinner } from '../components/Spinner'
import { useAuth } from './AuthProvider'

export function RequireAuth() {
  const { session, loading } = useAuth()
  const location = useLocation()

  // Firebase restores a persisted session asynchronously. Redirecting during
  // that window would bounce a signed-in admin to the login screen on reload.
  if (loading) return <Spinner full label="Checking your session…" />

  if (!session) {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{ from: location.pathname + location.search }}
      />
    )
  }

  return <Outlet />
}
