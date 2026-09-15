/**
 * Cloudinary delivery and upload.
 *
 * Delivery URL helpers are plain string builders and run anywhere (server or
 * client). Uploads only ever happen from the admin, and always go through the
 * signed path — `/api/admin/uploads/sign` — now that there is always a real
 * backend behind the admin; there is no unsigned-preset fallback to keep in
 * step.
 *
 * Plain module, no React components — the delivery URL builders are used by
 * Server Components too; only the upload functions need a browser.
 */

import { getAccessToken } from './api-client'

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? ''

/** Where uploads land, so the Cloudinary dashboard stays tidy. */
export const UPLOAD_FOLDER = 'pineappletales'

const DELIVERY_BASE = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload`

export const isCloudinaryConfigured = (): boolean => Boolean(CLOUD_NAME)

// -----------------------------------------------------------------------------
// Delivery
// -----------------------------------------------------------------------------

export type TransformOptions = {
  width?: number
  height?: number
  /** `fill` crops to the exact box; `limit` only ever scales down. */
  crop?: 'fill' | 'fit' | 'limit'
  /** Focus for `fill` crops. `auto` lets Cloudinary find the subject. */
  gravity?: 'auto' | 'face' | 'center'
}

/**
 * Builds a delivery URL with the transformation baked in.
 *
 * `f_auto,q_auto` is always applied: Cloudinary then serves AVIF or WebP to
 * browsers that accept them and picks a quality level per image.
 */
export function cloudinaryUrl(
  source: { url: string; publicId?: string } | string,
  options: TransformOptions = {},
): string {
  const url = typeof source === 'string' ? source : source.url
  const publicId = typeof source === 'string' ? '' : (source.publicId ?? '')

  if (!url) return ''
  if (!url.includes('res.cloudinary.com')) return url

  const parts = ['f_auto', 'q_auto']
  if (options.width) parts.push(`w_${Math.round(options.width)}`)
  if (options.height) parts.push(`h_${Math.round(options.height)}`)
  if (options.crop) parts.push(`c_${options.crop}`)
  if (options.gravity) parts.push(`g_${options.gravity}`)
  if (options.crop !== 'fill') parts.push('dpr_auto')

  const transformation = parts.join(',')

  if (publicId && CLOUD_NAME) {
    return `${DELIVERY_BASE}/${transformation}/${publicId}`
  }

  return url.replace(/\/upload\/(v\d+\/)?/, `/upload/${transformation}/$1`)
}

const SRCSET_WIDTHS = [400, 640, 900, 1200, 1600] as const

export function cloudinarySrcSet(
  source: { url: string; publicId?: string },
  options: Omit<TransformOptions, 'width'> = {},
): string {
  if (!source.url || !source.url.includes('res.cloudinary.com')) return ''

  return SRCSET_WIDTHS.map(
    (width) => `${cloudinaryUrl(source, { ...options, width })} ${width}w`,
  ).join(', ')
}

// -----------------------------------------------------------------------------
// Upload
// -----------------------------------------------------------------------------

export type UploadedImage = {
  url: string
  publicId: string
  width: number
  height: number
}

export type UploadOptions = {
  onProgress?: (percent: number) => void
  signal?: AbortSignal
}

const MAX_BYTES = 8 * 1024 * 1024
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/gif',
]

export class UploadError extends Error {}

type SignaturePayload = {
  signature: string
  timestamp: number
  apiKey: string
  cloudName: string
  folder?: string
}

async function fetchSignature(): Promise<SignaturePayload> {
  const token = getAccessToken()

  const response = await fetch('/api/admin/uploads/sign', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ folder: UPLOAD_FOLDER }),
  })

  if (!response.ok) {
    throw new UploadError(
      `Could not get an upload signature (${response.status}). Are you still signed in?`,
    )
  }

  const payload = (await response.json()) as Partial<SignaturePayload>

  if (!payload.signature || !payload.timestamp || !payload.apiKey) {
    throw new UploadError('The signing endpoint returned an unexpected response.')
  }

  return payload as SignaturePayload
}

function post(formData: FormData, cloudName: string, options: UploadOptions): Promise<UploadedImage> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest()
    request.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`)

    request.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable && options.onProgress) {
        options.onProgress(Math.round((event.loaded / event.total) * 100))
      }
    })

    request.addEventListener('load', () => {
      let payload: Record<string, unknown> = {}
      try {
        payload = JSON.parse(request.responseText) as Record<string, unknown>
      } catch {
        reject(new UploadError('Cloudinary returned a malformed response.'))
        return
      }

      if (request.status < 200 || request.status >= 300) {
        const error = payload.error as { message?: string } | undefined
        reject(new UploadError(error?.message ?? `Upload failed (${request.status}).`))
        return
      }

      resolve({
        url: String(payload.secure_url ?? ''),
        publicId: String(payload.public_id ?? ''),
        width: Number(payload.width ?? 0),
        height: Number(payload.height ?? 0),
      })
    })

    request.addEventListener('error', () =>
      reject(new UploadError('Network error while uploading to Cloudinary.')),
    )
    request.addEventListener('abort', () => reject(new UploadError('Upload cancelled.')))

    options.signal?.addEventListener('abort', () => request.abort())

    request.send(formData)
  })
}

export async function uploadImage(
  file: File,
  options: UploadOptions = {},
): Promise<UploadedImage> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new UploadError('Please choose a JPG, PNG, WebP, AVIF or GIF image.')
  }

  if (file.size > MAX_BYTES) {
    throw new UploadError(
      `That image is ${(file.size / 1024 / 1024).toFixed(1)} MB. The limit is ${MAX_BYTES / 1024 / 1024} MB.`,
    )
  }

  const { signature, timestamp, apiKey, folder, cloudName } = await fetchSignature()

  const formData = new FormData()
  formData.append('file', file)
  formData.append('folder', folder ?? UPLOAD_FOLDER)
  formData.append('api_key', apiKey)
  formData.append('timestamp', String(timestamp))
  formData.append('signature', signature)

  return post(formData, cloudName || CLOUD_NAME, options)
}
