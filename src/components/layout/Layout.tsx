import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'
import { ScrollToTop } from './ScrollToTop'
import styles from './Layout.module.css'

export function Layout() {
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
