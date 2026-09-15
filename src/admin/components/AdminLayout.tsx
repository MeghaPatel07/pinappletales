'use client'

import { useEffect, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Icon } from '@/components/ui/Icon'
import { Logo } from '@/components/ui/Logo'
import { site } from '@/config/site'
import { useAuth } from '../auth/AuthProvider'

type NavEntry = {
  to: string
  label: string
  /** Matched exactly, so /admin does not stay highlighted on every child route. */
  end?: boolean
}

const NAV: readonly NavEntry[] = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/blogs', label: 'Blogs' },
  { to: '/admin/events', label: 'Events' },
  { to: '/admin/testimonials', label: 'Testimonials' },
  { to: '/admin/podcasts', label: 'Podcasts' },
  { to: '/admin/event-forms', label: 'Event forms' },
  { to: '/admin/registrations', label: 'Registrations' },
]

export function AdminLayout({ children }: { children: ReactNode }) {
  const { session, signOut } = useAuth()
  const pathname = usePathname()
  const [navOpen, setNavOpen] = useState(false)

  useEffect(() => {
    setNavOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!navOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setNavOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [navOpen])

  const isActive = (entry: NavEntry) => (entry.end ? pathname === entry.to : pathname.startsWith(entry.to))

  return (
    <div className="flex min-h-screen bg-paper-2">
      <aside
        id="admin-nav"
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-line bg-paper transition-transform duration-300 lg:static lg:translate-x-0 ${
          navOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Link href="/admin" className="flex items-center gap-2 border-b border-line px-5 py-5">
          <Logo alt={`${site.name} admin`} className="h-8" />
          <span className="eyebrow text-ink-soft">Admin</span>
        </Link>

        <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Admin sections">
          <ul className="flex flex-col gap-1">
            {NAV.map((entry) => (
              <li key={entry.to}>
                <Link
                  href={entry.to}
                  className={`block rounded-full px-4 py-2 text-[0.92rem] font-medium transition-colors ${
                    isActive(entry) ? 'bg-brand text-ink' : 'text-ink-soft hover:bg-paper-2 hover:text-ink'
                  }`}
                >
                  {entry.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-line p-4">
          <a
            href="/"
            className="arrow-move inline-flex items-center gap-1.5 text-[0.85rem] font-medium text-ink-soft hover:text-ink"
            target="_blank"
            rel="noopener noreferrer"
          >
            View website <Icon name="arrowRight" size={14} className="arrow" />
          </a>
        </div>
      </aside>

      {navOpen && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-ink/30 lg:hidden"
          onClick={() => setNavOpen(false)}
          aria-label="Close navigation"
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-line bg-paper px-5 py-3.5">
          <button
            type="button"
            className="grid h-9 w-9 place-items-center rounded-full text-ink hover:bg-paper-2 lg:hidden"
            onClick={() => setNavOpen((open) => !open)}
            aria-expanded={navOpen}
            aria-controls="admin-nav"
          >
            <Icon name={navOpen ? 'close' : 'menu'} size={20} />
            <span className="visually-hidden">{navOpen ? 'Close navigation' : 'Open navigation'}</span>
          </button>

          <div className="ml-auto flex items-center gap-4">
            <span className="hidden text-[0.85rem] text-ink-soft sm:inline" title={session?.email}>
              {session?.email}
            </span>
            <button
              type="button"
              className="rounded-full border border-line px-4 py-1.5 text-[0.85rem] font-medium text-ink hover:bg-paper-2"
              onClick={signOut}
            >
              Sign out
            </button>
          </div>
        </header>

        <main className="flex-1 px-5 py-8 md:px-8">{children}</main>
      </div>
    </div>
  )
}
