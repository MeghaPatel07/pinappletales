import { useEffect, useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Logo } from '@/components/ui/Logo'
import { site } from '@/config/site'
import { Spinner } from '../components/Spinner'
import { AuthError, useAuth } from './AuthProvider'
import styles from './LoginPage.module.css'

type LocationState = { from?: string }

export function LoginPage() {
  const { session, loading, signIn, configured } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const destination = (location.state as LocationState | null)?.from ?? '/admin'

  useEffect(() => {
    document.title = `Admin sign in | ${site.name}`
  }, [])

  if (loading) return <Spinner full label="Checking your session…" />

  // Already signed in — skip the form entirely.
  if (session) return <Navigate to={destination} replace />

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      await signIn(email, password)
      navigate(destination, { replace: true })
    } catch (caught) {
      setError(
        caught instanceof AuthError
          ? caught.message
          : 'Sign in failed. Please try again.',
      )
      setSubmitting(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <Logo alt={`${site.name} admin`} className={styles.logo} />

        <div className={styles.intro}>
          <h1 className={styles.title}>Admin sign in</h1>
          <p className={styles.subtitle}>
            Manage blogs, events, podcasts and registrations.
          </p>
        </div>

        {!configured && (
          <p className={styles.warning} role="alert">
            Firebase is not configured yet. Add <code>VITE_FIREBASE_API_KEY</code>{' '}
            and <code>VITE_FIREBASE_APP_ID</code> to <code>.env</code>, then
            restart the dev server.
          </p>
        )}

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label htmlFor="admin-email" className={styles.label}>
              Email
            </label>
            <input
              id="admin-email"
              type="email"
              className={styles.input}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="username"
              required
              autoFocus
              disabled={submitting}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="admin-password" className={styles.label}>
              Password
            </label>
            <div className={styles.passwordWrap}>
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                className={styles.input}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
                disabled={submitting}
              />
              <button
                type="button"
                className={styles.reveal}
                onClick={() => setShowPassword((visible) => !visible)}
                aria-pressed={showPassword}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <p className={styles.error} role="alert" aria-live="polite">
            {error}
          </p>

          <button type="submit" className={styles.submit} disabled={submitting}>
            {submitting ? <Spinner label="Signing in…" /> : 'Sign in'}
          </button>
        </form>

        <a href="/" className={styles.back}>
          ← Back to the website
        </a>
      </div>
    </div>
  )
}
