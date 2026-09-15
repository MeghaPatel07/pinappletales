'use client'

import type { ReactNode } from 'react'
import { Icon } from '@/components/ui/Icon'
import {
  ALL_FIELDS,
  PER_PAGE_OPTIONS,
  type TableColumn,
  type TableState,
} from '../hooks/useTableState'
import { Spinner } from './Spinner'

export type Column<T> = TableColumn<T> & {
  /** Cell contents. Falls back to the plain `value` when omitted. */
  render?: (item: T) => ReactNode
  align?: 'left' | 'center' | 'right'
  width?: string
  /** Dropped on narrow screens to keep the table readable. */
  secondary?: boolean
}

type DataTableProps<T extends { id: string }> = {
  table: TableState<T>
  columns: Column<T>[]
  loading: boolean
  error?: string
  /** Row actions, rendered in a trailing column. */
  actions?: (item: T) => ReactNode
  /** Shown when the collection is genuinely empty (no search applied). */
  empty: ReactNode
  searchPlaceholder?: string
  /** Extra controls (status filters, event pickers) beside the search box. */
  filters?: ReactNode
  /** Warning shown when the collection hit the read cap. */
  truncated?: boolean
  onRetry?: () => void
}

const ALIGN_CLASSES: Record<'left' | 'center' | 'right', string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
}

export function DataTable<T extends { id: string }>({
  table,
  columns,
  loading,
  error,
  actions,
  empty,
  searchPlaceholder = 'Search…',
  filters,
  truncated,
  onRetry,
}: DataTableProps<T>) {
  const columnCount = columns.length + (actions ? 1 : 0)

  const sortIcon = (key: string) => {
    if (table.sortKey !== key) return null
    return <Icon name={table.sortDirection === 'asc' ? 'chevronUp' : 'chevronDown'} size={14} className="ml-1 inline text-brand-deep" />
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Icon name="search" size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
            <input
              type="search"
              className="w-56 rounded-full border border-line bg-paper py-2 pl-9 pr-3.5 text-[0.9rem] text-ink placeholder:text-ink-soft/70 focus:outline-none focus:ring-2 focus:ring-brand-deep/40"
              placeholder={searchPlaceholder}
              value={table.search}
              onChange={(event) => table.setSearch(event.target.value)}
              aria-label={searchPlaceholder}
            />
          </div>

          {table.searchableColumns.length > 1 && (
            <label>
              <span className="visually-hidden">Search in field</span>
              <select
                value={table.searchField}
                onChange={(event) => table.setSearchField(event.target.value)}
                className="cursor-pointer rounded-full border border-line bg-paper px-3 py-2 text-[0.85rem] text-ink"
              >
                <option value={ALL_FIELDS}>All fields</option>
                {table.searchableColumns.map((column) => (
                  <option key={column.key} value={column.key}>
                    {column.header}
                  </option>
                ))}
              </select>
            </label>
          )}

          {filters}

          {table.hasFilters && (
            <button type="button" className="text-[0.85rem] font-medium text-ink-soft hover:text-ink" onClick={table.clearFilters}>
              Clear
            </button>
          )}
        </div>

        <p className="text-[0.85rem] text-ink-soft" role="status">
          {loading ? 'Loading…' : `${table.matchCount} ${table.matchCount === 1 ? 'record' : 'records'}`}
        </p>
      </div>

      {truncated && (
        <p className="mb-3 rounded-lg bg-paper-2 px-3.5 py-2 text-[0.82rem] text-ink-soft">
          Showing the most recent 500 records. Older entries are not loaded.
        </p>
      )}

      <div className="overflow-x-auto rounded-card border border-line bg-paper">
        <table className="w-full border-collapse text-[0.92rem]">
          <thead>
            <tr className="border-b border-line bg-paper-2">
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  style={column.width ? { width: column.width } : undefined}
                  className={`px-4 py-3 font-medium text-ink-soft ${ALIGN_CLASSES[column.align ?? 'left']} ${column.secondary ? 'hidden md:table-cell' : ''}`}
                  aria-sort={table.sortKey === column.key ? (table.sortDirection === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  {column.sortable !== false && column.value ? (
                    <button type="button" className="inline-flex items-center hover:text-ink" onClick={() => table.toggleSort(column.key)}>
                      {column.header}
                      {sortIcon(column.key)}
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              ))}
              {actions && (
                <th scope="col" className="px-4 py-3 text-right">
                  <span className="visually-hidden">Actions</span>
                </th>
              )}
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan={columnCount} className="px-4 py-14 text-center">
                  <Spinner label="Loading records…" full />
                </td>
              </tr>
            )}

            {!loading && error && (
              <tr>
                <td colSpan={columnCount} className="px-4 py-14 text-center">
                  <p className="text-[0.92rem] text-coral">{error}</p>
                  {onRetry && (
                    <button type="button" className="mt-2 text-[0.85rem] font-medium text-ink underline" onClick={onRetry}>
                      Try again
                    </button>
                  )}
                </td>
              </tr>
            )}

            {!loading && !error && table.rows.length === 0 && (
              <tr>
                <td colSpan={columnCount} className="px-4 py-14 text-center">
                  {table.hasFilters ? (
                    <p className="text-[0.92rem] text-ink-soft">
                      Nothing matches that search.{' '}
                      <button type="button" className="font-medium text-ink underline" onClick={table.clearFilters}>
                        Clear the filters
                      </button>
                    </p>
                  ) : (
                    empty
                  )}
                </td>
              </tr>
            )}

            {!loading &&
              !error &&
              table.rows.map((item) => (
                <tr key={item.id} className="border-b border-line last:border-b-0 hover:bg-paper-2/60">
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`px-4 py-3 align-top ${ALIGN_CLASSES[column.align ?? 'left']} ${column.secondary ? 'hidden md:table-cell' : ''}`}
                    >
                      {column.render ? column.render(item) : String(column.value?.(item) ?? '')}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">{actions(item)}</div>
                    </td>
                  )}
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {!loading && !error && table.matchCount > 0 && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-[0.85rem] text-ink-soft">
            Showing {table.rangeStart}–{table.rangeEnd} of {table.matchCount}
          </p>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-[0.85rem] text-ink-soft">
              <span>Per page</span>
              <select
                className="cursor-pointer rounded-full border border-line bg-paper px-2.5 py-1.5 text-[0.85rem] text-ink"
                value={table.perPage}
                onChange={(event) => table.setPerPage(Number(event.target.value))}
              >
                {PER_PAGE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <Pagination page={table.page} pageCount={table.pageCount} onChange={table.setPage} />
          </div>
        </div>
      )}
    </div>
  )
}

