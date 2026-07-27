import { Logo } from '@/components/ui/Logo'
import { site } from '@/config/site'
import styles from './BrandCollage.module.css'

/**
 * An abstract composition built from the studio poster's own vocabulary —
 * concentric arcs, ruled lines, primary discs and the pineapple mark. Used in
 * place of stock photography so the hero stays on-brand and weightless.
 */
export function BrandCollage() {
  return (
    <div className={styles.collage}>
      <svg
        viewBox="0 0 420 460"
        className={styles.canvas}
        aria-hidden="true"
        focusable="false"
      >
        {/* Concentric arcs */}
        <g
          fill="none"
          stroke="var(--ink-900)"
          strokeWidth="1.6"
          opacity="0.5"
        >
          <path d="M40 176V126a34 34 0 0 1 68 0v50" />
          <path d="M54 176v-50a20 20 0 0 1 40 0v50" />
          <path d="M68 176v-50a6 6 0 0 1 12 0v50" />
        </g>

        {/* Ruled field */}
        <g stroke="var(--ink-900)" strokeWidth="1.2" opacity="0.34">
          {Array.from({ length: 16 }, (_, index) => (
            <line
              key={index}
              x1={128 + index * 8}
              y1="66"
              x2={128 + index * 8}
              y2="196"
            />
          ))}
        </g>

        {/* Primary discs */}
        <circle cx="176" cy="86" r="34" fill="var(--accent-leaf)" opacity="0.9" />
        <circle cx="286" cy="132" r="46" fill="var(--accent-indigo)" opacity="0.9" />
        <circle cx="72" cy="204" r="22" fill="var(--accent-coral)" opacity="0.9" />

        {/* Brand quarter-circle, as on the printed card corner */}
        <path d="M420 336a84 84 0 0 0-84 84h84Z" fill="var(--brand-500)" />
        <circle cx="356" cy="46" r="7" fill="var(--brand-500)" />
        <circle cx="386" cy="72" r="4" fill="var(--brand-400)" />
      </svg>

      <div className={styles.markPanel}>
        <Logo
          alt={`${site.name} by ${site.founder} — ${site.founderTitleLine}`}
          className={styles.mark}
        />
        <p className={styles.strapline}>
          Nurturing minds,
          <span className={styles.accentWord}> inspiring growth</span>
        </p>
      </div>
    </div>
  )
}
