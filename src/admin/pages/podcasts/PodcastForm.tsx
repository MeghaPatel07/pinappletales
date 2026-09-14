import { useCallback, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon'
import { toPodcast } from '@/content/mappers'
import { today } from '@/lib/date'
import { isValidSlug, slugify } from '@/lib/slug'
import { youtubeId, youtubeThumbnail } from '@/lib/youtube'
import { COLLECTIONS, type Podcast } from '@/types/content'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import {
  AdminButton,
  DateField,
  FieldRow,
  FormActions,
  FormPanel,
  TextField,
  ToggleField,
} from '../../components/Form'
import { PageHeader } from '../../components/PageHeader'
import { RichTextEditor } from '../../components/RichTextEditor'
import { Spinner } from '../../components/Spinner'
import { useToast } from '../../components/Toast'
import { useRecordEditor } from '../../hooks/useRecordEditor'
import { isSlugTaken } from '../../lib/crud'
import { sanitizeHtml } from '../../lib/sanitize'
import styles from '../shared.module.css'

type Fields = {
  name: string
  slug: string
  youtubeLink: string
  description: string
  date: string
  isActive: boolean
}

const BLANK: Fields = {
  name: '',
  slug: '',
  youtubeLink: '',
  description: '',
  date: today(),
  isActive: false,
}

type Errors = Partial<Record<'name' | 'slug' | 'youtubeLink' | 'date', string>>

export function PodcastForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const toast = useToast()

  const [fields, setFields] = useState<Fields>(BLANK)
  const [errors, setErrors] = useState<Errors>({})
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [slugLocked, setSlugLocked] = useState(false)

  const onLoaded = useCallback((podcast: Podcast) => {
    setFields({
      name: podcast.name,
      slug: podcast.slug,
      youtubeLink: podcast.youtubeLink,
      description: podcast.description,
      date: podcast.date || today(),
      isActive: podcast.isActive,
    })
    setSlugLocked(true)
  }, [])

  const editor = useRecordEditor<Podcast>({
    collectionName: COLLECTIONS.podcasts,
    id,
    map: toPodcast,
    onLoaded,
    listPath: '/admin/podcasts',
    label: 'Episode',
  })

  const isNew = !id || id === 'new'
  const videoId = youtubeId(fields.youtubeLink)

  const update = <K extends keyof Fields>(key: K, value: Fields[K]) => {
    setFields((current) => {
      const next = { ...current, [key]: value }
      if (key === 'name' && !slugLocked) next.slug = slugify(String(value))
      return next
    })
    editor.setDirty(true)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const found: Errors = {}
    if (!fields.name.trim()) found.name = 'A name is required.'
    if (!fields.slug.trim()) found.slug = 'A slug is required.'
    else if (!isValidSlug(fields.slug)) {
      found.slug = 'Use lowercase letters, numbers and hyphens only.'
    }
    if (!fields.youtubeLink.trim()) {
      found.youtubeLink = 'A YouTube link is required.'
    } else if (!videoId) {
      found.youtubeLink =
        'That does not look like a YouTube link. Paste the address from the browser or the Share button.'
    }
    if (!fields.date) found.date = 'A date is required.'

    setErrors(found)
    if (Object.keys(found).length > 0) {
      toast.error('Please fix the highlighted fields.')
      return
    }

    if (await isSlugTaken(COLLECTIONS.podcasts, fields.slug, isNew ? undefined : id)) {
      setErrors({ slug: 'Another episode already uses this slug.' })
      toast.error('That slug is already taken.')
      return
    }

    const savedId = await editor.save({
      name: fields.name.trim(),
      slug: fields.slug.trim(),
      youtubeLink: fields.youtubeLink.trim(),
      description: sanitizeHtml(fields.description),
      date: fields.date,
      isActive: fields.isActive,
    })

    if (savedId && isNew) {
      navigate(`/admin/podcasts/${savedId}`, { replace: true })
      setSlugLocked(true)
    }
  }

  if (editor.loading) return <Spinner full label="Loading episode…" />

  if (editor.missing) {
    return (
      <PageHeader
        title="Episode not found"
        description="It may have been deleted."
        backTo={{ to: '/admin/podcasts', label: 'All episodes' }}
      />
    )
  }

  return (
    <form className={`${styles.form} ${styles.formWide}`} onSubmit={handleSubmit}>
      <PageHeader
        title={isNew ? 'New episode' : fields.name || 'Edit episode'}
        backTo={{ to: '/admin/podcasts', label: 'All episodes' }}
        actions={
          !isNew && fields.isActive ? (
            <a
              className={styles.viewLink}
              href="/podcast"
              target="_blank"
              rel="noopener noreferrer"
            >
              View on site
              <Icon name="arrowRight" size={14} />
            </a>
          ) : undefined
        }
      />

      <FormPanel title="Episode">
        <TextField
          label="Episode name"
          value={fields.name}
          onChange={(value) => update('name', value)}
          required
          error={errors.name}
          placeholder="Talking to children about big feelings"
        />

        <div className={styles.slugRow}>
          <TextField
            label="URL slug"
            value={fields.slug}
            onChange={(value) => update('slug', value)}
            required
            error={errors.slug}
            hint="Used to link directly to this episode."
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

        <TextField
          label="YouTube link"
          type="url"
          value={fields.youtubeLink}
          onChange={(value) => update('youtubeLink', value)}
          required
          error={errors.youtubeLink}
          placeholder="https://www.youtube.com/watch?v=…"
          hint="Watch, share, embed and Shorts links all work."
        />

        {videoId && (
          <div className={styles.videoPreview}>
            <img
              src={youtubeThumbnail(videoId)}
              alt=""
              className={styles.videoThumb}
              width={160}
              height={120}
            />
            <div>
              <p className={styles.savedNote}>Video recognised</p>
              <p className={styles.linkPreview}>Video ID: {videoId}</p>
            </div>
          </div>
        )}

        <FieldRow>
          <DateField
            label="Publication date"
            value={fields.date}
            onChange={(value) => update('date', value)}
            required
            error={errors.date}
          />
        </FieldRow>
      </FormPanel>

      <FormPanel title="Description">
        <RichTextEditor
          label="Episode notes"
          value={fields.description}
          onChange={(html) => update('description', html)}
          height={320}
          placeholder="What this episode covers, who is featured, timestamps…"
        />
      </FormPanel>

      <FormPanel title="Visibility">
        <ToggleField
          label="Published"
          checked={fields.isActive}
          onChange={(checked) => update('isActive', checked)}
          description="Off keeps this a draft, hidden from the website."
        />
      </FormPanel>

      <FormActions>
        <AdminButton type="submit" disabled={editor.saving}>
          {editor.saving ? 'Saving…' : isNew ? 'Create episode' : 'Save changes'}
        </AdminButton>
        <AdminButton variant="secondary" onClick={() => navigate('/admin/podcasts')}>
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
        title="Delete this episode?"
        message={`“${fields.name}” will be removed permanently. This cannot be undone.`}
        confirmLabel="Delete episode"
        busy={editor.deleting}
        onConfirm={editor.remove}
        onCancel={() => setConfirmDelete(false)}
      />
    </form>
  )
}
