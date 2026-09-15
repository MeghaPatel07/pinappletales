/**
 * Raw API documents → typed content.
 *
 * The API already returns clean, typed JSON (see lib/models/*'s toJSON
 * transforms), but every field is still read defensively here: a record
 * saved before a field existed must still render rather than crash the page,
 * and this is the one place that assumption lives.
 */

import type {
  BlogPost,
  CloudinaryImage,
  EventForm,
  EventFormField,
  EventItem,
  EventRegistration,
  Podcast,
  Testimonial,
} from '@/types/content'
import type { RawDocument } from '@/lib/apiTypes'

const str = (value: unknown, fallback = ''): string =>
  typeof value === 'string' ? value : fallback

const num = (value: unknown, fallback = 0): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback

const bool = (value: unknown, fallback = false): boolean =>
  typeof value === 'boolean' ? value : fallback

const list = (value: unknown): unknown[] => (Array.isArray(value) ? value : [])

/** ISO date, normalised to yyyy-mm-dd. Accepts a full timestamp too. */
const isoDate = (value: unknown): string => {
  const raw = str(value)
  if (!raw) return ''
  return raw.length > 10 ? raw.slice(0, 10) : raw
}

function toImage(value: unknown): CloudinaryImage | null {
  if (!value || typeof value !== 'object') return null
  const record = value as Record<string, unknown>
  const url = str(record.url)
  if (!url) return null

  return {
    url,
    publicId: str(record.publicId),
    width: num(record.width),
    height: num(record.height),
    alt: str(record.alt),
  }
}

function toImageList(value: unknown): CloudinaryImage[] {
  return list(value)
    .map(toImage)
    .filter((image): image is CloudinaryImage => image !== null)
}

export function toBlogPost(doc: RawDocument): BlogPost {
  return {
    id: doc.id,
    title: str(doc.title),
    slug: str(doc.slug, doc.id),
    shortDescription: str(doc.shortDescription),
    bannerImage: toImage(doc.bannerImage),
    date: isoDate(doc.date),
    minuteRead: num(doc.minuteRead),
    description: str(doc.description),
    author: str(doc.author),
    isActive: bool(doc.isActive),
    isPrimary: bool(doc.isPrimary),
    createdAt: str(doc.createdAt) || undefined,
    updatedAt: str(doc.updatedAt) || undefined,
  }
}

export function toEventItem(doc: RawDocument): EventItem {
  return {
    id: doc.id,
    name: str(doc.name),
    slug: str(doc.slug, doc.id),
    date: isoDate(doc.date),
    shortDescription: str(doc.shortDescription),
    description: str(doc.description),
    mainImage: toImage(doc.mainImage),
    imageGallery: toImageList(doc.imageGallery),
    isPrimary: bool(doc.isPrimary),
    isActive: bool(doc.isActive),
    createdAt: str(doc.createdAt) || undefined,
    updatedAt: str(doc.updatedAt) || undefined,
  }
}

export function toTestimonial(doc: RawDocument): Testimonial {
  return {
    id: doc.id,
    testimonial: str(doc.testimonial),
    name: str(doc.name),
    designation: str(doc.designation),
    showOnHome: bool(doc.showOnHome),
    isActive: bool(doc.isActive),
    createdAt: str(doc.createdAt) || undefined,
    updatedAt: str(doc.updatedAt) || undefined,
  }
}

export function toPodcast(doc: RawDocument): Podcast {
  return {
    id: doc.id,
    name: str(doc.name),
    slug: str(doc.slug, doc.id),
    youtubeLink: str(doc.youtubeLink),
    description: str(doc.description),
    date: isoDate(doc.date),
    isActive: bool(doc.isActive),
    createdAt: str(doc.createdAt) || undefined,
    updatedAt: str(doc.updatedAt) || undefined,
  }
}

function toFormField(value: unknown, index: number): EventFormField | null {
  if (!value || typeof value !== 'object') return null
  const record = value as Record<string, unknown>

  const label = str(record.label)
  if (!label) return null

  return {
    id: str(record.id, `field-${index}`),
    name: str(record.name, `field_${index}`),
    label,
    type: (str(record.type, 'text') as EventFormField['type']) ?? 'text',
    placeholder: str(record.placeholder),
    helpText: str(record.helpText),
    required: bool(record.required),
    options: list(record.options).map((option) => str(option)).filter(Boolean),
  }
}

export function toEventForm(doc: RawDocument): EventForm {
  return {
    // The document id is the event id — see lib/models/EventForm.ts.
    eventId: str(doc.eventId, doc.id),
    isActive: bool(doc.isActive),
    registrationStartDate: isoDate(doc.registrationStartDate),
    registrationEndDate: isoDate(doc.registrationEndDate),
    title: str(doc.title, 'Register for this event'),
    intro: str(doc.intro),
    submitLabel: str(doc.submitLabel, 'Submit registration'),
    successMessage: str(
      doc.successMessage,
      'Thank you — your registration has been received.',
    ),
    fields: list(doc.fields)
      .map(toFormField)
      .filter((field): field is EventFormField => field !== null),
    createdAt: str(doc.createdAt) || undefined,
    updatedAt: str(doc.updatedAt) || undefined,
  }
}

export function toEventRegistration(doc: RawDocument): EventRegistration {
  const rawValues =
    doc.values && typeof doc.values === 'object'
      ? (doc.values as Record<string, unknown>)
      : {}

  const values: Record<string, string | string[]> = {}
  for (const [key, value] of Object.entries(rawValues)) {
    values[key] = Array.isArray(value) ? value.map((item) => str(item)) : str(value)
  }

  return {
    id: doc.id,
    eventId: str(doc.eventId),
    eventName: str(doc.eventName),
    values,
    createdAt: str(doc.createdAt),
  }
}
