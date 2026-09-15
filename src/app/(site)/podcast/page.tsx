import type { Metadata } from 'next'
import { Container } from '@/components/ui/Container'
import { PageHero } from '@/components/sections/PageHero'
import { CtaBanner } from '@/components/sections/CtaBanner'
import { JsonLd } from '@/components/JsonLd'
import { listPodcasts } from '@/lib/content'
import { SITE_URL, site } from '@/config/site'
import { buildMetadata } from '@/seo/nextMetadata'
import {
  breadcrumbSchema,
  buildGraph,
  organisationSchema,
  personSchema,
  webPageSchema,
  websiteSchema,
} from '@/seo/structuredData'
import { PodcastList } from './PodcastList'

export const revalidate = 60

const OG_IMAGE = `${SITE_URL}/og-image.jpg`

export const metadata: Metadata = buildMetadata({
  title: 'Podcast | Conversations on Children, Art & Stories',
  description:
    'Episodes from Pineappletales on raising curious, regulated children — Neuro-Art Therapy, Bibliotherapy and the everyday work of parenting, with Kenaa Jadeja.',
  canonical: `${SITE_URL}/podcast`,
  ogType: 'website',
  ogImage: OG_IMAGE,
  ogImageAlt: `The ${site.name} podcast`,
})

const jsonLd = buildGraph([
  organisationSchema(),
  personSchema(),
  websiteSchema(),
  webPageSchema({
    path: '/podcast',
    name: `Podcast — ${site.name}`,
    description: 'Video conversations on child development, art therapy and reading.',
    type: 'CollectionPage',
  }),
  breadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Podcast', path: '/podcast' },
  ]),
])

export default async function PodcastIndexPage() {
  const episodes = await listPodcasts()

  return (
    <>
      <JsonLd data={jsonLd} />
      <PageHero
        eyebrow="Listen & watch"
        title="The Pineappletales podcast"
        lead="Conversations on raising curious, regulated children — what the research says, and what it looks like on an ordinary Tuesday evening."
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Podcast' }]}
      />

      <section className="reveal bg-paper py-16 md:py-24">
        <Container>
          {episodes.length === 0 && <p className="text-ink-soft">The first episodes are on their way. Do check back soon.</p>}
          <PodcastList episodes={episodes} />
        </Container>
      </section>

      <CtaBanner
        title="Have something you would like covered?"
        body="Questions from parents shape most of these episodes. Send yours across."
        primaryLabel="Suggest a topic"
      />
    </>
  )
}
