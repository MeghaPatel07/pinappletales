/**
 * Content baked into a page at build time.
 *
 * scripts/prerender.mjs fetches published content, hands it to the SSR render,
 * and writes the same data into the document as `window.__CONTENT__`. The
 * client then starts from exactly what the server rendered, so hydration
 * matches and the page paints its real content immediately — no spinner, no
 * layout shift — before revalidating in the background.
 *
 * Routes with no baked data (anything published since the last build) simply
 * find no snapshot and fetch normally.
 */

type Store = Record<string, unknown>

declare global {
  interface Window {
    __CONTENT__?: Store
  }
}

let store: Store =
  typeof window !== 'undefined' && window.__CONTENT__ ? window.__CONTENT__ : {}

/** Called by the prerender script before each render. Not used in the browser. */
export function setSnapshot(data: Store): void {
  store = data ?? {}
}

export function readSnapshot<T>(key: string): T | undefined {
  return key in store ? (store[key] as T) : undefined
}

/** Cache keys, in one place so the writer and the reader cannot disagree. */
export const snapshotKeys = {
  homeTestimonials: 'home:testimonials',
  homeEvent: 'home:event',
  blogIndex: 'blog:index',
  blogPost: (slug: string) => `blog:post:${slug}`,
  eventIndex: 'events:index',
  event: (slug: string) => `events:item:${slug}`,
  eventForm: (eventId: string) => `events:form:${eventId}`,
  podcastIndex: 'podcasts:index',
} as const
