/**
 * Build-time content collection.
 *
 * Called once by scripts/prerender.mjs. It reads every published record from
 * Firestore and returns, for each one, the route to write, the <head> to write
 * into it, and the data to embed so the page hydrates without refetching.
 *
 * This is what makes a blog post a real static document: crawlers, link
 * unfurlers and no-JS visitors get the full article with its own canonical and
 * JSON-LD, rather than an empty shell that only fills in once JavaScript runs.
 *
 * Content published after a build has no file yet; the hosting rewrite serves
 * the shell and the page fetches itself at runtime. The next deploy bakes it.
 *
 * A failed query propagates and fails the build. Baking an empty blog index
 * into static HTML because Firestore was briefly unreachable is far worse than
 * a build that stops and says so. An unconfigured Firebase is not a failure —
 * it yields empty lists — so the site still builds before .env has been filled.
 */

import { SITE_URL, site } from '@/config/site'
import { getPrimaryEvent, listBlogPosts, listEvents, listHomeTestimonials, listPodcasts } from './api'
import { getEventForm } from './api'
import { snapshotKeys } from './snapshot'
import type { PageSeo } from '@/seo/seo.config'
import {
  blogImage,
  blogPostingSchema,
  blogSummary,
  eventImage,
  eventSchema,
  eventSummary,
  itemListSchema,
} from '@/seo/contentSchemas'
import {
  breadcrumbSchema,
  buildGraph,
  organisationSchema,
  personSchema,
  webPageSchema,
  websiteSchema,
} from '@/seo/structuredData'
import type { BlogPost, EventItem } from '@/types/content'

export type ContentRoute = {
  /** URL path to write, e.g. /blog/how-art-helps. */
  path: string
  seo: PageSeo
  /** Injected as window.__CONTENT__ and used for the SSR render. */
  snapshot: Record<string, unknown>
}

export type CollectedContent = {
  /** One entry per blog post and event. */
  routes: ContentRoute[]
  /**
   * Extra snapshot data for the fixed index routes, merged in by the script so
   * /blog, /events and /podcast ship their listings as real markup too.
   */
  indexSnapshots: Record<string, Record<string, unknown>>
  counts: { blogs: number; events: number; podcasts: number }
}

const baseGraph = () => [organisationSchema(), personSchema(), websiteSchema()]

function blogRoute(post: BlogPost, all: BlogPost[]): ContentRoute {
  const path = `/blog/${post.slug}`
  const summary = blogSummary(post)

  return {
    path,
    seo: {
      path,
      // Titles are kept under roughly 60 characters where the post title
      // allows; the suffix is dropped when it would push past that.
      title:
        post.title.length > 45
          ? post.title
          : `${post.title} | ${site.name}`,
      description: summary,
      canonical: `${SITE_URL}${path}`,
      ogType: 'article',
      ogImage: blogImage(post),
      ogImageAlt: post.bannerImage?.alt || post.title,
      sitemap: { changefreq: 'yearly', priority: 0.6 },
      publishedTime: post.date,
      modifiedTime: (post.updatedAt ?? post.date).slice(0, 10),
      author: post.author,
      lastmod: (post.updatedAt ?? post.date).slice(0, 10),
      jsonLd: buildGraph([
        ...baseGraph(),
        webPageSchema({ path, name: post.title, description: summary }),
        blogPostingSchema(post),
        breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Blog', path: '/blog' },
          { name: post.title, path },
        ]),
      ]),
    },
    snapshot: {
      [snapshotKeys.blogPost(post.slug)]: post,
      // The article page also renders a "more reading" strip from the index.
      [snapshotKeys.blogIndex]: all,
    },
  }
}

function eventRoute(
  event: EventItem,
  form: unknown,
): ContentRoute {
  const path = `/events/${event.slug}`
  const summary = eventSummary(event)

  return {
    path,
    seo: {
      path,
      title:
        event.name.length > 40
          ? event.name
          : `${event.name} | Events at ${site.name}`,
      description: summary,
      canonical: `${SITE_URL}${path}`,
      ogType: 'article',
      ogImage: eventImage(event),
      ogImageAlt: event.mainImage?.alt || event.name,
      sitemap: { changefreq: 'weekly', priority: 0.7 },
      lastmod: (event.updatedAt ?? event.date).slice(0, 10),
      jsonLd: buildGraph([
        ...baseGraph(),
        webPageSchema({ path, name: event.name, description: summary }),
        eventSchema(event),
        breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Events', path: '/events' },
          { name: event.name, path },
        ]),
      ]),
    },
    snapshot: {
      [snapshotKeys.event(event.slug)]: event,
      [snapshotKeys.eventForm(event.id)]: form,
    },
  }
}

export async function collectContentRoutes(): Promise<CollectedContent> {
  const [posts, events, podcasts, testimonials, primaryEvent] = await Promise.all([
    listBlogPosts(),
    listEvents(),
    listPodcasts(),
    listHomeTestimonials(),
    getPrimaryEvent(),
  ])

  // Registration forms are fetched alongside their events so an event page can
  // be rendered complete, form included.
  const forms = await Promise.all(
    events.map(async (event) => [event.id, await getEventForm(event.id)] as const),
  )
  const formByEventId = new Map(forms)

  const routes: ContentRoute[] = [
    ...posts.map((post) => blogRoute(post, posts)),
    ...events.map((event) =>
      eventRoute(event, formByEventId.get(event.id) ?? null),
    ),
  ]

  return {
    routes,
    indexSnapshots: {
      '/': {
        [snapshotKeys.homeTestimonials]: testimonials,
        [snapshotKeys.homeEvent]: primaryEvent,
      },
      '/blog': { [snapshotKeys.blogIndex]: posts },
      '/events': { [snapshotKeys.eventIndex]: events },
      '/podcast': { [snapshotKeys.podcastIndex]: podcasts },
    },
    counts: {
      blogs: posts.length,
      events: events.length,
      podcasts: podcasts.length,
    },
  }
}

/**
 * ItemList structured data for the index pages, built once the records are
 * known. Merged into those pages' existing @graph by the script.
 */
export function indexListSchemas(content: CollectedContent) {
  const posts = (content.indexSnapshots['/blog']?.[snapshotKeys.blogIndex] ??
    []) as BlogPost[]
  const events = (content.indexSnapshots['/events']?.[snapshotKeys.eventIndex] ??
    []) as EventItem[]

  return {
    '/blog': itemListSchema(
      `Articles from ${site.name}`,
      posts.map((post) => ({
        url: `${SITE_URL}/blog/${post.slug}`,
        name: post.title,
      })),
    ),
    '/events': itemListSchema(
      `Events at ${site.name}`,
      events.map((event) => ({
        url: `${SITE_URL}/events/${event.slug}`,
        name: event.name,
      })),
    ),
  }
}
