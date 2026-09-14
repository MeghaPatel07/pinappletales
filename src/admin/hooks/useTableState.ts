/**
 * Search / sort / pagination state for an admin list.
 *
 * State lives in the URL rather than component state, so a filtered view can be
 * bookmarked, shared, and survives the back button after opening a record and
 * returning. Typing is debounced before it reaches the URL, which keeps the
 * address bar from thrashing on every keystroke.
 */

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

export type SortDirection = 'asc' | 'desc'

/**
 * A single filter value kept in the query string, for controls that sit
 * alongside the search box (status, event picker). Held in the URL for the same
 * reason the rest of the table state is.
 */
export function useUrlParam(
  key: string,
  fallback: string,
): [string, (value: string) => void] {
  const [params, setParams] = useSearchParams()
  const value = params.get(key) ?? fallback

  const set = (next: string) => {
    setParams(
      (current) => {
        const updated = new URLSearchParams(current)
        if (next === fallback) updated.delete(key)
        else updated.set(key, next)
        // Changing a filter invalidates the current page.
        updated.delete('page')
        return updated
      },
      { replace: true },
    )
  }

  return [value, set]
}

export type TableColumn<T> = {
  key: string
  header: string
  /** Plain value behind the cell — what sorting and searching operate on. */
  value?: (item: T) => string | number | boolean
  sortable?: boolean
  /** Included in search. Defaults to true when `value` is provided. */
  searchable?: boolean
}

export const PER_PAGE_OPTIONS = [10, 25, 50, 100] as const

const DEFAULT_PER_PAGE = 25
const SEARCH_DEBOUNCE_MS = 200

/** Search across every searchable column. */
export const ALL_FIELDS = '__all__'

type Config<T> = {
  items: T[]
  columns: TableColumn<T>[]
  defaultSortKey?: string
  defaultSortDirection?: SortDirection
}

export type TableState<T> = {
  /** The rows to render — filtered, sorted and sliced to the current page. */
  rows: T[]
  /** Rows matching the search, before pagination. */
  matchCount: number

  search: string
  setSearch: (value: string) => void
  searchField: string
  setSearchField: (key: string) => void
  /** Columns offered in the "search in" selector. */
  searchableColumns: TableColumn<T>[]

  sortKey: string
  sortDirection: SortDirection
  toggleSort: (key: string) => void

  page: number
  setPage: (page: number) => void
  perPage: number
  setPerPage: (perPage: number) => void
  pageCount: number
  /** 1-based index of the first row shown, for "showing X–Y of Z". */
  rangeStart: number
  rangeEnd: number

  clearFilters: () => void
  hasFilters: boolean
}

const asText = (value: string | number | boolean | undefined): string =>
  value === undefined || value === null ? '' : String(value).toLowerCase()

