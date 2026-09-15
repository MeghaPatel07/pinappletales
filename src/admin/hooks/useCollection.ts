/**
 * Loads a whole admin collection once and keeps it in state.
 *
 * Admin lists filter, sort and paginate in memory rather than issuing a query
 * per keystroke: it makes search instant, works across every field at once, and
 * needs no composite index. ADMIN_PAGE_CAP bounds the cost; `truncated` tells
 * the UI when a collection has outgrown that and needs server-side paging.
 */

'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { RawDocument } from '@/lib/apiTypes'
import { ADMIN_PAGE_CAP, describeApiError, listRecords } from '../lib/crud'

type State<T> = {
  items: T[]
  loading: boolean
  error: string
  truncated: boolean
}

export type UseCollectionResult<T> = State<T> & {
  /** Re-reads from Firestore, e.g. after a delete. */
  refresh: () => Promise<void>
  /** Drops an item locally so a delete feels immediate. */
  removeLocal: (id: string) => void
}

export function useCollection<T extends { id: string }>(
  collectionName: string,
  map: (doc: RawDocument) => T,
  options: { orderByField?: string; direction?: 'asc' | 'desc' } = {},
): UseCollectionResult<T> {
  const [state, setState] = useState<State<T>>({
    items: [],
    loading: true,
    error: '',
    truncated: false,
  })

  // Options are usually an inline object literal; holding them in a ref keeps
  // `load` stable so the effect does not re-run on every render.
  const optionsRef = useRef(options)
  optionsRef.current = options

  const mapRef = useRef(map)
  mapRef.current = map

  const load = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: '' }))

    try {
      const items = await listRecords(collectionName, mapRef.current, {
        orderByField: optionsRef.current.orderByField,
        direction: optionsRef.current.direction,
      })

      setState({
        items,
        loading: false,
        error: '',
        truncated: items.length >= ADMIN_PAGE_CAP,
      })
    } catch (error) {
      console.error(`[admin] loading ${collectionName} failed:`, error)
      setState({
        items: [],
        loading: false,
        error: describeApiError(error),
        truncated: false,
      })
    }
  }, [collectionName])

  useEffect(() => {
    void load()
  }, [load])

  const removeLocal = useCallback((id: string) => {
    setState((current) => ({
      ...current,
      items: current.items.filter((item) => item.id !== id),
    }))
  }, [])

  return { ...state, refresh: load, removeLocal }
}
