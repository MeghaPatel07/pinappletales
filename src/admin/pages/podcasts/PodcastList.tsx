import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon'
import { formatDateShort } from '@/lib/date'
import { youtubeId, youtubeThumbnail } from '@/lib/youtube'
import { toPodcast } from '@/content/mappers'
import { COLLECTIONS, type Podcast } from '@/types/content'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { DataTable, type Column } from '../../components/DataTable'
import { AdminButton } from '../../components/Form'
import { EmptyState, PageHeader, StatusBadge } from '../../components/PageHeader'
import { useToast } from '../../components/Toast'
import { useCollection } from '../../hooks/useCollection'
import { useTableState, useUrlParam } from '../../hooks/useTableState'
import { deleteRecord, describeFirestoreError } from '../../lib/crud'
import styles from '../shared.module.css'

export function PodcastList() {
  const navigate = useNavigate()
  const toast = useToast()
  const { items, loading, error, truncated, refresh, removeLocal } =
    useCollection<Podcast>(COLLECTIONS.podcasts, toPodcast, {
      orderByField: 'date',
      direction: 'desc',
    })

  const [status, setStatus] = useUrlParam('status', 'all')
  const [pendingDelete, setPendingDelete] = useState<Podcast | null>(null)
  const [deleting, setDeleting] = useState(false)

  const visible = useMemo(() => {
    if (status === 'published') return items.filter((item) => item.isActive)
    if (status === 'draft') return items.filter((item) => !item.isActive)
    return items
  }, [items, status])

  const columns = useMemo<Column<Podcast>[]>(
    () => [
      {
        key: 'thumb',
        header: '',
        sortable: false,
        searchable: false,
        width: '4.5rem',
        render: (podcast) => {
          const id = youtubeId(podcast.youtubeLink)
          return id ? (
            <img
              className={styles.thumb}
              src={youtubeThumbnail(id)}
              alt=""
              width={56}
              height={40}
              loading="lazy"
            />
          ) : (
            <span className={styles.thumbPlaceholder}>
              <Icon name="play" size={16} />
            </span>
          )
        },
      },
      {
        key: 'name',
        header: 'Episode',
        value: (podcast) => podcast.name,
        render: (podcast) => (
          <div className={styles.primaryCell}>
            <Link to={`/admin/podcasts/${podcast.id}`} className={styles.cellLink}>
              {podcast.name || 'Untitled episode'}
            </Link>
            <span className={styles.cellSub}>{podcast.youtubeLink}</span>
          </div>
        ),
      },
      {
        key: 'date',
        header: 'Date',
        value: (podcast) => podcast.date,
        render: (podcast) => formatDateShort(podcast.date),
      },
      {
        key: 'link',
        header: 'YouTube',
        value: (podcast) => podcast.youtubeLink,
        secondary: true,
        sortable: false,
        render: (podcast) => {
          const id = youtubeId(podcast.youtubeLink)
          return id ? (
            <span className={styles.cellSub}>{id}</span>
          ) : (
            <span className={styles.warningText}>Link not recognised</span>
          )
        },
      },
      {
        key: 'status',
        header: 'Status',
        value: (podcast) => (podcast.isActive ? 'published' : 'draft'),
        render: (podcast) => <StatusBadge active={podcast.isActive} />,
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
      await deleteRecord(COLLECTIONS.podcasts, pendingDelete.id)
      removeLocal(pendingDelete.id)
      toast.success(`“${pendingDelete.name}” was deleted.`)
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
        title="Podcasts"
        description="Episodes listed at /podcast, each playing its YouTube video in place."
        actions={
          <AdminButton onClick={() => navigate('/admin/podcasts/new')}>
            <Icon name="plus" size={16} />
            New episode
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
        searchPlaceholder="Search episodes…"
        filters={
          <select
            className={styles.filterSelect}
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            aria-label="Filter by status"
          >
            <option value="all">All statuses</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
          </select>
        }
        empty={
          <EmptyState
            title="No episodes yet"
            message="Paste a YouTube link and the episode will appear on the podcast page."
            action={
              <AdminButton onClick={() => navigate('/admin/podcasts/new')}>
                Add the first episode
              </AdminButton>
            }
          />
        }
        actions={(podcast) => (
          <>
            <Link
              to={`/admin/podcasts/${podcast.id}`}
              className={styles.iconAction}
              title="Edit"
            >
              <Icon name="edit" size={15} />
              <span className="visually-hidden">Edit {podcast.name}</span>
            </Link>
            <button
              type="button"
              className={styles.iconDanger}
              onClick={() => setPendingDelete(podcast)}
              title="Delete"
            >
              <Icon name="trash" size={15} />
              <span className="visually-hidden">Delete {podcast.name}</span>
            </button>
          </>
        )}
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete this episode?"
        message={`“${pendingDelete?.name ?? ''}” will be removed permanently. This cannot be undone.`}
        confirmLabel="Delete episode"
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  )
}
