import styles from './Logo.module.css'
import { site } from '@/config/site'

/** Intrinsic size of public/logo.png — declared to reserve space and avoid CLS. */
const LOGO_WIDTH = 399
const LOGO_HEIGHT = 172

type LogoProps = {
  /**
   * `dark` swaps in the cream-ink artwork for use on the espresso bands.
   * Both files are the same lockup at the same dimensions.
   */
  tone?: 'light' | 'dark'
  /** Longer alt for standalone placements; the default suits a link to home. */
  alt?: string
  /** Header/hero placements load eagerly; decorative ones can defer. */
  loading?: 'eager' | 'lazy'
  className?: string
}

export function Logo({
  tone = 'light',
  alt = `${site.name} by ${site.founder}`,
  loading = 'eager',
  className,
}: LogoProps) {
  return (
    <img
      src={tone === 'dark' ? '/logo-light.png' : '/logo.png'}
      width={LOGO_WIDTH}
      height={LOGO_HEIGHT}
      alt={alt}
      loading={loading}
      decoding="async"
      className={[styles.logo, className].filter(Boolean).join(' ')}
    />
  )
}
