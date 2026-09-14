import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { applySeo, type AppliedSeo } from './applySeo'
import { getSeo } from './seo.config'

/**
 * Keeps <head> in sync during client-side navigation.
 *
 * On first load the head is already complete — scripts/prerender.mjs writes it
 * into the static HTML — so this only matters once the router takes over.
 *
 * Records (blog posts, events, episodes) are skipped here: their titles and
 * canonicals depend on data this component does not have. Those pages render
 * <DynamicSeo> themselves once loaded, and seo.config supplies an indexable
 * placeholder in the meantime so a crawler never sees a "not found" head on a
 * page that exists.
 */
export function Seo() {
  const { pathname } = useLocation()

  useEffect(() => {
    // The admin manages its own head and must not be indexed.
    if (pathname.startsWith('/admin')) return

    applySeo(getSeo(pathname) as AppliedSeo)
  }, [pathname])

  return null
}

/**
 * Head tags for a page whose content comes from the database.
 *
 * Rendered by the record pages after their data resolves, overriding the
 * placeholder <Seo> applied for the route.
 */
export function DynamicSeo(seo: AppliedSeo) {
  // Serialised because the object is rebuilt on every render; keying off the
  // content means an identical head is not reapplied on each re-render.
  const fingerprint = JSON.stringify(seo)

  useEffect(() => {
    applySeo(JSON.parse(fingerprint) as AppliedSeo)
  }, [fingerprint])

  return null
}
