/**
 * Cloudinary delivery and upload.
 *
 * Uploads take one of two paths, chosen by environment and hidden behind a
 * single `uploadImage` call so no component knows the difference:
 *
 *   unsigned  (default)  the browser posts with an upload preset. No server,
 *                        no secret anywhere near the bundle. Lock the preset
 *                        down in the Cloudinary dashboard — folder, formats,
 *                        max size — since the preset name is public.
 *
 *   signed    (opt-in)   set VITE_CLOUDINARY_SIGNATURE_URL. The admin asks that
 *                        endpoint for a signature covering exactly this upload,
 *                        and the API secret stays on the server.
 *
 * Cloudinary signatures cannot be static: each one is a hash of that upload's
 * parameters plus a timestamp, so it is single-use by construction. That is why
 * the signed path needs an endpoint and cannot be done from an env var alone.
 */

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME ?? ''
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET ?? ''
const SIGNATURE_URL = import.meta.env.VITE_CLOUDINARY_SIGNATURE_URL ?? ''

/** Where uploads land, so the preset and dashboard stay tidy. */
export const UPLOAD_FOLDER = 'pineappletales'

const DELIVERY_BASE = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload`

export const isCloudinaryConfigured = (): boolean =>
  Boolean(CLOUD_NAME && (UPLOAD_PRESET || SIGNATURE_URL))

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
 * browsers that accept them and picks a quality level per image, which is the
 * single biggest win available on image weight.
 */
export function cloudinaryUrl(
  source: { url: string; publicId?: string } | string,
  options: TransformOptions = {},
): string {
  const url = typeof source === 'string' ? source : source.url
  const publicId = typeof source === 'string' ? '' : (source.publicId ?? '')

  if (!url) return ''

  // Anything not served by Cloudinary is passed through untouched.
  if (!url.includes('res.cloudinary.com')) return url

  const parts = ['f_auto', 'q_auto']
  if (options.width) parts.push(`w_${Math.round(options.width)}`)
  if (options.height) parts.push(`h_${Math.round(options.height)}`)
  if (options.crop) parts.push(`c_${options.crop}`)
  if (options.gravity) parts.push(`g_${options.gravity}`)
  // Guards against upscaling a small original into a blurry hero.
  if (options.crop !== 'fill') parts.push('dpr_auto')

  const transformation = parts.join(',')

  if (publicId && CLOUD_NAME) {
    return `${DELIVERY_BASE}/${transformation}/${publicId}`
  }

  // No public id recorded (older documents): splice the transformation into the
  // stored URL right after the /upload/ segment.
  return url.replace(/\/upload\/(v\d+\/)?/, `/upload/${transformation}/$1`)
}

/** Widths offered to the browser for responsive images. */
const SRCSET_WIDTHS = [400, 640, 900, 1200, 1600] as const

/** Builds a `srcset` so phones never download a desktop-sized image. */
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
  /** 0–100. Called as the file goes up so the UI can show a real bar. */
  onProgress?: (percent: number) => void
  signal?: AbortSignal
}

/** Rejected before any bytes leave the browser. */
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
  folder?: string
}

/**
 * Supplies the signed path with the caller's Firebase ID token so the endpoint
 * can refuse to sign uploads for anyone who is not a logged-in admin.
 *
 * Registered by the admin AuthProvider at sign-in. Left unset on the public
 * site, which never uploads anything.
 */
let getIdToken: (() => Promise<string | null>) | null = null

export function setUploadTokenProvider(
  provider: (() => Promise<string | null>) | null,
): void {
  getIdToken = provider
}

async function fetchSignature(): Promise<SignaturePayload> {
  const token = getIdToken ? await getIdToken() : null

  const response = await fetch(SIGNATURE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ folder: UPLOAD_FOLDER }),
  })

  if (!response.ok) {
    throw new UploadError(
      `Could not get an upload signature (${response.status}). Check that the signing endpoint is deployed.`,
    )
  }

  const payload = (await response.json()) as Partial<SignaturePayload>

  if (!payload.signature || !payload.timestamp || !payload.apiKey) {
    throw new UploadError('The signing endpoint returned an unexpected response.')
  }

  return payload as SignaturePayload
}

/**
 * Sends the file to Cloudinary and resolves with what the site needs to render
 * it. XMLHttpRequest rather than fetch, because only XHR reports upload
 * progress.
 */
function post(
  formData: FormData,
  options: UploadOptions,
): Promise<UploadedImage> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest()
    request.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`)

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
    request.addEventListener('abort', () =>
      reject(new UploadError('Upload cancelled.')),
    )

    options.signal?.addEventListener('abort', () => request.abort())

    request.send(formData)
  })
}

export async function uploadImage(
  file: File,
  options: UploadOptions = {},
): Promise<UploadedImage> {
  if (!CLOUD_NAME) {
    throw new UploadError(
      'VITE_CLOUDINARY_CLOUD_NAME is not set. Add it to .env and restart the dev server.',
    )
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new UploadError('Please choose a JPG, PNG, WebP, AVIF or GIF image.')
  }

  if (file.size > MAX_BYTES) {
    throw new UploadError(
      `That image is ${(file.size / 1024 / 1024).toFixed(1)} MB. The limit is ${MAX_BYTES / 1024 / 1024} MB.`,
    )
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('folder', UPLOAD_FOLDER)

  if (SIGNATURE_URL) {
    const { signature, timestamp, apiKey } = await fetchSignature()
    formData.append('api_key', apiKey)
    formData.append('timestamp', String(timestamp))
    formData.append('signature', signature)
  } else if (UPLOAD_PRESET) {
    formData.append('upload_preset', UPLOAD_PRESET)
  } else {
    throw new UploadError(
      'No upload method configured. Set VITE_CLOUDINARY_UPLOAD_PRESET, or VITE_CLOUDINARY_SIGNATURE_URL for signed uploads.',
    )
  }

  return post(formData, options)
}
