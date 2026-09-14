/**
 * YouTube link handling for the podcast pages.
 *
 * Admins paste whatever URL they copied from the browser or the share sheet, so
 * every common form is accepted and reduced to a video id.
 */

/**
 * Extracts the 11-character video id from a YouTube URL.
 * Handles watch?v=, youtu.be/, /embed/, /shorts/ and /live/.
 */
export function youtubeId(link: string): string | null {
  if (!link) return null

  const patterns = [
    /[?&]v=([\w-]{11})/,
    /youtu\.be\/([\w-]{11})/,
    /\/embed\/([\w-]{11})/,
    /\/shorts\/([\w-]{11})/,
    /\/live\/([\w-]{11})/,
  ]

  for (const pattern of patterns) {
    const match = pattern.exec(link)
    if (match?.[1]) return match[1]
  }

  // A bare id, pasted without the surrounding URL.
  return /^[\w-]{11}$/.test(link.trim()) ? link.trim() : null
}

/** Privacy-preserving embed URL — youtube-nocookie sets no ad-tracking cookie. */
export function youtubeEmbedUrl(id: string): string {
  return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`
}

/** Poster frame. `hqdefault` exists for every video; `maxres` often does not. */
export function youtubeThumbnail(id: string): string {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
}

export function youtubeWatchUrl(id: string): string {
  return `https://www.youtube.com/watch?v=${id}`
}
