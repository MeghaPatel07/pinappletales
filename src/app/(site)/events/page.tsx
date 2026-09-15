import type { Metadata } from 'next'
import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import { ContentImage } from '@/components/ui/ContentImage'
import { Icon } from '@/components/ui/Icon'
import { PageHero } from '@/components/sections/PageHero'
import { CtaBanner } from '@/components/sections/CtaBanner'
import { JsonLd } from '@/components/JsonLd'
import { listEvents } from '@/lib/content'
import { formatDate, isUpcoming } from '@/lib/date'
import { SITE_URL, site } from '@/config/site'
import { buildMetadata } from '@/seo/nextMetadata'
import { eventSummary, itemListSchema } from '@/seo/contentSchemas'
import {
  breadcrumbSchema,
  buildGraph,
  organisationSchema,
  personSchema,
  webPageSchema,
  websiteSchema,
} from '@/seo/structuredData'
import type { EventItem } from '@/types/content'

export const revalidate = 60

const OG_IMAGE = `${SITE_URL}/og-image.jpg`

export const metadata: Metadata = buildMetadata({
  title: 'Events & Workshops | Pineappletales, Vadodara',
  description:
    'Upcoming Neuro-Art Therapy, Bibliotherapy and creative writing workshops for children and parents in Vadodara, plus a record of previous sessions.',
  canonical: `${SITE_URL}/events`,
  ogType: 'website',
  ogImage: OG_IMAGE,
  ogImageAlt: `Events and workshops at ${site.name}`,
})

function EventCard({ event, priority }: { event: EventItem; priority?: boolean }) {
  const upcoming = isUpcoming(event.date)

  return (
    <li>
      <article className="lift img-zoom overflow-hidden rounded-card border border-line bg-card">
        <Link href={`/events/${event.slug}`}>
          {event.mainImage ? (
            <ContentImage
              image={event.mainImage}
              width={480}
              height={300}
              sizes="(min-width: 64rem) 22rem, (min-width: 40rem) 45vw, 100vw"
              className="aspect-[8/5] w-full object-cover"
              priority={priority}
            />
          ) : (
            <div className="grid aspect-[8/5] w-full place-items-center bg-paper-2 text-ink-soft" aria-hidden>
              <Icon name="calendar" size={28} />
            </div>
          )}

          <div className="p-6">
            <p className="eyebrow flex items-center gap-2 text-ink-soft">
              <span className={upcoming ? 'rounded-full bg-brand px-2 py-0.5 text-ink' : 'rounded-full bg-paper-2 px-2 py-0.5'}>
                {upcoming ? 'Upcoming' : 'Past'}
              </span>
              <time dateTime={event.date}>{formatDate(event.date)}</time>
            </p>

            <h3 className="font-display mt-3 text-[1.2rem] font-semibold leading-[1.25]">{event.name}</h3>
            <p className="mt-2 text-[0.94rem] leading-relaxed text-ink-soft">{eventSummary(event)}</p>

            <span className="arrow-move mt-4 inline-flex items-center gap-1.5 text-[0.88rem] font-medium">
              {upcoming ? 'Details and registration' : 'View this event'} <Icon name="arrowRight" size={15} className="arrow" />
            </span>
          </div>
        </Link>
      </article>
    </li>
  )
}

export default async function EventIndexPage() {
  const events = await listEvents()

  const upcoming = events.filter((event) => isUpcoming(event.date)).sort((a, b) => a.date.localeCompare(b.date))
  const past = events.filter((event) => !isUpcoming(event.date))

  const jsonLd = buildGraph([
    organisationSchema(),
    personSchema(),
    websiteSchema(),
    webPageSchema({
      path: '/events',
      name: `Events — ${site.name}`,
      description: 'Workshops and sessions for children, parents and schools, offline in Vadodara and online.',
      type: 'CollectionPage',
    }),
    breadcrumbSchema([
      { name: 'Home', path: '/' },
      { name: 'Events', path: '/events' },
    ]),
    itemListSchema(
      `Events at ${site.name}`,
      events.map((event) => ({ url: `${SITE_URL}/events/${event.slug}`, name: event.name })),
    ),
  ])

  return (
    <>
      <JsonLd data={jsonLd} />
      <PageHero
        eyebrow="Workshops & sessions"
        title="Events at Pineappletales"
        lead="Group workshops, seasonal studios and parent sessions — held at the Vadodara studio and online. Registration for each event is open on its own page."
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Events' }]}
      />

      <section className="reveal bg-paper py-16 md:py-24">
        <Container>
          {events.length === 0 && (
            <p className="text-ink-soft">There are no events listed at the moment. New workshops are announced here and on Instagram.</p>
          )}

          {upcoming.length > 0 && (
            <>
              <span className="eyebrow text-brand-deep">Open for registration</span>
              <h2 className="font-display mt-3 text-[1.7rem] font-semibold">Upcoming events</h2>
              <ul className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {upcoming.map((event, index) => (
                  <EventCard key={event.id} event={event} priority={index === 0} />
                ))}
              </ul>
            </>
          )}

          {past.length > 0 && (
            <div className={upcoming.length > 0 ? 'mt-16' : ''}>
              <span className="eyebrow text-ink-soft">Archive</span>
              <h2 className="font-display mt-3 text-[1.7rem] font-semibold">Previous events</h2>
              <p className="mt-2 max-w-[52ch] text-[0.98rem] text-ink-soft">
                A record of workshops already held — useful for a sense of how sessions run.
              </p>
              <ul className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {past.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </ul>
            </div>
          )}
        </Container>
      </section>

      <CtaBanner
        title="Want a workshop for your school or group?"
        body="Sessions can be arranged for schools, NGOs and parent groups, in Vadodara or online."
        primaryLabel="Enquire about a workshop"
      />
    </>
  )
}
