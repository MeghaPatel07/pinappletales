/**
 * The shapes stored in Firestore and rendered by the site.
 *
 * One definition serves the admin (which writes them), the public pages (which
 * read them) and the prerender script (which bakes them into static HTML), so
 * a field can never mean two different things in two places.
 */

/** An image held by Cloudinary. Dimensions are kept so pages can reserve space. */
export type CloudinaryImage = {
  /** Delivery URL, always https. Transformations are applied on top of this. */
  url: string
  /** Cloudinary identifier — needed to build transformed variants. */
  publicId: string
  width: number
  height: number
  /** Author-supplied alt text. Empty string means decorative. */
  alt: string
}

/** Fields every master shares. */
type BaseRecord = {
  id: string
  isActive: boolean
  /** ISO 8601, set by the server on write. */
  createdAt?: string
  updatedAt?: string
}

// -----------------------------------------------------------------------------
// Blog
// -----------------------------------------------------------------------------

export type BlogPost = BaseRecord & {
  title: string
  /** URL segment; unique across posts. Drives /blog/:slug and its canonical. */
  slug: string
  /** Optional teaser used on cards and as the meta description fallback. */
  shortDescription: string
  /** Optional hero image. */
  bannerImage: CloudinaryImage | null
  /** Publication date, ISO yyyy-mm-dd. */
  date: string
  /** Estimated reading time in minutes. */
  minuteRead: number
  /** Long-form body: sanitised HTML produced by the editor. */
  description: string
  author: string
  /** Featured post — surfaced at the top of the index. */
  isPrimary: boolean
}

// -----------------------------------------------------------------------------
// Event
// -----------------------------------------------------------------------------

export type EventItem = BaseRecord & {
  name: string
  slug: string
  /** Event date, ISO yyyy-mm-dd. */
  date: string
  shortDescription: string
  /** Sanitised HTML. */
  description: string
  mainImage: CloudinaryImage | null
  imageGallery: CloudinaryImage[]
  /** The one event surfaced in the home page's upcoming event feature. */
  isPrimary: boolean
}

// -----------------------------------------------------------------------------
// Testimonial
// -----------------------------------------------------------------------------

export type Testimonial = BaseRecord & {
  testimonial: string
  name: string
  designation: string
  showOnHome: boolean
}

// -----------------------------------------------------------------------------
// Podcast
// -----------------------------------------------------------------------------

export type Podcast = BaseRecord & {
  name: string
  slug: string
  /** Any YouTube URL form; the video id is derived at render time. */
  youtubeLink: string
  /** Sanitised HTML. */
  description: string
  /** Publication date, ISO yyyy-mm-dd. */
  date: string
}

// -----------------------------------------------------------------------------
// Event registration form (a form builder, one form per event)
// -----------------------------------------------------------------------------

export type EventFormFieldType =
  | 'text'
  | 'email'
  | 'tel'
  | 'number'
  | 'date'
  | 'textarea'
  | 'select'
  | 'radio'
  | 'checkbox'

export type EventFormField = {
  /** Stable id, used as the React key and for reordering. */
  id: string
  /** The key this answer is stored under in a submission's `values` map. */
  name: string
  label: string
  type: EventFormFieldType
  placeholder: string
  helpText: string
  required: boolean
  /** Choices for select / radio / checkbox. Ignored for other types. */
  options: string[]
}

/**
 * Stored at eventForms/{eventId} — the document id *is* the event id, which
 * makes "the form for this event" a direct lookup rather than a query.
 */
export type EventForm = {
  eventId: string
  isActive: boolean
  /** Inclusive yyyy-mm-dd window for accepting registrations. Empty is unbounded. */
  registrationStartDate: string
  registrationEndDate: string
  title: string
  intro: string
  submitLabel: string
  successMessage: string
  fields: EventFormField[]
  createdAt?: string
  updatedAt?: string
}

export type EventRegistration = {
  id: string
  eventId: string
  /** Denormalised so the admin list stays readable if an event is renamed. */
  eventName: string
  /** Answers keyed by EventFormField.name. Checkboxes hold an array. */
  values: Record<string, string | string[]>
  createdAt: string
}

// -----------------------------------------------------------------------------
// Admin
// -----------------------------------------------------------------------------

/** An entry in the admins allow-list. Presence of the document grants access. */
export type AdminUser = {
  id: string
  email: string
  name: string
  createdAt?: string
}

/** Collection names, in one place so a typo cannot silently query nothing. */
export const COLLECTIONS = {
  blogs: 'blogs',
  events: 'events',
  podcasts: 'podcasts',
  testimonials: 'testimonials',
  eventForms: 'eventForms',
  eventRegistrations: 'eventRegistrations',
  admins: 'admins',
} as const
