import { useCallback, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon'
import { SITE_URL } from '@/config/site'
import { toBlogPost } from '@/content/mappers'
import { readingTime } from '@/lib/html'
import { isValidSlug, slugify } from '@/lib/slug'
import { today } from '@/lib/date'
import { COLLECTIONS, type BlogPost, type CloudinaryImage } from '@/types/content'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import {
  AdminButton,
  DateField,
  FieldRow,
  FormActions,
  FormPanel,
  NumberField,
  TextAreaField,
  TextField,
  ToggleField,
} from '../../components/Form'
import { ImageField } from '../../components/ImageUploader'
import { PageHeader } from '../../components/PageHeader'
import { RichTextEditor } from '../../components/RichTextEditor'
import { Spinner } from '../../components/Spinner'
import { useToast } from '../../components/Toast'
import { useRecordEditor } from '../../hooks/useRecordEditor'
import { clearOtherPrimaries, isSlugTaken } from '../../lib/crud'
import { sanitizeHtml } from '../../lib/sanitize'
import styles from '../shared.module.css'

type Fields = {
  title: string
  slug: string
  shortDescription: string
  bannerImage: CloudinaryImage | null
  date: string
  minuteRead: number
  description: string
  author: string
  isActive: boolean
  isPrimary: boolean
}

const BLANK: Fields = {
  title: '',
  slug: '',
  shortDescription: '',
  bannerImage: null,
  date: today(),
  minuteRead: 3,
  description: '',
  author: 'Kenaa Jadeja',
  isActive: false,
  isPrimary: false,
}

type Errors = Partial<Record<'title' | 'slug' | 'date' | 'description' | 'author', string>>

export function BlogForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const toast = useToast()

  const [fields, setFields] = useState<Fields>(BLANK)
  const [errors, setErrors] = useState<Errors>({})
  const [confirmDelete, setConfirmDelete] = useState(false)
  // Once a post exists its slug is a published URL, so it is not regenerated
  // from the title unless the author asks for it.
  const [slugLocked, setSlugLocked] = useState(false)

  const onLoaded = useCallback((post: BlogPost) => {
    setFields({
      title: post.title,
      slug: post.slug,
      shortDescription: post.shortDescription,
      bannerImage: post.bannerImage,
      date: post.date || today(),
      minuteRead: post.minuteRead || 1,
      description: post.description,
      author: post.author,
      isActive: post.isActive,
      isPrimary: post.isPrimary,
    })
    setSlugLocked(true)
  }, [])

  const editor = useRecordEditor<BlogPost>({
    collectionName: COLLECTIONS.blogs,
    id,
    map: toBlogPost,
    onLoaded,
    listPath: '/admin/blogs',
    label: 'Post',
  })

  const isNew = !id || id === 'new'

  const update = <K extends keyof Fields>(key: K, value: Fields[K]) => {
    setFields((current) => {
      const next = { ...current, [key]: value }
      // Keep the slug tracking the title until the post has been saved once.
      if (key === 'title' && !slugLocked) {
        next.slug = slugify(String(value))
      }
      return next
    })
    editor.setDirty(true)
  }

  const validate = (): Errors => {
    const found: Errors = {}

    if (!fields.title.trim()) found.title = 'A title is required.'
    if (!fields.slug.trim()) found.slug = 'A slug is required.'
    else if (!isValidSlug(fields.slug)) {
      found.slug = 'Use lowercase letters, numbers and hyphens only.'
    }
    if (!fields.date) found.date = 'A date is required.'
    if (!fields.author.trim()) found.author = 'An author is required.'
    if (!sanitizeHtml(fields.description)) {
      found.description = 'The article body cannot be empty.'
    }

    return found
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const found = validate()
    setErrors(found)
    if (Object.keys(found).length > 0) {
      toast.error('Please fix the highlighted fields.')
      return
    }

    // Checked at save time rather than on every keystroke — one read instead of
    // dozens, and the answer is only binding at the moment of writing anyway.
    if (await isSlugTaken(COLLECTIONS.blogs, fields.slug, isNew ? undefined : id)) {
      setErrors({ slug: 'Another post already uses this slug.' })
      toast.error('That slug is already taken.')
      return
    }

    const description = sanitizeHtml(fields.description)

    if (fields.isPrimary) {
      await clearOtherPrimaries(COLLECTIONS.blogs, isNew ? undefined : id)
    }

    const savedId = await editor.save({
      title: fields.title.trim(),
      slug: fields.slug.trim(),
      shortDescription: fields.shortDescription.trim(),
      bannerImage: fields.bannerImage,
      date: fields.date,
      minuteRead: Math.max(1, Math.round(fields.minuteRead) || 1),
      description,
      author: fields.author.trim(),
      isActive: fields.isActive,
      isPrimary: fields.isPrimary,
    })

    if (savedId && isNew) {
      // Move off /new so a reload does not create a second copy.
      navigate(`/admin/blogs/${savedId}`, { replace: true })
      setSlugLocked(true)
    }
  }

  if (editor.loading) return <Spinner full label="Loading post…" />

  if (editor.missing) {
    return (
      <>
        <PageHeader
          title="Post not found"
          description="It may have been deleted."
          backTo={{ to: '/admin/blogs', label: 'All posts' }}
        />
      </>
    )
  }

  const estimated = readingTime(fields.description)

  return (
    <form className={`${styles.form} ${styles.formWide}`} onSubmit={handleSubmit}>
      <PageHeader
        title={isNew ? 'New post' : fields.title || 'Edit post'}
        backTo={{ to: '/admin/blogs', label: 'All posts' }}
        actions={
          !isNew && fields.isActive ? (
            <a
              className={styles.viewLink}
              href={`/blog/${fields.slug}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              View on site
              <Icon name="arrowRight" size={14} />
            </a>
          ) : undefined
        }
      />

      <FormPanel title="Article">
        <TextField
          label="Title"
          value={fields.title}
          onChange={(value) => update('title', value)}
          required
          error={errors.title}
          placeholder="How art helps a child name a feeling"
        />

        <div>
          <div className={styles.slugRow}>
            <TextField
              label="URL slug"
              value={fields.slug}
              onChange={(value) => update('slug', value)}
              required
              error={errors.slug}
              hint="Part of the page address. Avoid changing it once the post is live — old links would break."
            />
            <button
              type="button"
              className={styles.inlineButton}
              onClick={() => {
                update('slug', slugify(fields.title))
                setSlugLocked(true)
              }}
            >
              From title
            </button>
          </div>
          <p className={styles.linkPreview}>
            {SITE_URL}/blog/{fields.slug || 'your-slug'}
          </p>
        </div>

        <TextAreaField
          label="Short description"
          value={fields.shortDescription}
          onChange={(value) => update('shortDescription', value)}
          rows={2}
          maxLength={220}
          hint="Shown on the blog index and used as the search-result snippet. If left empty, the opening of the article is used."
          aside={
            <span className={styles.savedNote}>
              {fields.shortDescription.length}/220
            </span>
          }
        />

        <FieldRow>
          <TextField
            label="Author"
            value={fields.author}
            onChange={(value) => update('author', value)}
            required
            error={errors.author}
          />
          <DateField
            label="Publication date"
            value={fields.date}
            onChange={(value) => update('date', value)}
            required
            error={errors.date}
          />
          <NumberField
            label="Minutes to read"
            value={fields.minuteRead}
            onChange={(value) => update('minuteRead', value)}
            min={1}
            max={90}
            required
            aside={
              estimated !== fields.minuteRead && estimated > 0 ? (
                <button
                  type="button"
                  className={styles.inlineButton}
                  onClick={() => update('minuteRead', estimated)}
                >
                  Use {estimated}
                </button>
              ) : undefined
            }
          />
        </FieldRow>
      </FormPanel>

      <FormPanel
        title="Banner image"
        description="Appears at the top of the article and as the social share image."
      >
        <ImageField
          label="Banner"
          value={fields.bannerImage}
          onChange={(image) => update('bannerImage', image)}
          hint="Landscape works best — around 1600 × 900."
        />
      </FormPanel>

      <FormPanel title="Body">
        <RichTextEditor
          label="Article"
          value={fields.description}
          onChange={(html) => update('description', html)}
          required
          error={errors.description}
          hint="Paste or drag images straight in — they upload to Cloudinary automatically."
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
          label="Featured post"
          checked={fields.isPrimary}
          onChange={(checked) => update('isPrimary', checked)}
          description="Featured posts are pulled to the top of the blog page."
        />
      </FormPanel>

      <FormActions>
        <AdminButton type="submit" disabled={editor.saving}>
          {editor.saving ? 'Saving…' : isNew ? 'Create post' : 'Save changes'}
        </AdminButton>
        <AdminButton variant="secondary" onClick={() => navigate('/admin/blogs')}>
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
        title="Delete this post?"
        message={`“${fields.title}” will be removed permanently. This cannot be undone.`}
        confirmLabel="Delete post"
        busy={editor.deleting}
        onConfirm={editor.remove}
        onCancel={() => setConfirmDelete(false)}
      />
    </form>
  )
}
