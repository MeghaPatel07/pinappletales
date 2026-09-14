import type { ReactNode } from 'react'
import { Icon } from '@/components/ui/Icon'
import {
  ALL_FIELDS,
  PER_PAGE_OPTIONS,
  type TableColumn,
  type TableState,
} from '../hooks/useTableState'
import { Spinner } from './Spinner'
import styles from './DataTable.module.css'

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
    return (
      <Icon
        name={table.sortDirection === 'asc' ? 'chevronUp' : 'chevronDown'}
        size={14}
        className={styles.sortIcon}
      />
    )
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.toolbar}>
        <div className={styles.searchGroup}>
          <div className={styles.searchBox}>
            <Icon name="search" size={16} className={styles.searchIcon} />
            <input
              type="search"
              className={styles.searchInput}
              placeholder={searchPlaceholder}
              value={table.search}
              onChange={(event) => table.setSearch(event.target.value)}
              aria-label={searchPlaceholder}
            />
          </div>

          {table.searchableColumns.length > 1 && (
            <label className={styles.fieldSelect}>
              <span className="visually-hidden">Search in field</span>
              <select
                value={table.searchField}
                onChange={(event) => table.setSearchField(event.target.value)}
                className={styles.select}
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
            <button
              type="button"
              className={styles.clear}
              onClick={table.clearFilters}
            >
              Clear
            </button>
          )}
        </div>

        <p className={styles.count} role="status">
          {loading
            ? 'Loading…'
            : `${table.matchCount} ${table.matchCount === 1 ? 'record' : 'records'}`}
        </p>
      </div>

      {truncated && (
        <p className={styles.notice}>
          Showing the most recent 500 records. Older entries are not loaded.
        </p>
      )}

      <div className={styles.tableScroll}>
        <table className={styles.table}>
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  style={column.width ? { width: column.width } : undefined}
                  className={[
                    column.align === 'right' ? styles.right : '',
                    column.align === 'center' ? styles.center : '',
                    column.secondary ? styles.secondary : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  aria-sort={
                    table.sortKey === column.key
                      ? table.sortDirection === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : undefined
                  }
                >
                  {column.sortable !== false && column.value ? (
                    <button
                      type="button"
                      className={styles.sortButton}
                      onClick={() => table.toggleSort(column.key)}
                    >
                      {column.header}
                      {sortIcon(column.key)}
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              ))}
              {actions && (
                <th scope="col" className={styles.right}>
                  <span className="visually-hidden">Actions</span>
                </th>
              )}
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan={columnCount} className={styles.stateCell}>
                  <Spinner label="Loading records…" full />
                </td>
              </tr>
            )}

            {!loading && error && (
              <tr>
                <td colSpan={columnCount} className={styles.stateCell}>
                  <p className={styles.error}>{error}</p>
                  {onRetry && (
                    <button type="button" className={styles.retry} onClick={onRetry}>
                      Try again
                    </button>
                  )}
                </td>
              </tr>
            )}

            {!loading && !error && table.rows.length === 0 && (
              <tr>
                <td colSpan={columnCount} className={styles.stateCell}>
                  {table.hasFilters ? (
                    <p className={styles.empty}>
                      Nothing matches that search.{' '}
                      <button
                        type="button"
                        className={styles.linkButton}
                        onClick={table.clearFilters}
                      >
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
                <tr key={item.id}>
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={[
                        column.align === 'right' ? styles.right : '',
                        column.align === 'center' ? styles.center : '',
                        column.secondary ? styles.secondary : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    >
                      {column.render
                        ? column.render(item)
                        : String(column.value?.(item) ?? '')}
                    </td>
                  ))}
                  {actions && (
                    <td className={styles.right}>
                      <div className={styles.actions}>{actions(item)}</div>
                    </td>
                  )}
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {!loading && !error && table.matchCount > 0 && (
        <div className={styles.footer}>
          <p className={styles.range}>
            Showing {table.rangeStart}–{table.rangeEnd} of {table.matchCount}
          </p>

          <div className={styles.footerControls}>
            <label className={styles.perPage}>
              <span>Per page</span>
              <select
                className={styles.select}
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

            <Pagination
              page={table.page}
              pageCount={table.pageCount}
              onChange={table.setPage}
            />
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Page numbers with ellipses: first, last, and a window around the current
 * page, so the control stays a fixed width however many pages there are.
 */
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
    <nav className={styles.pagination} aria-label="Pagination">
      <button
        type="button"
        className={styles.pageButton}
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
      >
        <Icon name="chevronLeft" size={15} />
        <span className="visually-hidden">Previous page</span>
      </button>

      {pageItems(page, pageCount).map((item, index) =>
        item === 'gap' ? (
          <span key={`gap-${index}`} className={styles.gap} aria-hidden="true">
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            className={[styles.pageButton, item === page ? styles.pageCurrent : '']
              .filter(Boolean)
              .join(' ')}
            onClick={() => onChange(item)}
            aria-current={item === page ? 'page' : undefined}
          >
            {item}
          </button>
        ),
      )}

      <button
        type="button"
        className={styles.pageButton}
        onClick={() => onChange(page + 1)}
        disabled={page >= pageCount}
      >
        <Icon name="chevronRight" size={15} />
        <span className="visually-hidden">Next page</span>
      </button>
    </nav>
  )
}
