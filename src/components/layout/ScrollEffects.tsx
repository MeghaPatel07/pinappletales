'use client'

/**
 * Two small route-change behaviours that used to live in React Router's
 * <Layout>: restoring scroll position (or honouring a #hash target) on
 * navigation, and re-arming the reveal-on-scroll IntersectionObserver for
 * whatever `.reveal` elements the new page rendered.
 */

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export function ScrollEffects() {
  const pathname = usePathname()

  useEffect(() => {
    const hash = typeof window !== 'undefined' ? window.location.hash : ''

    if (hash) {
      const target = document.querySelector(hash)
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' })
        return
      }
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname])

  useEffect(() => {
    const timer = setTimeout(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-in')
              observer.unobserve(entry.target)
            }
          })
        },
        { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
      )

      const elements = document.querySelectorAll('.reveal:not(.is-in)')
      elements.forEach((el) => observer.observe(el))

      return () => {
        elements.forEach((el) => observer.unobserve(el))
        observer.disconnect()
      }
    }, 100)

    return () => clearTimeout(timer)
  }, [pathname])

  return null
}
