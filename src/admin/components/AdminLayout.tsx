import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon'
import { Logo } from '@/components/ui/Logo'
import { site } from '@/config/site'
import { useAuth } from '../auth/AuthProvider'
import styles from './AdminLayout.module.css'

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

export function AdminLayout() {
  const { session, signOut } = useAuth()
  const location = useLocation()
  const [navOpen, setNavOpen] = useState(false)

  // Close the mobile drawer on navigation.
  useEffect(() => {
    setNavOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!navOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setNavOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [navOpen])

  return (
    <div className={styles.shell}>
      <aside
        id="admin-nav"
        className={[styles.sidebar, navOpen ? styles.sidebarOpen : '']
          .filter(Boolean)
          .join(' ')}
      >
        <Link to="/admin" className={styles.brand}>
          <Logo alt={`${site.name} admin`} className={styles.logo} />
          <span className={styles.brandLabel}>Admin</span>
        </Link>

        <nav className={styles.nav} aria-label="Admin sections">
          <ul className={styles.navList}>
            {NAV.map((entry) => (
              <li key={entry.to}>
                <NavLink
                  to={entry.to}
                  end={entry.end}
                  className={({ isActive }) =>
                    [styles.navLink, isActive ? styles.navActive : '']
                      .filter(Boolean)
                      .join(' ')
                  }
                >
                  {entry.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.sidebarFooter}>
          <a
            href="/"
            className={styles.siteLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            View website
            <Icon name="arrowRight" size={14} />
          </a>
        </div>
      </aside>

      {navOpen && (
        <button
          type="button"
          className={styles.scrim}
          onClick={() => setNavOpen(false)}
          aria-label="Close navigation"
        />
      )}

      <div className={styles.main}>
        <header className={styles.topbar}>
          <button
            type="button"
            className={styles.navToggle}
            onClick={() => setNavOpen((open) => !open)}
            aria-expanded={navOpen}
            aria-controls="admin-nav"
          >
            <Icon name={navOpen ? 'close' : 'menu'} size={20} />
            <span className="visually-hidden">
              {navOpen ? 'Close navigation' : 'Open navigation'}
            </span>
          </button>

          <div className={styles.account}>
            <span className={styles.accountEmail} title={session?.email}>
              {session?.email}
            </span>
            <button type="button" className={styles.signOut} onClick={signOut}>
              Sign out
            </button>
          </div>
        </header>

        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
