/**
 * Writes a page's SEO into <head>.
 *
 * Shared by <Seo> (static routes, driven by seo.config.ts) and <DynamicSeo>
 * (blog posts, events and episodes, whose values are only known once the record
 * has loaded). Keeping one implementation means a dynamic page cannot end up
 * with a subtly different head from a static one.
 *
 * On a prerendered first load the head is already complete — this only takes
 * over once the router does.
 */

import { site } from '@/config/site'
import type { JsonLd } from './structuredData'

/** Marks nodes this module owns, so they are replaced rather than duplicated. */
const MANAGED = 'data-seo'

export type AppliedSeo = {
  title: string
  description: string
  canonical: string
  ogType: 'website' | 'profile' | 'article'
  ogImage: string
  ogImageAlt: string
  noIndex?: boolean
  jsonLd: JsonLd
  /** ISO dates, emitted as article metadata when present. */
  publishedTime?: string
  modifiedTime?: string
  author?: string
}

function upsertMeta(
  attr: 'name' | 'property',
  key: string,
  content: string | null,
): void {
  const existing = document.head.querySelector<HTMLMetaElement>(
    `meta[${attr}="${key}"]`,
  )

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

export function applySeo(seo: AppliedSeo): void {
  document.title = seo.title
  document.documentElement.lang = 'en-IN'

  upsertMeta('name', 'description', seo.description)
  upsertMeta(
    'name',
    'robots',
    seo.noIndex
      ? 'noindex, nofollow'
      : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
  )
  upsertCanonical(seo.canonical)

  upsertMeta('property', 'og:title', seo.title)
  upsertMeta('property', 'og:description', seo.description)
  upsertMeta('property', 'og:url', seo.canonical)
  upsertMeta('property', 'og:type', seo.ogType)
  upsertMeta('property', 'og:image', seo.ogImage)
  upsertMeta('property', 'og:image:alt', seo.ogImageAlt)
  upsertMeta('property', 'og:site_name', site.name)
  upsertMeta('property', 'og:locale', 'en_IN')

  // Article metadata is meaningful only on articles; removed elsewhere so it
  // cannot linger after navigating from a blog post to a static page.
  upsertMeta('property', 'article:published_time', seo.publishedTime ?? null)
  upsertMeta('property', 'article:modified_time', seo.modifiedTime ?? null)
  upsertMeta('property', 'article:author', seo.author ?? null)

  upsertMeta('name', 'twitter:card', 'summary_large_image')
  upsertMeta('name', 'twitter:title', seo.title)
  upsertMeta('name', 'twitter:description', seo.description)
  upsertMeta('name', 'twitter:image', seo.ogImage)
  upsertMeta('name', 'twitter:image:alt', seo.ogImageAlt)

  replaceJsonLd(JSON.stringify(seo.jsonLd))
}
