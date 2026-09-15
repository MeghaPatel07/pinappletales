'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { primaryNav, site } from '@/config/site'
import { Logo } from '@/components/ui/Logo'

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

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

  const isActive = (path: string) => (path === '/' ? pathname === '/' : pathname.startsWith(path))

  return (
    <header className="fixed inset-x-0 top-0 z-50 pt-3 md:pt-4">
      <div className="container-1200">
        <div
          className={`flex h-[62px] items-center justify-between rounded-full border border-line bg-paper pl-5 pr-3 transition-shadow duration-500 ${
            scrolled ? 'shadow-[0_16px_40px_-24px_rgba(36,31,24,0.5)]' : 'shadow-[0_8px_26px_-22px_rgba(36,31,24,0.4)]'
          }`}
        >
          <Link href="/" className="flex items-center" aria-label={`${site.name} — by ${site.founder}, home`}>
            <Logo alt={`${site.name} by ${site.founder} — home`} />
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
            {primaryNav.map((item) => {
              const active = isActive(item.path)
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`rounded-full px-3.5 py-2 text-[0.9rem] transition-colors duration-300 ${
                    active ? 'bg-brand text-ink' : 'text-ink-soft hover:bg-ink/5'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className="hidden lg:block">
            <Link
              href="/contact"
              className="btn arrow-move rounded-full bg-ink px-5 py-2.5 text-[0.9rem] font-medium text-paper"
            >
              Book a Session <span className="arrow" aria-hidden>→</span>
            </Link>
          </div>

          <button
            className="p-2.5 text-ink lg:hidden"
            aria-expanded={menuOpen}
            aria-label="Toggle menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <div className="w-[22px]">
              <span
                className="mb-[5px] block h-0.5 bg-ink transition-all"
                style={{ transform: menuOpen ? 'translateY(7px) rotate(45deg)' : 'none' }}
              />
              <span
                className="mb-[5px] block h-0.5 bg-ink transition-opacity"
                style={{ opacity: menuOpen ? 0 : 1 }}
              />
              <span
                className="block h-0.5 bg-ink transition-all"
                style={{ transform: menuOpen ? 'translateY(-7px) rotate(-45deg)' : 'none' }}
              />
            </div>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="container-1200 lg:hidden">
          <nav
            className="mt-2 flex flex-col overflow-hidden rounded-3xl border border-line bg-paper py-2 shadow-[0_16px_40px_-24px_rgba(36,31,24,0.5)]"
            aria-label="Mobile"
          >
            {primaryNav.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setMenuOpen(false)}
                className="px-5 py-2.5 text-[1.02rem] text-ink"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/contact"
              onClick={() => setMenuOpen(false)}
              className="btn mx-4 mt-2 justify-center rounded-full bg-brand px-5 py-3 text-[0.95rem] font-medium text-ink"
            >
              Book a Session
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
