/**
 * The admin section, mounted at /admin/* and loaded lazily by App.tsx.
 *
 * Everything under here — the Firebase SDK, the Jodit editor, DOMPurify — is
 * reached only through this entry point, so none of it is downloaded by a
 * visitor reading the website.
 *
 * Every route except /admin/login sits behind <RequireAuth>.
 */

import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AuthProvider } from './auth/AuthProvider'
import { LoginPage } from './auth/LoginPage'
import { RequireAuth } from './auth/RequireAuth'
import { AdminLayout } from './components/AdminLayout'
import { ToastProvider } from './components/Toast'
import { Dashboard } from './pages/Dashboard'
import { BlogForm } from './pages/blogs/BlogForm'
import { BlogList } from './pages/blogs/BlogList'
import { EventForm } from './pages/events/EventForm'
import { EventList } from './pages/events/EventList'
import { EventFormBuilder } from './pages/eventForms/EventFormBuilder'
import { EventFormList } from './pages/eventForms/EventFormList'
import { PodcastForm } from './pages/podcasts/PodcastForm'
import { PodcastList } from './pages/podcasts/PodcastList'
import { RegistrationList } from './pages/registrations/RegistrationList'
import { TestimonialForm } from './pages/testimonials/TestimonialForm'
import { TestimonialList } from './pages/testimonials/TestimonialList'

/**
 * The admin must never be indexed. The public <Seo> component already marks
 * unknown routes noindex, but this makes it explicit and independent of that.
 */
function NoIndex() {
  useEffect(() => {
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex, nofollow'
    document.head.appendChild(meta)
    return () => meta.remove()
  }, [])

  return null
}

/** Admin pages are their own documents; scroll to the top when they change. */
function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

export default function AdminApp() {
  return (
    <AuthProvider>
      <ToastProvider>
        <NoIndex />
        <ScrollToTop />

        <Routes>
          <Route path="login" element={<LoginPage />} />

          <Route element={<RequireAuth />}>
            <Route element={<AdminLayout />}>
              <Route index element={<Dashboard />} />

              <Route path="blogs" element={<BlogList />} />
              <Route path="blogs/new" element={<BlogForm />} />
              <Route path="blogs/:id" element={<BlogForm />} />

              <Route path="events" element={<EventList />} />
              <Route path="events/new" element={<EventForm />} />
              <Route path="events/:id" element={<EventForm />} />

              <Route path="testimonials" element={<TestimonialList />} />
              <Route path="testimonials/new" element={<TestimonialForm />} />
              <Route path="testimonials/:id" element={<TestimonialForm />} />

              <Route path="podcasts" element={<PodcastList />} />
              <Route path="podcasts/new" element={<PodcastForm />} />
              <Route path="podcasts/:id" element={<PodcastForm />} />

              <Route path="event-forms" element={<EventFormList />} />
              <Route path="event-forms/:eventId" element={<EventFormBuilder />} />

              <Route path="registrations" element={<RegistrationList />} />

              {/* Unknown admin URLs go to the dashboard rather than the
                  website's 404, which would look like the admin had vanished. */}
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Route>
          </Route>
        </Routes>
      </ToastProvider>
    </AuthProvider>
  )
}
