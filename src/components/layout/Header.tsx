import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { primaryNav, site } from '@/config/site'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Logo } from '@/components/ui/Logo'
import styles from './Header.module.css'

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()

  // Close the mobile panel whenever the route changes.
  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  // Solidify the bar once the hero starts scrolling under it.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Lock body scroll and allow Escape to dismiss while the panel is open.
  useEffect(() => {
    if (!menuOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [menuOpen])

  return (
    <header
      className={[styles.header, scrolled ? styles.scrolled : '', menuOpen ? styles.open : '']
        .filter(Boolean)
        .join(' ')}
    >
      <div className={styles.inner}>
        <Link to="/" className={styles.brand}>
          <Logo alt={`${site.name} by ${site.founder} — home`} className={styles.logo} />
        </Link>

        <nav className={styles.desktopNav} aria-label="Primary">
          <ul className={styles.navList}>
            {primaryNav.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    [styles.navLink, isActive ? styles.active : ''].filter(Boolean).join(' ')
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.actions}>
          <Button to="/contact" className={styles.desktopCta}>
            Book a session
          </Button>

          <button
            type="button"
            className={styles.menuToggle}
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
          >
            <Icon name={menuOpen ? 'close' : 'menu'} size={22} />
            <span className="visually-hidden">
              {menuOpen ? 'Close menu' : 'Open menu'}
            </span>
          </button>
        </div>
      </div>

      <div
        id="mobile-menu"
        className={styles.mobilePanel}
        hidden={!menuOpen}
        aria-label="Primary"
      >
        <nav>
          <ul className={styles.mobileList}>
            {primaryNav.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    [styles.mobileLink, isActive ? styles.mobileActive : '']
                      .filter(Boolean)
                      .join(' ')
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className={styles.mobileFooter}>
          <Button to="/contact" size="lg" block>
            Book a session
          </Button>
          <p className={styles.mobileNote}>{site.promise}</p>
        </div>
      </div>
    </header>
  )
}
