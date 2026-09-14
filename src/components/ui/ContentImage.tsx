import { cloudinarySrcSet, cloudinaryUrl } from '@/lib/cloudinary'
import type { CloudinaryImage } from '@/types/content'

type ContentImageProps = {
  image: CloudinaryImage
  /** Rendered width used to pick a transformation. */
  width: number
  height?: number
  crop?: 'fill' | 'fit' | 'limit'
  /** Matches the CSS layout so the browser can pick the right source. */
  sizes?: string
  className?: string
  /** Set on the one image above the fold; everything else stays lazy. */
  priority?: boolean
}

/**
 * A Cloudinary-backed image.
 *
 * Always emits explicit dimensions so the browser reserves the space before the
 * bytes arrive — the single biggest cause of layout shift on a content page —
 * and a srcset so a phone never downloads a desktop-sized file. Format and
 * quality are chosen by Cloudinary per request via f_auto,q_auto.
 */
export function ContentImage({
  image,
  width,
  height,
  crop = 'fill',
  sizes = '(min-width: 60rem) 60rem, 100vw',
  className,
  priority = false,
}: ContentImageProps) {
  // Preserve the original aspect ratio when no explicit height is given.
  const resolvedHeight =
    height ??
    (image.width && image.height
      ? Math.round((width * image.height) / image.width)
      : Math.round(width * 0.5625))

  return (
    <img
      src={cloudinaryUrl(image, { width, height: crop === 'fill' ? resolvedHeight : undefined, crop, gravity: crop === 'fill' ? 'auto' : undefined })}
      srcSet={cloudinarySrcSet(image, { crop: 'limit' })}
      sizes={sizes}
      alt={image.alt}
      width={width}
      height={resolvedHeight}
      className={className}
      loading={priority ? 'eager' : 'lazy'}
      decoding={priority ? 'sync' : 'async'}
      fetchPriority={priority ? 'high' : undefined}
    />
  )
}
