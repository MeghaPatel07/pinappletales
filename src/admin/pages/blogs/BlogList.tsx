'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Icon } from '@/components/ui/Icon'
import { formatDateShort } from '@/lib/date'
import { toBlogPost } from '@/lib/mappers'
import { COLLECTIONS, type BlogPost } from '@/types/content'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { DataTable, type Column } from '../../components/DataTable'
import { AdminButton } from '../../components/Form'
import {
  EmptyState,
  FeaturedBadge,
  PageHeader,
  StatusBadge,
} from '../../components/PageHeader'
import { useToast } from '../../components/Toast'
import { useCollection } from '../../hooks/useCollection'
import { useTableState, useUrlParam } from '../../hooks/useTableState'
import { deleteRecord, describeApiError } from '../../lib/crud'
import styles from '../shared.module.css'

export function BlogList() {
  const router = useRouter()
  const toast = useToast()
  const { items, loading, error, truncated, refresh, removeLocal } =
    useCollection<BlogPost>(COLLECTIONS.blogs, toBlogPost, {
      orderByField: 'date',
      direction: 'desc',
    })

  const [status, setStatus] = useUrlParam('status', 'all')
  const [pendingDelete, setPendingDelete] = useState<BlogPost | null>(null)
  const [deleting, setDeleting] = useState(false)

  const visible = useMemo(() => {
    if (status === 'published') return items.filter((item) => item.isActive)
    if (status === 'draft') return items.filter((item) => !item.isActive)
    if (status === 'featured') return items.filter((item) => item.isPrimary)
    return items
  }, [items, status])

  const columns = useMemo<Column<BlogPost>[]>(
    () => [
      {
        key: 'title',
        header: 'Title',
        value: (post) => post.title,
        render: (post) => (
          <div className={styles.primaryCell}>
            <Link href={`/admin/blogs/${post.id}`} className={styles.cellLink}>
              {post.title || 'Untitled'}
            </Link>
            <span className={styles.cellSub}>/blog/{post.slug}</span>
          </div>
        ),
      },
      { key: 'author', header: 'Author', value: (post) => post.author },
      {
        key: 'slug',
        header: 'Slug',
        value: (post) => post.slug,
        // Searchable, but already shown under the title.
        secondary: true,
        render: (post) => <span className={styles.cellSub}>{post.slug}</span>,
      },
      {
        key: 'date',
        header: 'Date',
        value: (post) => post.date,
        render: (post) => formatDateShort(post.date),
        secondary: true,
      },
      {
        key: 'minuteRead',
        header: 'Read',
        value: (post) => post.minuteRead,
        render: (post) => `${post.minuteRead} min`,
        align: 'right',
        secondary: true,
        searchable: false,
      },
      {
        key: 'status',
        header: 'Status',
        value: (post) => (post.isActive ? 'published' : 'draft'),
        render: (post) => (
          <div className={styles.badgeStack}>
            <StatusBadge active={post.isActive} />
            {post.isPrimary && <FeaturedBadge />}
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
      await deleteRecord(COLLECTIONS.blogs, pendingDelete.id)
      removeLocal(pendingDelete.id)
      toast.success(`“${pendingDelete.title}” was deleted.`)
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
        title="Blogs"
        description="Articles published at /blog. Drafts stay hidden from the website until they are published."
        actions={
          <AdminButton onClick={() => router.push('/admin/blogs/new')}>
            <Icon name="plus" size={16} />
            New post
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
        searchPlaceholder="Search posts…"
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
            <option value="featured">Featured</option>
          </select>
        }
        empty={
          <EmptyState
            title="No posts yet"
            message="Write your first article and it will appear on the blog page."
            action={
              <AdminButton onClick={() => router.push('/admin/blogs/new')}>
                Write the first post
              </AdminButton>
            }
          />
        }
        actions={(post) => (
          <>
            <Link
              href={`/admin/blogs/${post.id}`}
              className={styles.iconAction}
              title="Edit"
            >
              <Icon name="edit" size={15} />
              <span className="visually-hidden">Edit {post.title}</span>
            </Link>
            <button
              type="button"
              className={styles.iconDanger}
              onClick={() => setPendingDelete(post)}
              title="Delete"
            >
              <Icon name="trash" size={15} />
              <span className="visually-hidden">Delete {post.title}</span>
            </button>
          </>
        )}
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete this post?"
        message={`“${pendingDelete?.title ?? ''}” will be removed permanently. This cannot be undone.`}
        confirmLabel="Delete post"
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  )
}
