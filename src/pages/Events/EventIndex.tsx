import { useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Container } from '@/components/ui/Container'
import { ContentImage } from '@/components/ui/ContentImage'
import { Icon } from '@/components/ui/Icon'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { PageHero } from '@/components/sections/PageHero'
import { CtaBanner } from '@/components/sections/CtaBanner'
import { listEvents } from '@/content/api'
import { snapshotKeys } from '@/content/snapshot'
import { useContent } from '@/content/useContent'
import { formatDate, isUpcoming } from '@/lib/date'
import { eventSummary } from '@/seo/contentSchemas'
import type { EventItem } from '@/types/content'
import styles from './Events.module.css'

export default function EventIndex() {
  const load = useCallback(() => listEvents(), [])
  const { data, loading, failed } = useContent<EventItem[]>(
    snapshotKeys.eventIndex,
    load,
  )

  const events = useMemo(() => data ?? [], [data])

  const { upcoming, past } = useMemo(() => {
    const upcomingEvents = events
      .filter((event) => isUpcoming(event.date))
      // Soonest first, which is the opposite of the archive's ordering.
      .sort((a, b) => a.date.localeCompare(b.date))

    return {
      upcoming: upcomingEvents,
      past: events.filter((event) => !isUpcoming(event.date)),
    }
  }, [events])

  return (
    <>
      <PageHero
        eyebrow="Workshops & sessions"
        title="Events at Pineappletales"
        lead="Group workshops, seasonal studios and parent sessions — held at the Vadodara studio and online. Registration for each event is open on its own page."
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Events' }]}
      />

      <Section>
        <Container>
          {loading && <p className={styles.status}>Loading events…</p>}

          {!loading && failed && (
            <p className={styles.status}>
              The events could not be loaded just now. Please refresh the page.
            </p>
          )}

          {!loading && !failed && events.length === 0 && (
            <p className={styles.status}>
              There are no events listed at the moment. New workshops are announced
              here and on Instagram.
            </p>
          )}

          {upcoming.length > 0 && (
            <>
              <SectionHeading
                eyebrow="Open for registration"
                title="Upcoming events"
              />
              <ul className={styles.grid}>
                {upcoming.map((event, index) => (
                  <EventCard key={event.id} event={event} priority={index === 0} />
                ))}
              </ul>
            </>
          )}

          {past.length > 0 && (
            <div className={upcoming.length > 0 ? styles.pastSection : undefined}>
              <SectionHeading
                eyebrow="Archive"
                title="Previous events"
                lead="A record of workshops already held — useful for a sense of how sessions run."
              />
              <ul className={styles.grid}>
                {past.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </ul>
            </div>
          )}
        </Container>
      </Section>

      <CtaBanner
        title="Want a workshop for your school or group?"
        body="Sessions can be arranged for schools, NGOs and parent groups, in Vadodara or online."
        primaryLabel="Enquire about a workshop"
      />
    </>
  )
}

function EventCard({ event, priority }: { event: EventItem; priority?: boolean }) {
  const upcoming = isUpcoming(event.date)

  return (
    <li>
      <article className={styles.card}>
        <Link to={`/events/${event.slug}`} className={styles.cardLink}>
          {event.mainImage ? (
            <ContentImage
              image={event.mainImage}
              width={480}
              height={300}
              sizes="(min-width: 64rem) 22rem, (min-width: 40rem) 45vw, 100vw"
              className={styles.cardImage}
              priority={priority}
            />
          ) : (
            <div className={styles.cardImagePlaceholder} aria-hidden="true">
              <Icon name="calendar" size={28} />
            </div>
          )}

          <div className={styles.cardBody}>
            <p className={styles.cardMeta}>
              <span className={upcoming ? styles.tagUpcoming : styles.tagPast}>
                {upcoming ? 'Upcoming' : 'Past'}
              </span>
              <time dateTime={event.date}>{formatDate(event.date)}</time>
            </p>

            <h3 className={styles.cardTitle}>{event.name}</h3>
            <p className={styles.cardSummary}>{eventSummary(event)}</p>

            <span className={styles.readMore}>
              {upcoming ? 'Details and registration' : 'View this event'}
              <Icon name="arrowRight" size={15} />
            </span>
          </div>
        </Link>
      </article>
    </li>
  )
}
