import { useCallback, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toTestimonial } from '@/content/mappers'
import { COLLECTIONS, type Testimonial } from '@/types/content'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { AdminButton, FormActions, FormPanel, TextAreaField, TextField, ToggleField } from '../../components/Form'
import { PageHeader } from '../../components/PageHeader'
import { Spinner } from '../../components/Spinner'
import { useToast } from '../../components/Toast'
import { useRecordEditor } from '../../hooks/useRecordEditor'
import styles from '../shared.module.css'

type Fields = {
  testimonial: string
  name: string
  designation: string
  isActive: boolean
  showOnHome: boolean
}

const BLANK: Fields = {
  testimonial: '',
  name: '',
  designation: '',
  isActive: false,
  showOnHome: false,
}

export function TestimonialForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const toast = useToast()
  const [fields, setFields] = useState<Fields>(BLANK)
  const [errors, setErrors] = useState<Partial<Record<'testimonial' | 'name', string>>>({})
  const [confirmDelete, setConfirmDelete] = useState(false)

  const onLoaded = useCallback((item: Testimonial) => {
    setFields({
      testimonial: item.testimonial,
      name: item.name,
      designation: item.designation,
      isActive: item.isActive,
      showOnHome: item.showOnHome,
    })
  }, [])

  const editor = useRecordEditor<Testimonial>({
    collectionName: COLLECTIONS.testimonials,
    id,
    map: toTestimonial,
    onLoaded,
    listPath: '/admin/testimonials',
    label: 'Testimonial',
  })

  const isNew = !id || id === 'new'
  const update = <K extends keyof Fields>(key: K, value: Fields[K]) => {
    setFields((current) => ({ ...current, [key]: value }))
    editor.setDirty(true)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const found: Partial<Record<'testimonial' | 'name', string>> = {}
    if (!fields.testimonial.trim()) found.testimonial = 'A testimonial is required.'
    if (!fields.name.trim()) found.name = 'A name is required.'
    setErrors(found)
    if (Object.keys(found).length > 0) {
      toast.error('Please fix the highlighted fields.')
      return
    }

    const savedId = await editor.save({
      testimonial: fields.testimonial.trim(),
      name: fields.name.trim(),
      designation: fields.designation.trim(),
      isActive: fields.isActive,
      showOnHome: fields.showOnHome,
    })

    if (savedId && isNew) navigate(`/admin/testimonials/${savedId}`, { replace: true })
  }

  if (editor.loading) return <Spinner full label="Loading testimonial…" />
  if (editor.missing) return <PageHeader title="Testimonial not found" backTo={{ to: '/admin/testimonials', label: 'All testimonials' }} />

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <PageHeader title={isNew ? 'New testimonial' : 'Edit testimonial'} backTo={{ to: '/admin/testimonials', label: 'All testimonials' }} />
      <FormPanel title="Testimonial">
        <TextAreaField label="Testimonial" value={fields.testimonial} onChange={(value) => update('testimonial', value)} rows={5} required error={errors.testimonial} placeholder="What did the parent or participant say?" />
        <TextField label="Name" value={fields.name} onChange={(value) => update('name', value)} required error={errors.name} placeholder="Parent of a school-age child" />
        <TextField label="Designation / relation" value={fields.designation} onChange={(value) => update('designation', value)} placeholder="Parent" />
      </FormPanel>
      <FormPanel title="Visibility">
        <ToggleField label="Published" checked={fields.isActive} onChange={(checked) => update('isActive', checked)} description="Off keeps this testimonial out of public content." />
        <ToggleField label="Show on home" checked={fields.showOnHome} onChange={(checked) => update('showOnHome', checked)} description="Active testimonials with this enabled rotate on the home page." />
      </FormPanel>
      <FormActions>
        <AdminButton type="submit" disabled={editor.saving}>{editor.saving ? 'Saving…' : isNew ? 'Create testimonial' : 'Save changes'}</AdminButton>
        <AdminButton variant="secondary" onClick={() => navigate('/admin/testimonials')}>Cancel</AdminButton>
        <span className={styles.actionSpacer} />
        {editor.dirty && <span className={styles.savedNote}>Unsaved changes</span>}
        {!isNew && <AdminButton variant="danger" onClick={() => setConfirmDelete(true)}>Delete</AdminButton>}
      </FormActions>
      <ConfirmDialog open={confirmDelete} title="Delete this testimonial?" message="This testimonial will be removed permanently." confirmLabel="Delete testimonial" busy={editor.deleting} onConfirm={editor.remove} onCancel={() => setConfirmDelete(false)} />
    </form>
  )
}
