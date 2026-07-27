import { Link } from 'react-router-dom'
import { Container } from '@/components/ui/Container'
import styles from './PageHero.module.css'

type Crumb = { label: string; to?: string }

type PageHeroProps = {
  eyebrow: string
  title: string
  lead: string
  crumbs: readonly Crumb[]
}

/** Consistent masthead for the interior pages. */
export function PageHero({ eyebrow, title, lead, crumbs }: PageHeroProps) {
  return (
    <section className={styles.hero}>
      <Container>
        <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
          <ol className={styles.crumbList}>
            {crumbs.map((crumb, index) => (
              <li key={crumb.label} className={styles.crumb}>
                {crumb.to ? (
                  <Link to={crumb.to} className={styles.crumbLink}>
                    {crumb.label}
                  </Link>
                ) : (
                  <span aria-current="page">{crumb.label}</span>
                )}
                {index < crumbs.length - 1 ? (
                  <span className={styles.separator} aria-hidden="true">
                    /
                  </span>
                ) : null}
              </li>
            ))}
          </ol>
        </nav>

        <p className={styles.eyebrow}>{eyebrow}</p>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.lead}>{lead}</p>
      </Container>
    </section>
  )
}
