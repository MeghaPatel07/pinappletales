/**
 * Cloudinary image pickers — one for a single image, one for a gallery.
 *
 * Both go through lib/cloudinary's `uploadImage`, so they work identically on
 * the unsigned-preset path and the signed-endpoint path.
 */

import { useId, useRef, useState } from 'react'
import { Icon } from '@/components/ui/Icon'
import {
  cloudinaryUrl,
  isCloudinaryConfigured,
  uploadImage,
  UploadError,
} from '@/lib/cloudinary'
import type { CloudinaryImage } from '@/types/content'
import styles from './ImageUploader.module.css'

const CONFIG_HINT =
  'Cloudinary is not configured. Add VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET to .env, then restart the dev server.'

function messageFor(error: unknown): string {
  return error instanceof UploadError
    ? error.message
    : 'Upload failed. Please try again.'
}

// -----------------------------------------------------------------------------
// Single image
// -----------------------------------------------------------------------------

type ImageFieldProps = {
  label: string
  value: CloudinaryImage | null
  onChange: (image: CloudinaryImage | null) => void
  hint?: string
  required?: boolean
  error?: string
}

export function ImageField({
  label,
  value,
  onChange,
  hint,
  required,
  error,
}: ImageFieldProps) {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [progress, setProgress] = useState<number | null>(null)
  const [uploadError, setUploadError] = useState('')

  const configured = isCloudinaryConfigured()

  const handleFile = async (file: File | undefined) => {
    if (!file) return

    setUploadError('')
    setProgress(0)

    try {
      const uploaded = await uploadImage(file, { onProgress: setProgress })
      onChange({ ...uploaded, alt: value?.alt ?? '' })
    } catch (caught) {
      setUploadError(messageFor(caught))
    } finally {
      setProgress(null)
      // Lets the same file be chosen again after a failure.
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const shownError = error || uploadError

  return (
    <div className={styles.field}>
      <div className={styles.labelRow}>
        <span className={styles.label}>
          {label}
          {required ? (
            <span className={styles.required} aria-hidden="true">
              *
            </span>
          ) : (
            <span className={styles.optional}>optional</span>
          )}
        </span>
      </div>

      {value ? (
        <div className={styles.preview}>
          <img
            src={cloudinaryUrl(value, { width: 480, crop: 'limit' })}
            alt=""
            className={styles.previewImage}
            width={value.width || undefined}
            height={value.height || undefined}
          />

          <div className={styles.previewBody}>
            <p className={styles.previewMeta}>
              {value.width && value.height
                ? `${value.width} × ${value.height}`
                : 'Uploaded'}
            </p>

            <label className={styles.altLabel} htmlFor={`${inputId}-alt`}>
              Alt text
              <input
                id={`${inputId}-alt`}
                type="text"
                className={styles.altInput}
                value={value.alt}
                placeholder="Describe the image for screen readers"
                onChange={(event) => onChange({ ...value, alt: event.target.value })}
              />
            </label>

            <div className={styles.previewActions}>
              <button
                type="button"
                className={styles.smallButton}
                onClick={() => inputRef.current?.click()}
              >
                Replace
              </button>
              <button
                type="button"
                className={styles.smallDanger}
                onClick={() => onChange(null)}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className={styles.dropzone}
          onClick={() => inputRef.current?.click()}
          disabled={!configured || progress !== null}
        >
          {progress === null ? (
            <>
              <Icon name="upload" size={20} />
              <span className={styles.dropzoneText}>Choose an image</span>
              <span className={styles.dropzoneHint}>JPG, PNG, WebP or AVIF · up to 8 MB</span>
            </>
          ) : (
            <>
              <span className={styles.dropzoneText}>Uploading… {progress}%</span>
              <span className={styles.progressTrack}>
                <span className={styles.progressBar} style={{ width: `${progress}%` }} />
              </span>
            </>
          )}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
        className="visually-hidden"
        onChange={(event) => void handleFile(event.target.files?.[0])}
      />

      {!configured && <p className={styles.hint}>{CONFIG_HINT}</p>}
      {hint && configured && !shownError && <p className={styles.hint}>{hint}</p>}
      {shownError && (
        <p className={styles.error} role="alert">
          {shownError}
        </p>
      )}
    </div>
  )
}

// -----------------------------------------------------------------------------
// Gallery
// -----------------------------------------------------------------------------

type GalleryFieldProps = {
  label: string
  value: CloudinaryImage[]
  onChange: (images: CloudinaryImage[]) => void
  hint?: string
}

export function GalleryField({ label, value, onChange, hint }: GalleryFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(0)
  const [uploadError, setUploadError] = useState('')

  const configured = isCloudinaryConfigured()

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    setUploadError('')
    const chosen = Array.from(files)
    setUploading(chosen.length)

    // Sequential rather than parallel: a gallery of large images uploaded all
    // at once saturates an ordinary connection and the browser queues them
    // anyway, but one failure would then be hard to attribute.
    const uploaded: CloudinaryImage[] = []
    for (const file of chosen) {
      try {
        const image = await uploadImage(file)
        uploaded.push({ ...image, alt: '' })
      } catch (caught) {
        setUploadError(`${file.name}: ${messageFor(caught)}`)
      } finally {
        setUploading((count) => count - 1)
      }
    }

    if (uploaded.length > 0) onChange([...value, ...uploaded])
    if (inputRef.current) inputRef.current.value = ''
  }

  const move = (index: number, delta: number) => {
    const target = index + delta
    if (target < 0 || target >= value.length) return

    const next = [...value]
    const [moved] = next.splice(index, 1)
    if (moved) next.splice(target, 0, moved)
    onChange(next)
  }

  return (
    <div className={styles.field}>
      <div className={styles.labelRow}>
        <span className={styles.label}>
          {label}
          <span className={styles.optional}>
            {value.length > 0 ? `${value.length} image${value.length === 1 ? '' : 's'}` : 'optional'}
          </span>
        </span>
      </div>

      {value.length > 0 && (
        <ul className={styles.gallery}>
          {value.map((image, index) => (
            <li key={image.publicId || image.url} className={styles.galleryItem}>
              <img
                src={cloudinaryUrl(image, { width: 240, height: 180, crop: 'fill', gravity: 'auto' })}
                alt=""
                className={styles.galleryImage}
                width={240}
                height={180}
                loading="lazy"
              />

              <input
                type="text"
                className={styles.galleryAlt}
                value={image.alt}
                placeholder="Alt text"
                onChange={(event) => {
                  const next = [...value]
                  next[index] = { ...image, alt: event.target.value }
                  onChange(next)
                }}
              />

              <div className={styles.galleryActions}>
                <button
                  type="button"
                  className={styles.iconButton}
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  title="Move earlier"
                >
                  <Icon name="chevronLeft" size={14} />
                  <span className="visually-hidden">Move earlier</span>
                </button>
                <button
                  type="button"
                  className={styles.iconButton}
                  onClick={() => move(index, 1)}
                  disabled={index === value.length - 1}
                  title="Move later"
                >
                  <Icon name="chevronRight" size={14} />
                  <span className="visually-hidden">Move later</span>
                </button>
                <button
                  type="button"
                  className={styles.iconDanger}
                  onClick={() => onChange(value.filter((_, i) => i !== index))}
                  title="Remove"
                >
                  <Icon name="trash" size={14} />
                  <span className="visually-hidden">Remove image</span>
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        className={styles.addMore}
        onClick={() => inputRef.current?.click()}
        disabled={!configured || uploading > 0}
      >
        <Icon name="plus" size={16} />
        {uploading > 0
          ? `Uploading ${uploading} image${uploading === 1 ? '' : 's'}…`
          : 'Add images'}
      </button>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
        className="visually-hidden"
        onChange={(event) => void handleFiles(event.target.files)}
      />

      {!configured && <p className={styles.hint}>{CONFIG_HINT}</p>}
      {hint && configured && !uploadError && <p className={styles.hint}>{hint}</p>}
      {uploadError && (
        <p className={styles.error} role="alert">
          {uploadError}
        </p>
      )}
    </div>
  )
}
