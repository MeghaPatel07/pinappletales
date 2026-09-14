/**
 * Date formatting.
 *
 * Dates are stored as plain `yyyy-mm-dd` strings, never as timestamps, because
 * a publication date has no time zone — a post dated the 5th should read as the
 * 5th everywhere. Parsing therefore treats the value as UTC, which stops a
 * visitor west of Greenwich seeing the 4th.
 */

const LOCALE = 'en-IN'

function parse(iso: string): Date | null {
  if (!iso) return null
  const date = new Date(`${iso.slice(0, 10)}T00:00:00Z`)
  return Number.isNaN(date.getTime()) ? null : date
}

/** "5 March 2026" — used on cards and article headers. */
export function formatDate(iso: string): string {
  const date = parse(iso)
  if (!date) return ''
  return new Intl.DateTimeFormat(LOCALE, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date)
}

/** "5 Mar 2026" — used where space is tight, such as admin tables. */
export function formatDateShort(iso: string): string {
  const date = parse(iso)
  if (!date) return ''
  return new Intl.DateTimeFormat(LOCALE, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date)
}

/** Today as `yyyy-mm-dd`, for date input defaults. */
export function today(): string {
  return new Date().toISOString().slice(0, 10)
}

/** True when the date is today or later — an event that has not happened yet. */
export function isUpcoming(iso: string): boolean {
  const date = parse(iso)
  if (!date) return false
  return date.getTime() >= new Date(today() + 'T00:00:00Z').getTime()
}

/** Formats an ISO timestamp (registrations) with the time included. */
export function formatDateTime(isoTimestamp: string): string {
  if (!isoTimestamp) return ''
  const date = new Date(isoTimestamp)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat(LOCALE, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}
