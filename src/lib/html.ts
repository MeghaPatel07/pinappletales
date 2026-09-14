/**
 * Helpers for the HTML bodies produced by the admin editor.
 *
 * Deliberately regex-based and DOM-free: these run during prerendering in Node
 * and on public pages, so they must not pull in a parser. Sanitising is a
 * separate concern and happens once on save, inside the admin bundle — see
 * admin/lib/sanitize.ts.
 */

/** Strips tags and collapses whitespace, for meta descriptions and excerpts. */
export function htmlToText(html: string): string {
  return html
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Cuts plain text to `limit` characters on a word boundary.
 * Used for meta descriptions, which are truncated by search engines anyway.
 */
export function excerpt(html: string, limit = 160): string {
  const text = htmlToText(html)
  if (text.length <= limit) return text

  const cut = text.slice(0, limit)
  const lastSpace = cut.lastIndexOf(' ')
  return `${(lastSpace > limit * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`
}

/** Word count of the rendered text — the basis for a reading-time estimate. */
export function wordCount(html: string): number {
  const text = htmlToText(html)
  return text ? text.split(/\s+/).length : 0
}

/** Reading time in whole minutes, at an unhurried 200 words per minute. */
export function readingTime(html: string): number {
  return Math.max(1, Math.round(wordCount(html) / 200))
}

/** First image in the body, used as a fallback share image. */
export function firstImageUrl(html: string): string | null {
  const match = /<img[^>]+src=["']([^"']+)["']/i.exec(html)
  return match?.[1] ?? null
}
