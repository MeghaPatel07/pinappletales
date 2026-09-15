import type { Metadata } from 'next'
import { JsonLd } from '@/components/JsonLd'
import { SITE_URL, site } from '@/config/site'
import { getPrimaryEvent, listHomeTestimonials } from '@/lib/content'
import { buildMetadata } from '@/seo/nextMetadata'
import {
  breadcrumbSchema,
  buildGraph,
  organisationSchema,
  personSchema,
  webPageSchema,
  websiteSchema,
} from '@/seo/structuredData'
import { HomeView } from './HomeView'

export const revalidate = 60

const OG_IMAGE = `${SITE_URL}/og-image.jpg`

export const metadata: Metadata = buildMetadata({
  title: 'Pineappletales | Neuro-Art Therapy & Bibliotherapy for Children',
  description:
    'Neuro-Art Therapy, Bibliotherapy and creative writing workshops for children and parents, led by Kenaa Jadeja — Child Analyst and Bibliotherapist in Vadodara. Offline and online.',
  canonical: `${SITE_URL}/`,
  ogType: 'website',
  ogImage: OG_IMAGE,
  ogImageAlt: `${site.name} — ${site.tagline}`,
})

export default async function Home() {
  const [testimonials, primaryEvent] = await Promise.all([
    listHomeTestimonials(),
    getPrimaryEvent(),
  ])

  const jsonLd = buildGraph([
    organisationSchema(),
    personSchema(),
    websiteSchema(),
    webPageSchema({
      path: '/',
      name: `${site.name} — ${site.tagline}`,
      description: site.description,
    }),
    breadcrumbSchema([{ name: 'Home', path: '/' }]),
  ])

  return (
    <>
      <JsonLd data={jsonLd} />
      <HomeView testimonials={testimonials} primaryEvent={primaryEvent} />
    </>
  )
}
