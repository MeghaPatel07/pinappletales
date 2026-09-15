import Link from 'next/link'
import { Container } from '@/components/ui/Container'

type Crumb = { label: string; to?: string }

type PageHeroProps = {
  eyebrow: string
  title: string
  lead: string
  crumbs: readonly Crumb[]
}

/** Consistent editorial masthead for the interior pages. */
export function PageHero({ eyebrow, title, lead, crumbs }: PageHeroProps) {
  return (
    <section className="bg-paper pt-[clamp(120px,16vh,168px)] pb-16 md:pb-20">
      <Container>
        <nav aria-label="Breadcrumb" className="eyebrow flex flex-wrap items-center gap-2 text-ink-soft">
          {crumbs.map((crumb, index) => (
            <span key={crumb.label} className="flex items-center gap-2">
              {crumb.to ? (
                <Link href={crumb.to} className="footer-link hover:text-ink">
                  {crumb.label}
                </Link>
              ) : (
                <span aria-current="page" className="text-ink">
                  {crumb.label}
                </span>
              )}
              {index < crumbs.length - 1 ? <span aria-hidden>/</span> : null}
            </span>
          ))}
        </nav>

        <span className="eyebrow mt-6 block text-brand-deep">{eyebrow}</span>
        <h1
          className="font-display mt-4 max-w-[18ch] font-medium leading-[1.04] tracking-[-0.02em] text-ink"
          style={{ fontSize: 'clamp(2.4rem, 5vw, 4rem)' }}
        >
          {title}
        </h1>
        <p className="mt-5 max-w-[54ch] text-[1.08rem] leading-relaxed text-ink-soft">{lead}</p>
      </Container>
    </section>
  )
}
