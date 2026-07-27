/**
 * Per-route SEO configuration — the single source of truth for <head> content.
 *
 * It is consumed twice:
 *   1. at build time by scripts/prerender.mjs, which writes real static HTML
 *      with a complete <head> for every route (so crawlers and link unfurlers
 *      never depend on JavaScript);
 *   2. at runtime by <Seo />, which keeps the head in sync during client-side
 *      navigation.
 */

import { SITE_URL, site } from '@/config/site'
import type { JsonLd } from './structuredData'
import {
  breadcrumbSchema,
  buildGraph,
  faqSchema,
  organisationSchema,
  personSchema,
  servicesListSchema,
  webPageSchema,
  websiteSchema,
} from './structuredData'

export type PageSeo = {
  /** Route path, exactly as registered with the router. */
  path: string
  /** Full document title, 50–60 characters where possible. */
  title: string
  description: string
  /** Absolute canonical URL. */
  canonical: string
  ogType: 'website' | 'profile' | 'article'
  /** Absolute URL of the social share image. */
  ogImage: string
  ogImageAlt: string
  /** Excluded from the sitemap and marked noindex when true. */
  noIndex?: boolean
  sitemap?: { changefreq: string; priority: number }
  /** Structured data emitted as a single @graph script. */
  jsonLd: JsonLd
}

const OG_IMAGE = `${SITE_URL}/og-image.jpg`
const OG_IMAGE_ALT = `${site.name} — ${site.tagline}`

/** Nodes present on every page: the practice, the practitioner, the site. */
const baseGraph = () => [organisationSchema(), personSchema(), websiteSchema()]

const home: PageSeo = {
  path: '/',
  title: 'Pineappletales | Neuro-Art Therapy & Bibliotherapy for Children',
  description:
    'Neuro-Art Therapy, Bibliotherapy and creative writing workshops for children and parents, led by Kenaa Jadeja — Child Analyst and Bibliotherapist in Vadodara. Offline and online.',
  canonical: `${SITE_URL}/`,
  ogType: 'website',
  ogImage: OG_IMAGE,
  ogImageAlt: OG_IMAGE_ALT,
  sitemap: { changefreq: 'monthly', priority: 1.0 },
  jsonLd: buildGraph([
    ...baseGraph(),
    webPageSchema({
      path: '/',
      name: `${site.name} — ${site.tagline}`,
      description: site.description,
    }),
    breadcrumbSchema([{ name: 'Home', path: '/' }]),
  ]),
}

const about: PageSeo = {
  path: '/about',
  title: 'About Kenaa Jadeja | Child Analyst & Neuro-Art Therapist',
  description:
    'Meet Kenaa Jadeja — Child Analyst, Author, Neuro-Art Therapist and Bibliotherapist. How Pineappletales works with a child’s neuroplastic development through art, story and structured play.',
  canonical: `${SITE_URL}/about`,
  ogType: 'profile',
  ogImage: OG_IMAGE,
  ogImageAlt: `${site.founder} — ${site.founderTitleLine}`,
  sitemap: { changefreq: 'yearly', priority: 0.8 },
  jsonLd: buildGraph([
    ...baseGraph(),
    webPageSchema({
      path: '/about',
      name: `About ${site.founder} — ${site.name}`,
      description:
        'The practitioner, the method and the principles behind Pineappletales.',
      type: 'AboutPage',
    }),
    breadcrumbSchema([
      { name: 'Home', path: '/' },
      { name: 'About', path: '/about' },
    ]),
  ]),
}

const servicesPage: PageSeo = {
  path: '/services',
  title: 'Services | Neuro-Art Therapy, Bibliotherapy & Workshops',
  description:
    'Child behaviour analysis, Neuro-Art Therapy, Bibliotherapy, emotional and social skills support, creative writing workshops and personalised home plans — for children, parents, schools and NGOs.',
  canonical: `${SITE_URL}/services`,
  ogType: 'website',
  ogImage: OG_IMAGE,
  ogImageAlt: `Services at ${site.name}`,
  sitemap: { changefreq: 'monthly', priority: 0.9 },
  jsonLd: buildGraph([
    ...baseGraph(),
    webPageSchema({
      path: '/services',
      name: `Services — ${site.name}`,
      description:
        'Therapeutic and creative programmes for children, parents and educational organisations.',
      type: 'CollectionPage',
    }),
    servicesListSchema(),
    faqSchema(),
    breadcrumbSchema([
      { name: 'Home', path: '/' },
      { name: 'Services', path: '/services' },
    ]),
  ]),
}

const contactPage: PageSeo = {
  path: '/contact',
  title: 'Contact Pineappletales | Book a Session in Vadodara or Online',
  description:
    'Book a Neuro-Art Therapy, Bibliotherapy or parent guidance session with Kenaa Jadeja. Studio at Gotri Road, Vadodara — call +91 98256 78226, email or message on Instagram.',
  canonical: `${SITE_URL}/contact`,
  ogType: 'website',
  ogImage: OG_IMAGE,
  ogImageAlt: `Contact ${site.name}`,
  sitemap: { changefreq: 'yearly', priority: 0.7 },
  jsonLd: buildGraph([
    ...baseGraph(),
    webPageSchema({
      path: '/contact',
      name: `Contact — ${site.name}`,
      description:
        'Contact details, studio address and session formats for Pineappletales.',
      type: 'ContactPage',
    }),
    breadcrumbSchema([
      { name: 'Home', path: '/' },
      { name: 'Contact', path: '/contact' },
    ]),
  ]),
}

const notFound: PageSeo = {
  path: '/404',
  title: `Page not found | ${site.name}`,
  description: 'The page you were looking for could not be found.',
  canonical: `${SITE_URL}/404`,
  ogType: 'website',
  ogImage: OG_IMAGE,
  ogImageAlt: OG_IMAGE_ALT,
  noIndex: true,
  jsonLd: buildGraph([...baseGraph()]),
}

export const seoByPath: Record<string, PageSeo> = {
  '/': home,
  '/about': about,
  '/services': servicesPage,
  '/contact': contactPage,
  '/404': notFound,
}

/** Routes that get a prerendered HTML file and a sitemap entry. */
export const seoPages: readonly PageSeo[] = [
  home,
  about,
  servicesPage,
  contactPage,
  notFound,
]

export function getSeo(path: string): PageSeo {
  const normalised =
    path !== '/' && path.endsWith('/') ? path.replace(/\/+$/, '') : path
  return seoByPath[normalised] ?? notFound
}
