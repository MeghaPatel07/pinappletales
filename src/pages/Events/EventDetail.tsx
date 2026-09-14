import { useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Container } from '@/components/ui/Container'
import { ContentImage } from '@/components/ui/ContentImage'
import { RichText } from '@/components/ui/RichText'
import { Section } from '@/components/ui/Section'
import { CtaBanner } from '@/components/sections/CtaBanner'
import { SITE_URL, site } from '@/config/site'
import { getEventBySlug, getEventForm } from '@/content/api'
import { snapshotKeys } from '@/content/snapshot'
import { useContent } from '@/content/useContent'
import { formatDate, isUpcoming } from '@/lib/date'
import { DynamicSeo } from '@/seo/Seo'
import { eventImage, eventSchema, eventSummary } from '@/seo/contentSchemas'
import {
  breadcrumbSchema,
  buildGraph,
  organisationSchema,
  personSchema,
  webPageSchema,
  websiteSchema,
} from '@/seo/structuredData'
import type { EventForm, EventItem } from '@/types/content'
import NotFound from '@/pages/NotFound/NotFound'
import { RegistrationForm } from './RegistrationForm'
import styles from './Events.module.css'

export default function EventDetail() {
  const { slug = '' } = useParams<{ slug: string }>()

  const load = useCallback(() => getEventBySlug(slug), [slug])
  const { data: event, loading, failed } = useContent<EventItem | null>(
    snapshotKeys.event(slug),
    load,
  )

  if (loading) {
    return (
      <Section>
        <Container width="narrow">
          <p className={styles.status}>Loading event…</p>
        </Container>
      </Section>
    )
  }

  if (!event) {
    if (failed) {
      return (
        <Section>
          <Container width="narrow">
            <p className={styles.status}>
              This event could not be loaded just now. Please refresh the page.
            </p>
          </Container>
        </Section>
      )
    }
    return <NotFound />
  }

  const canonical = `${SITE_URL}/events/${event.slug}`
  const summary = eventSummary(event)
  const upcoming = isUpcoming(event.date)

  return (
    <>
      <DynamicSeo
        title={`${event.name} | Events at ${site.name}`}
        description={summary}
        canonical={canonical}
        ogType="article"
        ogImage={eventImage(event)}
        ogImageAlt={event.mainImage?.alt || event.name}
        jsonLd={buildGraph([
          organisationSchema(),
          personSchema(),
          websiteSchema(),
          webPageSchema({
            path: `/events/${event.slug}`,
            name: event.name,
            description: summary,
          }),
          eventSchema(event),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Events', path: '/events' },
            { name: event.name, path: `/events/${event.slug}` },
          ]),
        ])}
      />

      <article className={styles.detail}>
        <header className={styles.detailHeader}>
          <Container width="narrow">
            <nav aria-label="Breadcrumb" className={styles.crumbs}>
              <Link to="/events" className={styles.crumbLink}>
                Events
              </Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page">{event.name}</span>
            </nav>

            <p className={styles.detailMeta}>
              <span className={upcoming ? styles.tagUpcoming : styles.tagPast}>
                {upcoming ? 'Upcoming' : 'Past event'}
              </span>
              <time dateTime={event.date}>{formatDate(event.date)}</time>
            </p>

            <h1 className={styles.detailTitle}>{event.name}</h1>

            {event.shortDescription && (
              <p className={styles.detailLead}>{event.shortDescription}</p>
            )}
          </Container>
        </header>

        {event.mainImage && (
          <Container>
            <div className={styles.banner}>
              <ContentImage
                image={event.mainImage}
                width={1120}
                height={630}
                sizes="(min-width: 74rem) 70rem, 100vw"
                className={styles.bannerImage}
                priority
              />
            </div>
          </Container>
        )}

        <Section size="compact">
          <Container width="narrow">
            <RichText html={event.description} />
          </Container>
        </Section>

        {event.imageGallery.length > 0 && (
          <Section tone="alt" size="compact">
            <Container>
              <h2 className={styles.galleryHeading}>Gallery</h2>
              <ul className={styles.gallery}>
                {event.imageGallery.map((image) => (
                  <li key={image.publicId || image.url} className={styles.galleryItem}>
                    <ContentImage
                      image={image}
                      width={520}
                      height={390}
                      sizes="(min-width: 64rem) 20rem, (min-width: 40rem) 45vw, 100vw"
                      className={styles.galleryImage}
                    />
                  </li>
                ))}
              </ul>
            </Container>
          </Section>
        )}

        <EventRegistration event={event} upcoming={upcoming} />
      </article>

      <CtaBanner
        title="Not sure this is the right fit?"
        body="Tell us a little about your child and we will point you to the session that suits them best."
      />
    </>
  )
}

/**
 * The registration form, if this event has one.
 *
 * Fetched separately from the event so a missing or switched-off form never
 * delays the page content itself.
 */
function EventRegistration({
  event,
  upcoming,
}: {
  event: EventItem
  upcoming: boolean
}) {
  const load = useCallback(() => getEventForm(event.id), [event.id])
  const { data: form, loading } = useContent<EventForm | null>(
    snapshotKeys.eventForm(event.id),
    load,
  )

  // A past event keeps its page but stops taking registrations.
  if (!upcoming) return null
  if (loading || !form) return null

  return (
    <Section id="register" size="compact">
      <Container width="narrow">
        <RegistrationForm event={event} form={form} />
      </Container>
    </Section>
  )
}
