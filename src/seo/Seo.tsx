import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { site } from '@/config/site'
import { getSeo } from './seo.config'

/** Marks the nodes this component owns so they can be replaced, not duplicated. */
const MANAGED = 'data-seo'

function upsertMeta(
  attr: 'name' | 'property',
  key: string,
  content: string | null,
): void {
  const selector = `meta[${attr}="${key}"]`
  const existing = document.head.querySelector<HTMLMetaElement>(selector)

  if (content === null) {
    existing?.remove()
    return
  }

  if (existing) {
    existing.setAttribute('content', content)
    return
  }

  const element = document.createElement('meta')
  element.setAttribute(attr, key)
  element.setAttribute('content', content)
  element.setAttribute(MANAGED, 'managed')
  document.head.appendChild(element)
}

function upsertCanonical(href: string): void {
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!link) {
    link = document.createElement('link')
    link.setAttribute('rel', 'canonical')
    link.setAttribute(MANAGED, 'managed')
    document.head.appendChild(link)
  }
  link.setAttribute('href', href)
}

function replaceJsonLd(json: string): void {
  document.head
    .querySelectorAll(`script[type="application/ld+json"][${MANAGED}="managed"]`)
    .forEach((node) => node.remove())

  const script = document.createElement('script')
  script.type = 'application/ld+json'
  script.setAttribute(MANAGED, 'managed')
  script.textContent = json
  document.head.appendChild(script)
}

/**
 * Keeps <head> in sync during client-side navigation.
 *
 * On first load the head is already complete — scripts/prerender.mjs writes it
 * into the static HTML — so this only matters once the router takes over.
 */
export function Seo() {
  const { pathname } = useLocation()

  useEffect(() => {
    const seo = getSeo(pathname)

    document.title = seo.title
    document.documentElement.lang = 'en-IN'

    upsertMeta('name', 'description', seo.description)
    upsertMeta('name', 'robots', seo.noIndex ? 'noindex, nofollow' : 'index, follow')
    upsertCanonical(seo.canonical)

    upsertMeta('property', 'og:title', seo.title)
    upsertMeta('property', 'og:description', seo.description)
    upsertMeta('property', 'og:url', seo.canonical)
    upsertMeta('property', 'og:type', seo.ogType)
    upsertMeta('property', 'og:image', seo.ogImage)
    upsertMeta('property', 'og:image:alt', seo.ogImageAlt)
    upsertMeta('property', 'og:site_name', site.name)
    upsertMeta('property', 'og:locale', 'en_IN')

    upsertMeta('name', 'twitter:card', 'summary_large_image')
    upsertMeta('name', 'twitter:title', seo.title)
    upsertMeta('name', 'twitter:description', seo.description)
    upsertMeta('name', 'twitter:image', seo.ogImage)
    upsertMeta('name', 'twitter:image:alt', seo.ogImageAlt)

    replaceJsonLd(JSON.stringify(seo.jsonLd))
  }, [pathname])

  return null
}
