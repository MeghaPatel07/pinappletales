import { useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { formatDateShort, isUpcoming } from '@/lib/date'
import { toEventForm, toEventItem } from '@/content/mappers'
import type { RawDocument } from '@/lib/firestore/rest'
import { COLLECTIONS, type EventForm, type EventItem } from '@/types/content'
import { DataTable, type Column } from '../../components/DataTable'
import { EmptyState, PageHeader } from '../../components/PageHeader'
import { useCollection } from '../../hooks/useCollection'
import { useTableState, useUrlParam } from '../../hooks/useTableState'
import styles from '../shared.module.css'

/** An event paired with the registration form attached to it, if any. */
type Row = EventItem & {
  form: EventForm | null
}

type StoredForm = EventForm & { id: string }

export function EventFormList() {
  const events = useCollection<EventItem>(COLLECTIONS.events, toEventItem, {
    orderByField: 'date',
    direction: 'desc',
  })

  // Forms are keyed by event id, so no ordering field applies.
  const mapForm = useCallback(
    (doc: RawDocument): StoredForm => ({ ...toEventForm(doc), id: doc.id }),
    [],
  )
  const forms = useCollection<StoredForm>(COLLECTIONS.eventForms, mapForm)

  const [status, setStatus] = useUrlParam('form', 'all')

  const rows = useMemo<Row[]>(() => {
    const byEventId = new Map(forms.items.map((form) => [form.id, form]))
    return events.items.map((event) => ({
      ...event,
      form: byEventId.get(event.id) ?? null,
    }))
  }, [events.items, forms.items])

  const visible = useMemo(() => {
    if (status === 'with') return rows.filter((row) => row.form)
    if (status === 'without') return rows.filter((row) => !row.form)
    if (status === 'live') {
      return rows.filter((row) => row.form?.isActive && row.form.fields.length > 0)
    }
    return rows
  }, [rows, status])

  const columns = useMemo<Column<Row>[]>(
    () => [
      {
        key: 'name',
        header: 'Event',
        value: (row) => row.name,
        render: (row) => (
          <div className={styles.primaryCell}>
            <Link to={`/admin/event-forms/${row.id}`} className={styles.cellLink}>
              {row.name || 'Untitled event'}
            </Link>
            <span className={styles.cellSub}>
              {formatDateShort(row.date)} · {isUpcoming(row.date) ? 'Upcoming' : 'Past'}
            </span>
          </div>
        ),
      },
      {
        key: 'formTitle',
        header: 'Form heading',
        value: (row) => row.form?.title ?? '',
        secondary: true,
        render: (row) =>
          row.form ? (
            row.form.title
          ) : (
            <span className={styles.cellSub}>No form yet</span>
          ),
      },
      {
        key: 'fields',
        header: 'Fields',
        value: (row) => row.form?.fields.length ?? 0,
        searchable: false,
        align: 'right',
      },
      {
        key: 'state',
        header: 'Form status',
        value: (row) =>
          !row.form
            ? 'none'
            : row.form.isActive && row.form.fields.length > 0
              ? 'live'
              : 'off',
        render: (row) => {
          if (!row.form) return <span className={styles.cellSub}>Not set up</span>
          if (!row.form.isActive) return <span className={styles.cellSub}>Switched off</span>
          if (row.form.fields.length === 0) {
            return <span className={styles.warningText}>No fields</span>
          }
          return <span className={styles.liveText}>Accepting registrations</span>
        },
      },
    ],
    [],
  )

  const table = useTableState({
    items: visible,
    columns,
    defaultSortKey: 'name',
    defaultSortDirection: 'asc',
  })

  return (
    <>
      <PageHeader
        title="Event forms"
        description="Each event can have its own registration form. Build the fields here; submissions appear under Registrations."
      />

      <DataTable
        table={table}
        columns={columns}
        loading={events.loading || forms.loading}
        error={events.error || forms.error}
        truncated={events.truncated}
        onRetry={() => {
          void events.refresh()
          void forms.refresh()
        }}
        searchPlaceholder="Search events…"
        filters={
          <select
            className={styles.filterSelect}
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            aria-label="Filter by form status"
          >
            <option value="all">All events</option>
            <option value="live">Accepting registrations</option>
            <option value="with">Has a form</option>
            <option value="without">No form yet</option>
          </select>
        }
        empty={
          <EmptyState
            title="No events to attach a form to"
            message="Create an event first, then come back to build its registration form."
          />
        }
        actions={(row) => (
          <Link to={`/admin/event-forms/${row.id}`} className={styles.textAction}>
            {row.form ? 'Edit form' : 'Build form'}
          </Link>
        )}
      />
    </>
  )
}
