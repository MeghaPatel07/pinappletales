import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Restores scroll position on route change. Hash links (e.g. /services#bibliotherapy)
 * are honoured by scrolling to the target element instead.
 */
export function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      const target = document.querySelector(hash)
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' })
        return
      }
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname, hash])

  return null
}
