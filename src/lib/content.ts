/**
 * Public content queries — published (`isActive`) records only.
 *
 * Server Components call these directly (no self-fetch over HTTP); the public
 * API routes under app/api/** call the exact same functions, so there is one
 * query implementation behind both.
 */

import { connectToDatabase } from '@/lib/db'
import { BlogPost } from '@/lib/models/BlogPost'
import { Event } from '@/lib/models/Event'
import { EventForm } from '@/lib/models/EventForm'
import { Podcast } from '@/lib/models/Podcast'
import { Testimonial } from '@/lib/models/Testimonial'
import { toPlain } from '@/lib/models/shared'
import { today } from '@/lib/date'
import type {
  BlogPost as BlogPostType,
  EventForm as EventFormType,
  EventItem,
  Podcast as PodcastType,
  Testimonial as TestimonialType,
} from '@/types/content'

const MAX_ITEMS = 300

// -----------------------------------------------------------------------------
// Blog
// -----------------------------------------------------------------------------

export async function listBlogPosts(limit = MAX_ITEMS): Promise<BlogPostType[]> {
  await connectToDatabase()
  const docs = await BlogPost.find({ isActive: true }).sort({ date: -1 }).limit(limit)
  return toPlain(docs.map((doc) => doc.toJSON())) as BlogPostType[]
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPostType | null> {
  if (!slug) return null
  await connectToDatabase()
  const doc = await BlogPost.findOne({ isActive: true, slug })
  return doc ? (toPlain(doc.toJSON()) as BlogPostType) : null
}

// -----------------------------------------------------------------------------
// Events
// -----------------------------------------------------------------------------

export async function listEvents(limit = MAX_ITEMS): Promise<EventItem[]> {
  await connectToDatabase()
  const docs = await Event.find({ isActive: true }).sort({ date: -1 }).limit(limit)
  return toPlain(docs.map((doc) => doc.toJSON())) as EventItem[]
}

export async function getEventBySlug(slug: string): Promise<EventItem | null> {
  if (!slug) return null
  await connectToDatabase()
  const doc = await Event.findOne({ isActive: true, slug })
  return doc ? (toPlain(doc.toJSON()) as EventItem) : null
}

export async function getPrimaryEvent(): Promise<EventItem | null> {
  await connectToDatabase()
  const doc = await Event.findOne({ isActive: true, isPrimary: true })
  return doc ? (toPlain(doc.toJSON()) as EventItem) : null
}

/**
 * The registration form attached to an event, or null when the event has no
 * form, its form is switched off, or the registration window is not open.
 */
export async function getEventForm(eventId: string): Promise<EventFormType | null> {
  if (!eventId) return null
  await connectToDatabase()
  const doc = await EventForm.findOne({ eventId })
  if (!doc) return null

  const form = toPlain(doc.toJSON()) as EventFormType
  const currentDate = today()
  const starts = !form.registrationStartDate || currentDate >= form.registrationStartDate
  const ends = !form.registrationEndDate || currentDate <= form.registrationEndDate
  return form.isActive && form.fields.length > 0 && starts && ends ? form : null
}

// -----------------------------------------------------------------------------
// Testimonials
// -----------------------------------------------------------------------------

export async function listHomeTestimonials(limit = MAX_ITEMS): Promise<TestimonialType[]> {
  await connectToDatabase()
  const docs = await Testimonial.find({ isActive: true, showOnHome: true }).limit(limit)
  return toPlain(docs.map((doc) => doc.toJSON())) as TestimonialType[]
}

// -----------------------------------------------------------------------------
// Podcasts
// -----------------------------------------------------------------------------

export async function listPodcasts(limit = MAX_ITEMS): Promise<PodcastType[]> {
  await connectToDatabase()
  const docs = await Podcast.find({ isActive: true }).sort({ date: -1 }).limit(limit)
  return toPlain(docs.map((doc) => doc.toJSON())) as PodcastType[]
}

export async function getPodcastBySlug(slug: string): Promise<PodcastType | null> {
  if (!slug) return null
  await connectToDatabase()
  const doc = await Podcast.findOne({ isActive: true, slug })
  return doc ? (toPlain(doc.toJSON()) as PodcastType) : null
}
