'use client'

/**
 * Cloudinary image pickers — one for a single image, one for a gallery.
 *
 * Both go through lib/cloudinary's `uploadImage`, which always uses the
 * signed path against /api/admin/uploads/sign.
 */

import { useId, useRef, useState } from 'react'
import { Icon } from '@/components/ui/Icon'
import { cloudinaryUrl, isCloudinaryConfigured, uploadImage, UploadError } from '@/lib/cloudinary'
import type { CloudinaryImage } from '@/types/content'

const CONFIG_HINT =
  'Cloudinary is not configured. Add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET to .env, then restart the dev server.'

function messageFor(error: unknown): string {
  return error instanceof UploadError ? error.message : 'Upload failed. Please try again.'
}

const LABEL_CLASSES = 'eyebrow text-ink-soft'

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

export function ImageField({ label, value, onChange, hint, required, error }: ImageFieldProps) {
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
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const shownError = error || uploadError

  return (
    <div className="grid gap-2">
      <span className={LABEL_CLASSES}>
        {label}
        {required ? (
          <span className="ml-1 text-coral" aria-hidden>
            *
          </span>
        ) : (
          <span className="ml-1 normal-case tracking-normal text-ink-soft/70">(optional)</span>
        )}
      </span>

      {value ? (
        <div className="flex flex-col gap-3 rounded-card border border-line bg-paper-2 p-3 sm:flex-row">
          <img
            src={cloudinaryUrl(value, { width: 480, crop: 'limit' })}
            alt=""
            className="h-40 w-full rounded-xl object-cover sm:w-56"
            width={value.width || undefined}
            height={value.height || undefined}
          />

          <div className="flex flex-1 flex-col gap-2">
            <p className="text-[0.82rem] text-ink-soft">{value.width && value.height ? `${value.width} × ${value.height}` : 'Uploaded'}</p>

            <label className="grid gap-1">
              <span className="text-[0.78rem] text-ink-soft">Alt text</span>
              <input
                id={`${inputId}-alt`}
                type="text"
                className="rounded-lg border border-line bg-paper px-3 py-1.5 text-[0.9rem]"
                value={value.alt}
                placeholder="Describe the image for screen readers"
                onChange={(event) => onChange({ ...value, alt: event.target.value })}
              />
            </label>

            <div className="mt-auto flex gap-2">
              <button type="button" className="rounded-full border border-line px-3 py-1.5 text-[0.82rem] hover:bg-card" onClick={() => inputRef.current?.click()}>
                Replace
              </button>
              <button type="button" className="rounded-full border border-coral px-3 py-1.5 text-[0.82rem] text-coral hover:bg-coral hover:text-paper" onClick={() => onChange(null)}>
                Remove
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="flex flex-col items-center justify-center gap-2 rounded-card border-2 border-dashed border-line bg-paper-2 px-4 py-10 text-center transition-colors hover:border-brand-deep disabled:cursor-not-allowed disabled:opacity-60"
          onClick={() => inputRef.current?.click()}
          disabled={!configured || progress !== null}
        >
          {progress === null ? (
            <>
              <Icon name="upload" size={20} className="text-ink-soft" />
              <span className="text-[0.92rem] font-medium text-ink">Choose an image</span>
              <span className="text-[0.78rem] text-ink-soft">JPG, PNG, WebP or AVIF · up to 8 MB</span>
            </>
          ) : (
            <>
              <span className="text-[0.92rem] text-ink">Uploading… {progress}%</span>
              <span className="h-1.5 w-40 overflow-hidden rounded-full bg-line">
                <span className="block h-full bg-brand-deep transition-all" style={{ width: `${progress}%` }} />
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

      {!configured && <p className="text-[0.82rem] text-ink-soft">{CONFIG_HINT}</p>}
      {hint && configured && !shownError && <p className="text-[0.82rem] text-ink-soft">{hint}</p>}
      {shownError && (
        <p className="text-[0.82rem] text-coral" role="alert">
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
    <div className="grid gap-2">
      <span className={LABEL_CLASSES}>
        {label}
        <span className="ml-1 normal-case tracking-normal text-ink-soft/70">
          {value.length > 0 ? `${value.length} image${value.length === 1 ? '' : 's'}` : 'optional'}
        </span>
      </span>

      {value.length > 0 && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {value.map((image, index) => (
            <li key={image.publicId || image.url} className="overflow-hidden rounded-card border border-line bg-paper-2">
              <img
                src={cloudinaryUrl(image, { width: 240, height: 180, crop: 'fill', gravity: 'auto' })}
                alt=""
                className="h-28 w-full object-cover"
                width={240}
                height={180}
                loading="lazy"
              />
              <input
                type="text"
                className="w-full border-y border-line bg-paper px-2.5 py-1.5 text-[0.82rem]"
                value={image.alt}
                placeholder="Alt text"
                onChange={(event) => {
                  const next = [...value]
                  next[index] = { ...image, alt: event.target.value }
                  onChange(next)
                }}
              />
              <div className="flex items-center justify-between gap-1 p-1.5">
                <button
                  type="button"
                  className="grid h-7 w-7 place-items-center rounded-lg text-ink-soft hover:bg-card disabled:opacity-30"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  title="Move earlier"
                >
                  <Icon name="chevronLeft" size={14} />
                </button>
                <button
                  type="button"
                  className="grid h-7 w-7 place-items-center rounded-lg text-ink-soft hover:bg-card disabled:opacity-30"
                  onClick={() => move(index, 1)}
                  disabled={index === value.length - 1}
                  title="Move later"
                >
                  <Icon name="chevronRight" size={14} />
                </button>
                <button
                  type="button"
                  className="grid h-7 w-7 place-items-center rounded-lg text-coral hover:bg-coral hover:text-paper"
                  onClick={() => onChange(value.filter((_, i) => i !== index))}
                  title="Remove"
                >
                  <Icon name="trash" size={14} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        className="inline-flex w-fit items-center gap-1.5 rounded-full border border-line px-4 py-2 text-[0.85rem] font-medium text-ink hover:bg-card disabled:cursor-not-allowed disabled:opacity-60"
        onClick={() => inputRef.current?.click()}
        disabled={!configured || uploading > 0}
      >
        <Icon name="plus" size={16} />
        {uploading > 0 ? `Uploading ${uploading} image${uploading === 1 ? '' : 's'}…` : 'Add images'}
      </button>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
        className="visually-hidden"
        onChange={(event) => void handleFiles(event.target.files)}
      />

      {!configured && <p className="text-[0.82rem] text-ink-soft">{CONFIG_HINT}</p>}
      {hint && configured && !uploadError && <p className="text-[0.82rem] text-ink-soft">{hint}</p>}
      {uploadError && (
        <p className="text-[0.82rem] text-coral" role="alert">
          {uploadError}
        </p>
      )}
    </div>
  )
}
