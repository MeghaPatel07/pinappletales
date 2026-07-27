import { Route, Routes } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { Seo } from '@/seo/Seo'
import Home from '@/pages/Home/Home'
import About from '@/pages/About/About'
import Services from '@/pages/Services/Services'
import Contact from '@/pages/Contact/Contact'
import NotFound from '@/pages/NotFound/NotFound'

/**
 * Pages are imported eagerly rather than lazily: the whole site is a handful of
 * static documents, and a single bundle avoids a loading flash on navigation.
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
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  )
}
