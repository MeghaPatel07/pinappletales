import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon'
import { toTestimonial } from '@/content/mappers'
import { COLLECTIONS, type Testimonial } from '@/types/content'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { DataTable, type Column } from '../../components/DataTable'
import { AdminButton } from '../../components/Form'
import { EmptyState, PageHeader, StatusBadge } from '../../components/PageHeader'
import { useToast } from '../../components/Toast'
import { useCollection } from '../../hooks/useCollection'
import { useTableState } from '../../hooks/useTableState'
import { deleteRecord, describeFirestoreError } from '../../lib/crud'
import styles from '../shared.module.css'

export function TestimonialList() {
  const navigate = useNavigate()
  const toast = useToast()
  const { items, loading, error, truncated, refresh, removeLocal } = useCollection<Testimonial>(COLLECTIONS.testimonials, toTestimonial)
  const [pendingDelete, setPendingDelete] = useState<Testimonial | null>(null)
  const [deleting, setDeleting] = useState(false)

  const columns = useMemo<Column<Testimonial>[]>(() => [
    { key: 'testimonial', header: 'Testimonial', value: (item) => item.testimonial, render: (item) => <div className={styles.primaryCell}><Link to={`/admin/testimonials/${item.id}`} className={styles.cellLink}>{item.testimonial || 'Empty testimonial'}</Link><span className={styles.cellSub}>{item.name}{item.designation ? ` · ${item.designation}` : ''}</span></div> },
    { key: 'name', header: 'Name', value: (item) => item.name, secondary: true },
    { key: 'home', header: 'Home', value: (item) => item.showOnHome ? 'shown' : 'hidden', render: (item) => item.showOnHome ? 'Shown' : 'Hidden' },
    { key: 'status', header: 'Status', value: (item) => item.isActive ? 'published' : 'draft', render: (item) => <StatusBadge active={item.isActive} /> },
  ], [])

  const table = useTableState({ items, columns, defaultSortKey: 'name', defaultSortDirection: 'asc' })

  const confirmDelete = async () => {
    if (!pendingDelete) return
    setDeleting(true)
    try {
      await deleteRecord(COLLECTIONS.testimonials, pendingDelete.id)
      removeLocal(pendingDelete.id)
      toast.success('Testimonial deleted.')
      setPendingDelete(null)
    } catch (caught) {
      toast.error(describeFirestoreError(caught))
    } finally {
      setDeleting(false)
    }
  }

  return <>
    <PageHeader title="Testimonials" description="Published testimonials can be selected for the rotating home page carousel." actions={<AdminButton onClick={() => navigate('/admin/testimonials/new')}><Icon name="plus" size={16} /> New testimonial</AdminButton>} />
    <DataTable table={table} columns={columns} loading={loading} error={error} truncated={truncated} onRetry={refresh} searchPlaceholder="Search testimonials…" empty={<EmptyState title="No testimonials yet" message="Add a testimonial to begin building the home page carousel." action={<AdminButton onClick={() => navigate('/admin/testimonials/new')}>Add testimonial</AdminButton>} />} actions={(item) => <><Link to={`/admin/testimonials/${item.id}`} className={styles.iconAction} title="Edit"><Icon name="edit" size={15} /><span className="visually-hidden">Edit testimonial</span></Link><button type="button" className={styles.iconDanger} onClick={() => setPendingDelete(item)} title="Delete"><Icon name="trash" size={15} /><span className="visually-hidden">Delete testimonial</span></button></>} />
    <ConfirmDialog open={Boolean(pendingDelete)} title="Delete this testimonial?" message="This testimonial will be removed permanently." confirmLabel="Delete testimonial" busy={deleting} onConfirm={confirmDelete} onCancel={() => setPendingDelete(null)} />
  </>
}
