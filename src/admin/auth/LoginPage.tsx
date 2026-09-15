'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Logo } from '@/components/ui/Logo'
import { site } from '@/config/site'
import { Spinner } from '../components/Spinner'
import { AuthError, useAuth } from './AuthProvider'

export function LoginPage() {
  const { session, loading, signIn } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const destination = searchParams.get('from') || '/admin'

  useEffect(() => {
    document.title = `Admin sign in | ${site.name}`
  }, [])

  useEffect(() => {
    if (!loading && session) router.replace(destination)
  }, [loading, session, destination, router])

  if (loading) return <Spinner full label="Checking your session…" />
  if (session) return <Spinner full label="Signed in — redirecting…" />

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      await signIn(email, password)
      router.replace(destination)
    } catch (caught) {
      setError(caught instanceof AuthError ? caught.message : 'Sign in failed. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-paper-2 px-4 py-12">
      <div className="w-full max-w-sm rounded-card border border-line bg-paper p-8 shadow-[0_30px_70px_-40px_rgba(36,31,24,0.4)]">
        <Logo alt={`${site.name} admin`} className="h-10" />

        <div className="mt-6">
          <h1 className="font-display text-[1.5rem] font-semibold text-ink">Admin sign in</h1>
          <p className="mt-1.5 text-[0.92rem] text-ink-soft">Manage blogs, events, podcasts and registrations.</p>
        </div>

        <form className="mt-7 grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-1.5">
            <label htmlFor="admin-email" className="eyebrow text-ink-soft">
              Email
            </label>
            <input
              id="admin-email"
              type="email"
              className="rounded-xl border border-line bg-paper px-3.5 py-2.5 text-[0.95rem] text-ink focus:outline-none focus:ring-2 focus:ring-brand-deep/40"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="username"
              required
              autoFocus
              disabled={submitting}
            />
          </div>

          <div className="grid gap-1.5">
            <label htmlFor="admin-password" className="eyebrow text-ink-soft">
              Password
            </label>
            <div className="relative">
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 pr-16 text-[0.95rem] text-ink focus:outline-none focus:ring-2 focus:ring-brand-deep/40"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
                disabled={submitting}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[0.8rem] font-medium text-ink-soft hover:text-ink"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-pressed={showPassword}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <p className="min-h-[1.2em] text-[0.85rem] text-coral" role="alert" aria-live="polite">
            {error}
          </p>

          <button
            type="submit"
            className="btn mt-1 rounded-full bg-brand px-5 py-3 text-[0.95rem] font-medium text-ink hover:bg-brand-deep disabled:cursor-not-allowed disabled:opacity-60"
            disabled={submitting}
          >
            {submitting ? <Spinner label="Signing in…" /> : 'Sign in'}
          </button>
        </form>

        <a href="/" className="mt-6 inline-block text-[0.85rem] text-ink-soft hover:text-ink">
          ← Back to the website
        </a>
      </div>
    </div>
  )
}