export function useTableState<T extends { id: string }>(
  config: Config<T>,
): TableState<T> {
  const { items, columns, defaultSortKey = '', defaultSortDirection = 'desc' } =
    config

  const [params, setParams] = useSearchParams()

  const urlSearch = params.get('q') ?? ''
  const searchField = params.get('field') ?? ALL_FIELDS
  const sortKey = params.get('sort') ?? defaultSortKey
  const sortDirection = (params.get('dir') as SortDirection) ?? defaultSortDirection
  const page = Math.max(1, Number(params.get('page') ?? 1) || 1)
  const perPage = PER_PAGE_OPTIONS.includes(
    Number(params.get('per')) as (typeof PER_PAGE_OPTIONS)[number],
  )
    ? Number(params.get('per'))
    : DEFAULT_PER_PAGE

  // The input is controlled locally and pushed to the URL on a delay, so
  // typing stays responsive no matter how large the list is.
  const [draftSearch, setDraftSearch] = useState(urlSearch)

  // Keeps the box in step when the URL changes from elsewhere (back button,
  // "clear filters"), without fighting the user mid-type.
  useEffect(() => {
    setDraftSearch((current) => (current === urlSearch ? current : urlSearch))
  }, [urlSearch])

  useEffect(() => {
    if (draftSearch === urlSearch) return

    const timer = setTimeout(() => {
      setParams(
        (current) => {
          const next = new URLSearchParams(current)
          if (draftSearch) next.set('q', draftSearch)
          else next.delete('q')
          // A new search invalidates the current page number.
          next.delete('page')
          return next
        },
        { replace: true },
      )
    }, SEARCH_DEBOUNCE_MS)

    return () => clearTimeout(timer)
  }, [draftSearch, urlSearch, setParams])

  const update = (
    mutate: (next: URLSearchParams) => void,
    { resetPage = true } = {},
  ) => {
    setParams(
      (current) => {
        const next = new URLSearchParams(current)
        mutate(next)
        if (resetPage) next.delete('page')
        return next
      },
      { replace: true },
    )
  }

  const searchableColumns = useMemo(
    () => columns.filter((column) => column.value && column.searchable !== false),
    [columns],
  )

  const columnByKey = useMemo(
    () => new Map(columns.map((column) => [column.key, column])),
    [columns],
  )

  // Filter -------------------------------------------------------------------
  const filtered = useMemo(() => {
    const needle = urlSearch.trim().toLowerCase()
    if (!needle) return items

    const targets =
      searchField === ALL_FIELDS
        ? searchableColumns
        : searchableColumns.filter((column) => column.key === searchField)

    if (targets.length === 0) return items

    return items.filter((item) =>
      targets.some((column) => asText(column.value?.(item)).includes(needle)),
    )
  }, [items, urlSearch, searchField, searchableColumns])

  // Sort ---------------------------------------------------------------------
  const sorted = useMemo(() => {
    const column = columnByKey.get(sortKey)
    if (!column?.value) return filtered

    const accessor = column.value
    const factor = sortDirection === 'asc' ? 1 : -1

    // Copy first: Array.prototype.sort mutates, and `filtered` may be `items`.
    return [...filtered].sort((a, b) => {
      const left = accessor(a)
      const right = accessor(b)

      if (typeof left === 'number' && typeof right === 'number') {
        return (left - right) * factor
      }
      if (typeof left === 'boolean' && typeof right === 'boolean') {
        return (Number(left) - Number(right)) * factor
      }
      return (
        String(left).localeCompare(String(right), 'en', { numeric: true }) * factor
      )
    })
  }, [filtered, sortKey, sortDirection, columnByKey])

  // Paginate -----------------------------------------------------------------
  const pageCount = Math.max(1, Math.ceil(sorted.length / perPage))
  // Deleting the last row of the last page would otherwise strand the view.
  const safePage = Math.min(page, pageCount)
  const start = (safePage - 1) * perPage

  const rows = useMemo(
    () => sorted.slice(start, start + perPage),
    [sorted, start, perPage],
  )

  return {
    rows,
    matchCount: sorted.length,

    search: draftSearch,
    setSearch: setDraftSearch,
    searchField,
    setSearchField: (key) =>
      update((next) => {
        if (key === ALL_FIELDS) next.delete('field')
        else next.set('field', key)
      }),
    searchableColumns,

    sortKey,
    sortDirection,
    toggleSort: (key) =>
      update((next) => {
        const direction =
          sortKey === key && sortDirection === 'asc' ? 'desc' : 'asc'
        next.set('sort', key)
        next.set('dir', direction)
      }),

    page: safePage,
    setPage: (value) =>
      update(
        (next) => {
          if (value <= 1) next.delete('page')
          else next.set('page', String(value))
        },
        { resetPage: false },
      ),
    perPage,
    setPerPage: (value) =>
      update((next) => {
        if (value === DEFAULT_PER_PAGE) next.delete('per')
        else next.set('per', String(value))
      }),
    pageCount,
    rangeStart: sorted.length === 0 ? 0 : start + 1,
    rangeEnd: Math.min(start + perPage, sorted.length),

    clearFilters: () =>
      update((next) => {
        next.delete('q')
        next.delete('field')
      }),
    hasFilters: Boolean(urlSearch || searchField !== ALL_FIELDS),
  }
}
