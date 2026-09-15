import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Container } from '@/components/ui/Container'
import { ContentImage } from '@/components/ui/ContentImage'
import { RichText } from '@/components/ui/RichText'
import { CtaBanner } from '@/components/sections/CtaBanner'
import { JsonLd } from '@/components/JsonLd'
import { SITE_URL, site } from '@/config/site'
import { getEventBySlug, getEventForm, listEvents } from '@/lib/content'
import { formatDate, isUpcoming } from '@/lib/date'
import { buildMetadata } from '@/seo/nextMetadata'
import { eventImage, eventSchema, eventSummary } from '@/seo/contentSchemas'
import {
  breadcrumbSchema,
  buildGraph,
  organisationSchema,
  personSchema,
  webPageSchema,
  websiteSchema,
} from '@/seo/structuredData'
import { RegistrationForm } from '../RegistrationForm'

export const revalidate = 60
export const dynamicParams = true

type Params = { slug: string }

export async function generateStaticParams(): Promise<Params[]> {
  const events = await listEvents()
  return events.map((event) => ({ slug: event.slug }))
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params
  const event = await getEventBySlug(slug)
  if (!event) return {}

  const summary = eventSummary(event)
  return buildMetadata({
    title: event.name.length > 40 ? event.name : `${event.name} | Events at ${site.name}`,
    description: summary,
    canonical: `${SITE_URL}/events/${event.slug}`,
    ogType: 'article',
    ogImage: eventImage(event),
    ogImageAlt: event.mainImage?.alt || event.name,
  })
}

export default async function EventDetailPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params
  const event = await getEventBySlug(slug)
  if (!event) notFound()

  const summary = eventSummary(event)
  const upcoming = isUpcoming(event.date)
  const form = upcoming ? await getEventForm(event.id) : null

  const jsonLd = buildGraph([
    organisationSchema(),
    personSchema(),
    websiteSchema(),
    webPageSchema({ path: `/events/${event.slug}`, name: event.name, description: summary }),
    eventSchema(event),
    breadcrumbSchema([
      { name: 'Home', path: '/' },
      { name: 'Events', path: '/events' },
      { name: event.name, path: `/events/${event.slug}` },
    ]),
  ])

  return (
    <>
      <JsonLd data={jsonLd} />

      <article className="pt-[clamp(120px,16vh,168px)]">
        <header className="pb-10">
          <Container width="narrow">
            <nav aria-label="Breadcrumb" className="eyebrow flex items-center gap-2 text-ink-soft">
              <Link href="/events" className="footer-link hover:text-ink">
                Events
              </Link>
              <span aria-hidden>/</span>
              <span aria-current="page" className="text-ink">
                {event.name}
              </span>
            </nav>

            <p className="eyebrow mt-5 flex items-center gap-2">
              <span className={upcoming ? 'rounded-full bg-brand px-2 py-0.5 text-ink' : 'rounded-full bg-paper-2 px-2 py-0.5 text-ink-soft'}>
                {upcoming ? 'Upcoming' : 'Past event'}
              </span>
              <time dateTime={event.date} className="text-ink-soft">
                {formatDate(event.date)}
              </time>
            </p>

            <h1 className="font-display mt-4 font-medium leading-[1.06] tracking-[-0.02em]" style={{ fontSize: 'clamp(2rem, 4.4vw, 3.2rem)' }}>
              {event.name}
            </h1>

            {event.shortDescription && <p className="mt-4 text-[1.08rem] text-ink-soft">{event.shortDescription}</p>}
          </Container>
        </header>

        {event.mainImage && (
          <Container>
            <div className="overflow-hidden rounded-card">
              <ContentImage
                image={event.mainImage}
                width={1120}
                height={630}
                sizes="(min-width: 74rem) 70rem, 100vw"
                className="w-full object-cover"
                priority
              />
            </div>
          </Container>
        )}

        <section className="py-12 md:py-16">
          <Container width="narrow">
            <RichText html={event.description} />
          </Container>
        </section>

        {event.imageGallery.length > 0 && (
          <section className="bg-paper-2 py-12 md:py-16">
            <Container>
              <h2 className="font-display text-[1.4rem] font-semibold">Gallery</h2>
              <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {event.imageGallery.map((image) => (
                  <li key={image.publicId || image.url} className="img-zoom overflow-hidden rounded-card">
                    <ContentImage
                      image={image}
                      width={520}
                      height={390}
                      sizes="(min-width: 64rem) 20rem, (min-width: 40rem) 45vw, 100vw"
                      className="aspect-[4/3] w-full object-cover"
                    />
                  </li>
                ))}
              </ul>
            </Container>
          </section>
        )}

        {upcoming && form && (
          <section id="register" className="py-12 md:py-16">
            <Container width="narrow">
              <RegistrationForm event={event} form={form} />
            </Container>
          </section>
        )}
      </article>

      <CtaBanner
        title="Not sure this is the right fit?"
        body="Tell us a little about your child and we will point you to the session that suits them best."
      />
    </>
  )
}
