import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'
import { ScrollToTop } from './ScrollToTop'
import styles from './Layout.module.css'

export function Layout() {
  const location = useLocation()

  useEffect(() => {
    // Tiny delay to ensure the page route finishes mounting/rendering
    const timer = setTimeout(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('revealed')
              observer.unobserve(entry.target)
            }
          })
        },
        {
          threshold: 0.05,
          rootMargin: '0px 0px -40px 0px',
        }
      )

      const elements = document.querySelectorAll('.reveal')
      elements.forEach((el) => observer.observe(el))

      return () => {
        elements.forEach((el) => observer.unobserve(el))
        observer.disconnect()
      }
    }, 100)

    return () => clearTimeout(timer)
  }, [location.pathname])

  return (
    <>
      <ScrollToTop />
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header />
      <main id="main" className={styles.main}>
        <Outlet />
      </main>
      <Footer />
    </>
  )
}
