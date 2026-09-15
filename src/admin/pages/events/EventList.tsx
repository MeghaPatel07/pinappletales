'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Icon } from '@/components/ui/Icon'
import { cloudinaryUrl } from '@/lib/cloudinary'
import { formatDateShort, isUpcoming } from '@/lib/date'
import { toEventItem } from '@/lib/mappers'
import { COLLECTIONS, type EventItem } from '@/types/content'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { DataTable, type Column } from '../../components/DataTable'
import { AdminButton } from '../../components/Form'
import { EmptyState, FeaturedBadge, PageHeader, StatusBadge } from '../../components/PageHeader'
import { useToast } from '../../components/Toast'
import { useCollection } from '../../hooks/useCollection'
import { useTableState, useUrlParam } from '../../hooks/useTableState'
import { deleteRecord, describeApiError } from '../../lib/crud'
import styles from '../shared.module.css'

export function EventList() {
  const router = useRouter()
  const toast = useToast()
  const { items, loading, error, truncated, refresh, removeLocal } =
    useCollection<EventItem>(COLLECTIONS.events, toEventItem, {
      orderByField: 'date',
      direction: 'desc',
    })

  const [when, setWhen] = useUrlParam('when', 'all')
  const [pendingDelete, setPendingDelete] = useState<EventItem | null>(null)
  const [deleting, setDeleting] = useState(false)

  const visible = useMemo(() => {
    if (when === 'upcoming') return items.filter((item) => isUpcoming(item.date))
    if (when === 'past') return items.filter((item) => !isUpcoming(item.date))
    if (when === 'draft') return items.filter((item) => !item.isActive)
    return items
  }, [items, when])

  const columns = useMemo<Column<EventItem>[]>(
    () => [
      {
        key: 'image',
        header: '',
        sortable: false,
        searchable: false,
        width: '4.5rem',
        render: (event) =>
          event.mainImage ? (
            <img
              className={styles.thumb}
              src={cloudinaryUrl(event.mainImage, {
                width: 112,
                height: 80,
                crop: 'fill',
                gravity: 'auto',
              })}
              alt=""
              width={56}
              height={40}
              loading="lazy"
            />
          ) : (
            <span className={styles.thumbPlaceholder}>
              <Icon name="image" size={16} />
            </span>
          ),
      },
      {
        key: 'name',
        header: 'Event',
        value: (event) => event.name,
        render: (event) => (
          <div className={styles.primaryCell}>
            <Link href={`/admin/events/${event.id}`} className={styles.cellLink}>
              {event.name || 'Untitled event'}
            </Link>
            <span className={styles.cellSub}>/events/{event.slug}</span>
          </div>
        ),
      },
      {
        key: 'shortDescription',
        header: 'Summary',
        value: (event) => event.shortDescription,
        secondary: true,
        render: (event) => (
          <span className={styles.cellSub}>{event.shortDescription}</span>
        ),
      },
      {
        key: 'date',
        header: 'Date',
        value: (event) => event.date,
        render: (event) => (
          <div className={styles.primaryCell}>
            <span>{formatDateShort(event.date)}</span>
            <span className={styles.cellSub}>
              {isUpcoming(event.date) ? 'Upcoming' : 'Past'}
            </span>
          </div>
        ),
      },
      {
        key: 'gallery',
        header: 'Images',
        value: (event) => event.imageGallery.length,
        searchable: false,
        align: 'right',
        secondary: true,
      },
      {
        key: 'status',
        header: 'Status',
        value: (event) => (event.isActive ? 'published' : 'draft'),
        render: (event) => (
          <div className={styles.badgeStack}>
            <StatusBadge active={event.isActive} />
            {event.isPrimary && <FeaturedBadge />}
          </div>
        ),
      },
    ],
    [],
  )

  const table = useTableState({
    items: visible,
    columns,
    defaultSortKey: 'date',
    defaultSortDirection: 'desc',
  })

  const confirmDelete = async () => {
    if (!pendingDelete) return
    setDeleting(true)

    try {
      await deleteRecord(COLLECTIONS.events, pendingDelete.id)
      removeLocal(pendingDelete.id)
      toast.success(`“${pendingDelete.name}” was deleted.`)
      setPendingDelete(null)
    } catch (caught) {
      toast.error(describeApiError(caught))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <PageHeader
        title="Events"
        description="Workshops and sessions listed at /events. Each event can have its own registration form."
        actions={
          <AdminButton onClick={() => router.push('/admin/events/new')}>
            <Icon name="plus" size={16} />
            New event
          </AdminButton>
        }
      />

      <DataTable
        table={table}
        columns={columns}
        loading={loading}
        error={error}
        truncated={truncated}
        onRetry={refresh}
        searchPlaceholder="Search events…"
        filters={
          <select
            className={styles.filterSelect}
            value={when}
            onChange={(event) => setWhen(event.target.value)}
            aria-label="Filter events"
          >
            <option value="all">All events</option>
            <option value="upcoming">Upcoming</option>
            <option value="past">Past</option>
            <option value="draft">Drafts</option>
          </select>
        }
        empty={
          <EmptyState
            title="No events yet"
            message="Add a workshop or session and it will appear on the events page."
            action={
              <AdminButton onClick={() => router.push('/admin/events/new')}>
                Add the first event
              </AdminButton>
            }
          />
        }
        actions={(event) => (
          <>
            <Link
              href={`/admin/event-forms/${event.id}`}
              className={styles.textAction}
              title={`Registration form for ${event.name}`}
            >
              Form
            </Link>
            <Link
              href={`/admin/events/${event.id}`}
              className={styles.iconAction}
              title="Edit"
            >
              <Icon name="edit" size={15} />
              <span className="visually-hidden">Edit {event.name}</span>
            </Link>
            <button
              type="button"
              className={styles.iconDanger}
              onClick={() => setPendingDelete(event)}
              title="Delete"
            >
              <Icon name="trash" size={15} />
              <span className="visually-hidden">Delete {event.name}</span>
            </button>
          </>
        )}
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete this event?"
        message={`“${pendingDelete?.name ?? ''}” will be removed permanently. Its registration form and any submissions stay in the database.`}
        confirmLabel="Delete event"
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  )
}
