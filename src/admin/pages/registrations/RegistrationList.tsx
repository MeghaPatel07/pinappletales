import { useCallback, useMemo, useState } from 'react'
import { Icon } from '@/components/ui/Icon'
import { formatDateTime } from '@/lib/date'
import { toEventItem, toEventRegistration } from '@/content/mappers'
import {
  COLLECTIONS,
  type EventItem,
  type EventRegistration,
} from '@/types/content'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { DataTable, type Column } from '../../components/DataTable'
import { AdminButton } from '../../components/Form'
import { EmptyState, PageHeader } from '../../components/PageHeader'
import { useToast } from '../../components/Toast'
import { useCollection } from '../../hooks/useCollection'
import { useTableState, useUrlParam } from '../../hooks/useTableState'
import { deleteRecord, describeFirestoreError } from '../../lib/crud'
import styles from '../shared.module.css'

/** Answers are keyed by the field names the form builder assigned. */
const answer = (registration: EventRegistration, key: string): string => {
  const value = registration.values[key]
  if (Array.isArray(value)) return value.join(', ')
  return value ?? ''
}

/** Every answer flattened into one string, for the "all fields" search. */
const allAnswers = (registration: EventRegistration): string =>
  Object.values(registration.values)
    .map((value) => (Array.isArray(value) ? value.join(' ') : value))
    .join(' ')

/** Quotes a CSV cell, doubling any embedded quotes. */
const csvCell = (value: string): string => `"${value.replace(/"/g, '""')}"`

export function RegistrationList() {
  const toast = useToast()
  const registrations = useCollection<EventRegistration>(
    COLLECTIONS.eventRegistrations,
    toEventRegistration,
    { orderByField: 'createdAt', direction: 'desc' },
  )

  const mapEvent = useCallback((doc: Parameters<typeof toEventItem>[0]) => toEventItem(doc), [])
  const events = useCollection<EventItem>(COLLECTIONS.events, mapEvent, {
    orderByField: 'date',
    direction: 'desc',
  })

  const [eventFilter, setEventFilter] = useUrlParam('event', 'all')
  const [pendingDelete, setPendingDelete] = useState<EventRegistration | null>(null)
  const [deleting, setDeleting] = useState(false)

  const visible = useMemo(
    () =>
      eventFilter === 'all'
        ? registrations.items
        : registrations.items.filter((item) => item.eventId === eventFilter),
    [registrations.items, eventFilter],
  )

  /**
   * Answer columns are derived from the data rather than from the form
   * definition, so a registration collected under an older version of the form
   * still shows every answer it holds.
   */
  const answerKeys = useMemo(() => {
    const keys = new Set<string>()
    for (const registration of visible) {
      for (const key of Object.keys(registration.values)) keys.add(key)
    }
    return [...keys]
  }, [visible])

  const columns = useMemo<Column<EventRegistration>[]>(() => {
    const base: Column<EventRegistration>[] = [
      {
        key: 'createdAt',
        header: 'Received',
        value: (item) => item.createdAt,
        render: (item) => formatDateTime(item.createdAt) || '—',
      },
      {
        key: 'eventName',
        header: 'Event',
        value: (item) => item.eventName,
        render: (item) => (
          <span className={styles.cellLink}>{item.eventName || item.eventId}</span>
        ),
      },
    ]

    // One column per answer key, capped so a form with many questions does not
    // produce an unreadable table — the CSV export carries everything.
    const answerColumns: Column<EventRegistration>[] = answerKeys
      .slice(0, 6)
      .map((key) => ({
        key: `answer-${key}`,
        header: key.replace(/_/g, ' '),
        value: (item) => answer(item, key),
        secondary: true,
      }))

    return [
      ...base,
      ...answerColumns,
      {
        key: 'all',
        header: 'All answers',
        value: allAnswers,
        // Searchable only — showing it would duplicate the columns above.
        sortable: false,
        secondary: true,
        render: () => null,
      },
    ]
  }, [answerKeys])

  const table = useTableState({
    items: visible,
    columns,
    defaultSortKey: 'createdAt',
    defaultSortDirection: 'desc',
  })

  const exportCsv = () => {
    if (visible.length === 0) {
      toast.info('There is nothing to export yet.')
      return
    }

    const headers = ['Received', 'Event', ...answerKeys]
    const lines = [
      headers.map(csvCell).join(','),
      ...visible.map((registration) =>
        [
          formatDateTime(registration.createdAt),
          registration.eventName || registration.eventId,
          ...answerKeys.map((key) => answer(registration, key)),
        ]
          .map(csvCell)
          .join(','),
      ),
    ]

    // The BOM makes Excel read it as UTF-8 rather than the local codepage,
    // which otherwise mangles names with accents.
    const blob = new Blob(['﻿', lines.join('\r\n')], {
      type: 'text/csv;charset=utf-8;',
    })

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const label =
      eventFilter === 'all'
        ? 'all-events'
        : (events.items.find((event) => event.id === eventFilter)?.slug ?? eventFilter)

    link.href = url
    link.download = `registrations-${label}-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const confirmDelete = async () => {
    if (!pendingDelete) return
    setDeleting(true)

    try {
      await deleteRecord(COLLECTIONS.eventRegistrations, pendingDelete.id)
      registrations.removeLocal(pendingDelete.id)
      toast.success('Registration deleted.')
      setPendingDelete(null)
    } catch (caught) {
      toast.error(describeFirestoreError(caught))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <PageHeader
        title="Registrations"
        description="Everything submitted through the event registration forms."
        actions={
          <AdminButton variant="secondary" onClick={exportCsv}>
            <Icon name="download" size={15} />
            Export CSV
          </AdminButton>
        }
      />

      <DataTable
        table={table}
        columns={columns}
        loading={registrations.loading}
        error={registrations.error}
        truncated={registrations.truncated}
        onRetry={registrations.refresh}
        searchPlaceholder="Search registrations…"
        filters={
          <select
            className={styles.filterSelect}
            value={eventFilter}
            onChange={(event) => setEventFilter(event.target.value)}
            aria-label="Filter by event"
          >
            <option value="all">All events</option>
            {events.items.map((event) => (
              <option key={event.id} value={event.id}>
                {event.name}
              </option>
            ))}
          </select>
        }
        empty={
          <EmptyState
            title="No registrations yet"
            message="Once a visitor submits an event's registration form, it will appear here."
          />
        }
        actions={(registration) => (
          <button
            type="button"
            className={styles.iconDanger}
            onClick={() => setPendingDelete(registration)}
            title="Delete"
          >
            <Icon name="trash" size={15} />
            <span className="visually-hidden">Delete registration</span>
          </button>
        )}
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete this registration?"
        message="This removes the person's submitted details permanently. Export a CSV first if you still need them."
        confirmLabel="Delete registration"
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  )
}
