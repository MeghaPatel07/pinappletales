/**
 * Structured data for the database-driven pages.
 *
 * Kept apart from structuredData.ts because these builders take a record as
 * input rather than reading from the static config, and because the prerender
 * script imports them per item.
 */

import { SITE_URL, site } from '@/config/site'
import { excerpt, htmlToText } from '@/lib/html'
import { cloudinaryUrl } from '@/lib/cloudinary'
import { youtubeId, youtubeThumbnail, youtubeWatchUrl } from '@/lib/youtube'
import type { BlogPost, EventItem, Podcast } from '@/types/content'
import {
  ORGANISATION_ID,
  PERSON_ID,
  WEBSITE_ID,
  absoluteUrl,
  type JsonLd,
} from './structuredData'

/** Share image for a record, falling back to the site's default. */
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.jpg`

export function blogImage(post: BlogPost): string {
  return post.bannerImage
    ? cloudinaryUrl(post.bannerImage, { width: 1200, height: 630, crop: 'fill', gravity: 'auto' })
    : DEFAULT_OG_IMAGE
}

export function eventImage(event: EventItem): string {
  return event.mainImage
    ? cloudinaryUrl(event.mainImage, { width: 1200, height: 630, crop: 'fill', gravity: 'auto' })
    : DEFAULT_OG_IMAGE
}

/** The teaser an author wrote, or the opening of the body if they wrote none. */
export function blogSummary(post: BlogPost): string {
  return post.shortDescription || excerpt(post.description, 160)
}

export function eventSummary(event: EventItem): string {
  return event.shortDescription || excerpt(event.description, 160)
}

export function blogPostingSchema(post: BlogPost): JsonLd {
  const url = absoluteUrl(`/blog/${post.slug}`)

  return {
    '@type': 'BlogPosting',
    '@id': `${url}#article`,
    headline: post.title,
    description: blogSummary(post),
    url,
    mainEntityOfPage: { '@id': `${url}#webpage` },
    datePublished: post.date,
    dateModified: (post.updatedAt ?? post.date).slice(0, 10),
    author: { '@type': 'Person', name: post.author, ...(post.author === 'Kenaa Jadeja' ? { '@id': PERSON_ID } : {}) },
    publisher: { '@id': ORGANISATION_ID },
    image: blogImage(post),
    inLanguage: 'en-IN',
    wordCount: htmlToText(post.description).split(/\s+/).filter(Boolean).length,
    isPartOf: { '@id': WEBSITE_ID },
  }
}

export function eventSchema(event: EventItem): JsonLd {
  const url = absoluteUrl(`/events/${event.slug}`)

  return {
    '@type': 'Event',
    '@id': `${url}#event`,
    name: event.name,
    description: eventSummary(event),
    url,
    startDate: event.date,
    // Neither an in-person nor an online event is assumed; the organiser's
    // address is given as the default location.
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    location: { '@id': ORGANISATION_ID },
    organizer: { '@id': ORGANISATION_ID },
    performer: { '@id': PERSON_ID },
    image: eventImage(event),
    inLanguage: 'en-IN',
  }
}

export function podcastEpisodeSchema(podcast: Podcast): JsonLd {
  const url = absoluteUrl(`/podcast#${podcast.slug}`)
  const videoId = youtubeId(podcast.youtubeLink)

  return {
    '@type': 'PodcastEpisode',
    '@id': `${url}`,
    name: podcast.name,
    description: excerpt(podcast.description, 200),
    url,
    datePublished: podcast.date,
    partOfSeries: {
      '@type': 'PodcastSeries',
      name: `${site.name} Podcast`,
      url: absoluteUrl('/podcast'),
    },
    ...(videoId
      ? {
          associatedMedia: {
            '@type': 'VideoObject',
            name: podcast.name,
            description: excerpt(podcast.description, 200),
            thumbnailUrl: youtubeThumbnail(videoId),
            uploadDate: podcast.date,
            embedUrl: `https://www.youtube.com/embed/${videoId}`,
            contentUrl: youtubeWatchUrl(videoId),
          },
        }
      : {}),
  }
}

/** ItemList for an index page, which helps the set be understood as a series. */
export function itemListSchema(
  name: string,
  items: readonly { url: string; name: string }[],
): JsonLd {
  return {
    '@type': 'ItemList',
    name,
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: item.url,
      name: item.name,
    })),
  }
}