function pageItems(page: number, pageCount: number): (number | 'gap')[] {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, index) => index + 1)
  }

  const items: (number | 'gap')[] = [1]
  const from = Math.max(2, page - 1)
  const to = Math.min(pageCount - 1, page + 1)

  if (from > 2) items.push('gap')
  for (let index = from; index <= to; index += 1) items.push(index)
  if (to < pageCount - 1) items.push('gap')

  items.push(pageCount)
  return items
}

type PaginationProps = {
  page: number
  pageCount: number
  onChange: (page: number) => void
}

export function Pagination({ page, pageCount, onChange }: PaginationProps) {
  if (pageCount <= 1) return null

  return (
    <nav className="flex items-center gap-1" aria-label="Pagination">
      <button
        type="button"
        className="grid h-8 w-8 place-items-center rounded-full text-ink-soft hover:bg-paper-2 disabled:opacity-30"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
      >
        <Icon name="chevronLeft" size={15} />
        <span className="visually-hidden">Previous page</span>
      </button>

      {pageItems(page, pageCount).map((item, index) =>
        item === 'gap' ? (
          <span key={`gap-${index}`} className="px-1 text-ink-soft" aria-hidden>
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            className={`grid h-8 w-8 place-items-center rounded-full text-[0.85rem] ${
              item === page ? 'bg-brand font-semibold text-ink' : 'text-ink-soft hover:bg-paper-2'
            }`}
            onClick={() => onChange(item)}
            aria-current={item === page ? 'page' : undefined}
          >
            {item}
          </button>
        ),
      )}

      <button
        type="button"
        className="grid h-8 w-8 place-items-center rounded-full text-ink-soft hover:bg-paper-2 disabled:opacity-30"
        onClick={() => onChange(page + 1)}
        disabled={page >= pageCount}
      >
        <Icon name="chevronRight" size={15} />
        <span className="visually-hidden">Next page</span>
      </button>
    </nav>
  )
}
