/**
 * URL slugs.
 *
 * A slug is part of a page's canonical URL, so once a post is published its
 * slug should not change — the admin generates one from the title but leaves it
 * editable and never silently rewrites it afterwards.
 */

/**
 * Combining diacritical marks (U+0300–U+036F), which NFKD normalisation splits
 * off. Built from a string so the source stays ASCII and the range is legible.
 */
const COMBINING_MARKS = new RegExp('[\\u0300-\\u036f]', 'g')

/** Turns a title into a lowercase, hyphenated, URL-safe segment. */
export function slugify(input: string): string {
  return input
    .normalize('NFKD')
    // Strip the accents NFKD just separated, so "Café" becomes "cafe".
    .replace(COMBINING_MARKS, '')
    .toLowerCase()
    // Apostrophes join words rather than break them: "child's" → "childs".
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/, '')
}

/** True when a slug is safe to put in a URL. */
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) && slug.length <= 80
}

/**
 * Appends -2, -3 … until the slug is unique within `taken`.
 * Used when a second post is given a title that already exists.
 */
export function uniqueSlug(base: string, taken: Iterable<string>): string {
  const existing = new Set(taken)
  if (!existing.has(base)) return base

  let suffix = 2
  while (existing.has(`${base}-${suffix}`)) suffix += 1
  return `${base}-${suffix}`
}
