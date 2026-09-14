/**
 * Reads content for a page, preferring what was baked in at build time.
 *
 * Behaviour depends on whether a snapshot exists for this route:
 *
 *   with a snapshot     renders immediately with no loading state, then
 *                       refetches in the background so anything published
 *                       since the last deploy still shows up
 *
 *   without a snapshot  fetches on mount and shows a loading state — the path
 *                       taken by content newer than the last build
 */

import { useEffect, useRef, useState } from 'react'
import { readSnapshot } from './snapshot'

export type ContentState<T> = {
  data: T | undefined
  /** True only when there is nothing to show yet. */
  loading: boolean
  /** Set when the fetch failed and no snapshot was available to fall back on. */
  failed: boolean
}

export function useContent<T>(
  key: string,
  load: () => Promise<T>,
): ContentState<T> {
  const snapshot = readSnapshot<T>(key)

  const [data, setData] = useState<T | undefined>(snapshot)
  const [loading, setLoading] = useState(snapshot === undefined)
  const [failed, setFailed] = useState(false)

  // `load` is a new closure each render; the key is what identifies the query.
  const loadRef = useRef(load)
  loadRef.current = load

  useEffect(() => {
    let cancelled = false

    // A key change means a different record — drop the previous one so the
    // page never shows one post's body under another's title.
    const existing = readSnapshot<T>(key)
    if (existing === undefined) {
      setLoading(true)
    } else {
      setData(existing)
      setLoading(false)
    }
    setFailed(false)

    void (async () => {
      try {
        const result = await loadRef.current()
        if (cancelled) return

        setData(result)
        setFailed(false)
      } catch (error) {
        console.error(`[content] loading "${key}" failed:`, error)
        if (!cancelled) setFailed(readSnapshot<T>(key) === undefined)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [key])

  return { data, loading, failed }
}
