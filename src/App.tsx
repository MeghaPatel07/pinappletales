import { Suspense, lazy } from 'react'
import { Route, Routes } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { Seo } from '@/seo/Seo'
import Home from '@/pages/Home/Home'
import About from '@/pages/About/About'
import Services from '@/pages/Services/Services'
import Contact from '@/pages/Contact/Contact'
import BlogIndex from '@/pages/Blog/BlogIndex'
import BlogDetail from '@/pages/Blog/BlogDetail'
import EventIndex from '@/pages/Events/EventIndex'
import EventDetail from '@/pages/Events/EventDetail'
import PodcastIndex from '@/pages/Podcast/PodcastIndex'
import NotFound from '@/pages/NotFound/NotFound'

/**
 * The admin is the one part of the site loaded on demand. It carries the
 * Firebase SDK, the Jodit editor and DOMPurify — around a megabyte that a
 * visitor reading the blog should never download.
 */
const AdminApp = lazy(() => import('@/admin/AdminApp'))

/**
 * Public pages are imported eagerly rather than lazily: they are a handful of
 * small documents, and a single bundle avoids a loading flash on navigation.
 */
export function App() {
  return (
    <>
      <Seo />
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="services" element={<Services />} />
          <Route path="contact" element={<Contact />} />

          <Route path="blog" element={<BlogIndex />} />
          <Route path="blog/:slug" element={<BlogDetail />} />

          <Route path="events" element={<EventIndex />} />
          <Route path="events/:slug" element={<EventDetail />} />

          <Route path="podcast" element={<PodcastIndex />} />

          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Outside <Layout>: the admin has its own shell, navigation and chrome. */}
        <Route
          path="/admin/*"
          element={
            <Suspense fallback={null}>
              <AdminApp />
            </Suspense>
          }
        />
      </Routes>
    </>
  )
}
