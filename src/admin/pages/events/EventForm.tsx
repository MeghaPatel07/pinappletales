'use client'

import { useCallback, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { Icon } from '@/components/ui/Icon'
import { SITE_URL } from '@/config/site'
import { toEventItem } from '@/lib/mappers'
import { today } from '@/lib/date'
import { isValidSlug, slugify } from '@/lib/slug'
import { COLLECTIONS, type CloudinaryImage, type EventItem } from '@/types/content'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import {
  AdminButton,
  DateField,
  FieldRow,
  FormActions,
  FormPanel,
  TextAreaField,
  TextField,
  ToggleField,
} from '../../components/Form'
import { GalleryField, ImageField } from '../../components/ImageUploader'
import { PageHeader } from '../../components/PageHeader'
import { RichTextEditor } from '../../components/RichTextEditor'
import { Spinner } from '../../components/Spinner'
import { useToast } from '../../components/Toast'
import { useRecordEditor } from '../../hooks/useRecordEditor'
import { clearOtherPrimaries, isSlugTaken } from '../../lib/crud'
import { sanitizeHtml } from '../../lib/sanitize'
import styles from '../shared.module.css'

type Fields = {
  name: string
  slug: string
  date: string
  shortDescription: string
  description: string
  mainImage: CloudinaryImage | null
  imageGallery: CloudinaryImage[]
  isActive: boolean
  isPrimary: boolean
}

const BLANK: Fields = {
  name: '',
  slug: '',
  date: today(),
  shortDescription: '',
  description: '',
  mainImage: null,
  imageGallery: [],
  isActive: false,
  isPrimary: false,
}

type Errors = Partial<Record<'name' | 'slug' | 'date' | 'description', string>>

export function EventForm() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const toast = useToast()

  const [fields, setFields] = useState<Fields>(BLANK)
  const [errors, setErrors] = useState<Errors>({})
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [slugLocked, setSlugLocked] = useState(false)

  const onLoaded = useCallback((event: EventItem) => {
    setFields({
      name: event.name,
      slug: event.slug,
      date: event.date || today(),
      shortDescription: event.shortDescription,
      description: event.description,
      mainImage: event.mainImage,
      imageGallery: event.imageGallery,
      isActive: event.isActive,
      isPrimary: event.isPrimary,
    })
    setSlugLocked(true)
  }, [])

  const editor = useRecordEditor<EventItem>({
    collectionName: COLLECTIONS.events,
    id,
    map: toEventItem,
    onLoaded,
    listPath: '/admin/events',
    label: 'Event',
  })

  const isNew = !id || id === 'new'

  const update = <K extends keyof Fields>(key: K, value: Fields[K]) => {
    setFields((current) => {
      const next = { ...current, [key]: value }
      if (key === 'name' && !slugLocked) next.slug = slugify(String(value))
      return next
    })
    editor.setDirty(true)
  }

  const handleSubmit = async (submitEvent: FormEvent<HTMLFormElement>) => {
    submitEvent.preventDefault()

    const found: Errors = {}
    if (!fields.name.trim()) found.name = 'A name is required.'
    if (!fields.slug.trim()) found.slug = 'A slug is required.'
    else if (!isValidSlug(fields.slug)) {
      found.slug = 'Use lowercase letters, numbers and hyphens only.'
    }
    if (!fields.date) found.date = 'A date is required.'
    if (!sanitizeHtml(fields.description)) {
      found.description = 'A description is required.'
    }

    setErrors(found)
    if (Object.keys(found).length > 0) {
      toast.error('Please fix the highlighted fields.')
      return
    }

    if (await isSlugTaken(COLLECTIONS.events, fields.slug, isNew ? undefined : id)) {
      setErrors({ slug: 'Another event already uses this slug.' })
      toast.error('That slug is already taken.')
      return
    }

    if (fields.isPrimary) {
      await clearOtherPrimaries(COLLECTIONS.events, isNew ? undefined : id)
    }

    const savedId = await editor.save({
      name: fields.name.trim(),
      slug: fields.slug.trim(),
      date: fields.date,
      shortDescription: fields.shortDescription.trim(),
      description: sanitizeHtml(fields.description),
      mainImage: fields.mainImage,
      imageGallery: fields.imageGallery,
      isActive: fields.isActive,
      isPrimary: fields.isPrimary,
    })

    if (savedId && isNew) {
      router.replace(`/admin/events/${savedId}`)
      setSlugLocked(true)
    }
  }

  if (editor.loading) return <Spinner full label="Loading event…" />

  if (editor.missing) {
    return (
      <PageHeader
        title="Event not found"
        description="It may have been deleted."
        backTo={{ to: '/admin/events', label: 'All events' }}
      />
    )
  }

  return (
    <form className={`${styles.form} ${styles.formWide}`} onSubmit={handleSubmit}>
      <PageHeader
        title={isNew ? 'New event' : fields.name || 'Edit event'}
        backTo={{ to: '/admin/events', label: 'All events' }}
        actions={
          !isNew ? (
            <>
              <Link href={`/admin/event-forms/${id}`} className={styles.viewLink}>
                Registration form
                <Icon name="arrowRight" size={14} />
              </Link>
              {fields.isActive && (
                <a
                  className={styles.viewLink}
                  href={`/events/${fields.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View on site
                  <Icon name="arrowRight" size={14} />
                </a>
              )}
            </>
          ) : undefined
        }
      />

      <FormPanel title="Event details">
        <TextField
          label="Event name"
          value={fields.name}
          onChange={(value) => update('name', value)}
          required
          error={errors.name}
          placeholder="Summer Story Studio"
        />

        <div>
          <div className={styles.slugRow}>
            <TextField
              label="URL slug"
              value={fields.slug}
              onChange={(value) => update('slug', value)}
              required
              error={errors.slug}
              hint="Part of the page address. Avoid changing it once the event is live."
            />
            <button
              type="button"
              className={styles.inlineButton}
              onClick={() => {
                update('slug', slugify(fields.name))
                setSlugLocked(true)
              }}
            >
              From name
            </button>
          </div>
          <p className={styles.linkPreview}>
            {SITE_URL}/events/{fields.slug || 'your-slug'}
          </p>
        </div>

        <FieldRow>
          <DateField
            label="Event date"
            value={fields.date}
            onChange={(value) => update('date', value)}
            required
            error={errors.date}
          />
        </FieldRow>

        <TextAreaField
          label="Short description"
          value={fields.shortDescription}
          onChange={(value) => update('shortDescription', value)}
          rows={2}
          maxLength={220}
          hint="Shown on the events index and used as the search-result snippet."
          aside={
            <span className={styles.savedNote}>
              {fields.shortDescription.length}/220
            </span>
          }
        />
      </FormPanel>

      <FormPanel title="Main image" description="Used as the event hero and share image.">
        <ImageField
          label="Main image"
          value={fields.mainImage}
          onChange={(image) => update('mainImage', image)}
          hint="Landscape works best — around 1600 × 900."
        />
      </FormPanel>

      <FormPanel title="Description">
        <RichTextEditor
          label="Full description"
          value={fields.description}
          onChange={(html) => update('description', html)}
          required
          error={errors.description}
          placeholder="What the event covers, who it is for, what to bring…"
        />
      </FormPanel>

      <FormPanel
        title="Image gallery"
        description="Shown below the description. Reorder with the arrows — the first image leads the gallery."
      >
        <GalleryField
          label="Gallery"
          value={fields.imageGallery}
          onChange={(images) => update('imageGallery', images)}
          hint="Add photographs from previous runs of this event."
        />
      </FormPanel>

      <FormPanel title="Visibility">
        <ToggleField
          label="Published"
          checked={fields.isActive}
          onChange={(checked) => update('isActive', checked)}
          description="Off keeps this a draft, hidden from the website."
        />
        <ToggleField
          label="Primary upcoming event"
          checked={fields.isPrimary}
          onChange={(checked) => update('isPrimary', checked)}
          description="Only one published event is shown in the home page feature."
        />
      </FormPanel>

      <FormActions>
        <AdminButton type="submit" disabled={editor.saving}>
          {editor.saving ? 'Saving…' : isNew ? 'Create event' : 'Save changes'}
        </AdminButton>
        <AdminButton variant="secondary" onClick={() => router.push('/admin/events')}>
          Cancel
        </AdminButton>

        <span className={styles.actionSpacer} />

        {editor.dirty && <span className={styles.savedNote}>Unsaved changes</span>}

        {!isNew && (
          <AdminButton variant="danger" onClick={() => setConfirmDelete(true)}>
            Delete
          </AdminButton>
        )}
      </FormActions>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this event?"
        message={`“${fields.name}” will be removed permanently. This cannot be undone.`}
        confirmLabel="Delete event"
        busy={editor.deleting}
        onConfirm={editor.remove}
        onCancel={() => setConfirmDelete(false)}
      />
    </form>
  )
}
