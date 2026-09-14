/**
 * Public content queries.
 *
 * Every function here reads only published (`isActive`) documents, matching
 * what firestore.rules allows an unauthenticated caller to see. The module is
 * isomorphic: the browser calls it to keep pages fresh, and
 * scripts/prerender.mjs calls it at build time to bake the same content into
 * static HTML.
 */

import { getDocument, runQuery, type RawDocument } from '@/lib/firestore/rest'
import { today } from '@/lib/date'
import { COLLECTIONS } from '@/types/content'
import type { BlogPost, EventForm, EventItem, Podcast, Testimonial } from '@/types/content'
import {
  toBlogPost,
  toEventForm,
  toEventItem,
  toPodcast,
  toTestimonial,
} from './mappers'

/**
 * Ceiling on any single content query. Comfortably above the realistic size of
 * this site's archive while keeping one bad query from pulling the collection.
 */
const MAX_ITEMS = 300

const ACTIVE = { field: 'isActive', op: 'EQUAL' as const, value: true }

/** Newest first. */
const BY_DATE_DESC = [{ field: 'date', direction: 'DESCENDING' as const }]

/**
 * Re-sorts newest-first after the query returns.
 *
 * Firestore already orders these results, so this is normally a no-op. It earns
 * its keep when the composite index behind the sorted query is missing: the
 * REST client falls back to an unsorted read, and without this the page would
 * render in arbitrary order. Sorting at most MAX_ITEMS records costs nothing
 * measurable, and it means the ordering can never silently regress.
 *
 * Undated records sort last rather than jumping to the front, which is what
 * comparing empty strings would otherwise do.
 */
function newestFirst<T extends { date: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    if (!a.date) return b.date ? 1 : 0
    if (!b.date) return -1
    return b.date.localeCompare(a.date)
  })
}

// -----------------------------------------------------------------------------
// Blog
// -----------------------------------------------------------------------------

export async function listBlogPosts(limit = MAX_ITEMS): Promise<BlogPost[]> {
  const documents = await runQuery({
    collection: COLLECTIONS.blogs,
    where: [ACTIVE],
    orderBy: BY_DATE_DESC,
    limit,
  })
  return newestFirst(documents.map(toBlogPost))
}

/**
 * Looks a post up by its URL slug.
 *
 * Two equality filters need no composite index, so this stays a cheap query.
 * Falls back to a document-id read, which keeps links working for posts
 * created before a slug was assigned.
 */
export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  if (!slug) return null

  const matches = await runQuery({
    collection: COLLECTIONS.blogs,
    where: [ACTIVE, { field: 'slug', op: 'EQUAL', value: slug }],
    limit: 1,
  })

  const match = matches[0]
  if (match) return toBlogPost(match)

  return byId(COLLECTIONS.blogs, slug, toBlogPost)
}

// -----------------------------------------------------------------------------
// Events
// -----------------------------------------------------------------------------

export async function listEvents(limit = MAX_ITEMS): Promise<EventItem[]> {
  const documents = await runQuery({
    collection: COLLECTIONS.events,
    where: [ACTIVE],
    orderBy: BY_DATE_DESC,
    limit,
  })
  return newestFirst(documents.map(toEventItem))
}

export async function listHomeTestimonials(limit = MAX_ITEMS): Promise<Testimonial[]> {
  try {
    const documents = await runQuery({
      collection: COLLECTIONS.testimonials,
      where: [ACTIVE, { field: 'showOnHome', op: 'EQUAL', value: true }],
      limit,
    })
    return documents.map(toTestimonial)
  } catch {
    // The collection is optional until the updated Firestore rules are deployed.
    return []
  }
}

export async function getPrimaryEvent(): Promise<EventItem | null> {
  try {
    const documents = await runQuery({
      collection: COLLECTIONS.events,
      where: [ACTIVE, { field: 'isPrimary', op: 'EQUAL', value: true }],
      limit: 1,
    })
    return documents[0] ? toEventItem(documents[0]) : null
  } catch {
    // Existing event pages remain available if this optional index is pending.
    return null
  }
}

export async function getEventBySlug(slug: string): Promise<EventItem | null> {
  if (!slug) return null

  const matches = await runQuery({
    collection: COLLECTIONS.events,
    where: [ACTIVE, { field: 'slug', op: 'EQUAL', value: slug }],
    limit: 1,
  })

  const match = matches[0]
  if (match) return toEventItem(match)

  return byId(COLLECTIONS.events, slug, toEventItem)
}

/**
 * The registration form attached to an event, or null when the event has no
 * form or its form is switched off. Keyed by event id, so this is a direct read.
 */
export async function getEventForm(eventId: string): Promise<EventForm | null> {
  if (!eventId) return null

  const document = await getDocument(COLLECTIONS.eventForms, eventId)
  if (!document) return null

  const form = toEventForm(document)
  const currentDate = today()
  const starts = !form.registrationStartDate || currentDate >= form.registrationStartDate
  const ends = !form.registrationEndDate || currentDate <= form.registrationEndDate
  return form.isActive && form.fields.length > 0 && starts && ends ? form : null
}

// -----------------------------------------------------------------------------
// Podcasts
// -----------------------------------------------------------------------------

export async function listPodcasts(limit = MAX_ITEMS): Promise<Podcast[]> {
  const documents = await runQuery({
    collection: COLLECTIONS.podcasts,
    where: [ACTIVE],
    orderBy: BY_DATE_DESC,
    limit,
  })
  return newestFirst(documents.map(toPodcast))
}

export async function getPodcastBySlug(slug: string): Promise<Podcast | null> {
  if (!slug) return null

  const matches = await runQuery({
    collection: COLLECTIONS.podcasts,
    where: [ACTIVE, { field: 'slug', op: 'EQUAL', value: slug }],
    limit: 1,
  })

  const match = matches[0]
  if (match) return toPodcast(match)

  return byId(COLLECTIONS.podcasts, slug, toPodcast)
}

// -----------------------------------------------------------------------------

/** Direct id read, guarded so an unpublished document is never returned. */
async function byId<T extends { isActive: boolean }>(
  collection: string,
  id: string,
  map: (doc: RawDocument) => T,
): Promise<T | null> {
  const document = await getDocument(collection, id)
  if (!document) return null

  const item = map(document)
  return item.isActive ? item : null
}
