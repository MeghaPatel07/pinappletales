import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Logo } from '@/components/ui/Logo'
import { primaryNav } from '@/config/site'

export default function NotFound() {
  return (
    <section className="bg-paper pt-[clamp(120px,18vh,180px)] pb-24">
      <Container width="narrow">
        <div className="flex flex-col items-center gap-5 text-center">
          <Logo className="h-11" />
          <p className="font-display text-brand-deep" style={{ fontSize: 'clamp(3.5rem, 8vw, 5rem)' }}>
            404
          </p>
          <h1 className="font-display font-medium leading-[1.1]" style={{ fontSize: 'clamp(1.8rem, 3.6vw, 2.6rem)' }}>
            This page has wandered off
          </h1>
          <p className="max-w-[46ch] text-[1.02rem] text-ink-soft">
            The page you were looking for isn’t here. It may have been moved, or the link may have a typo in it.
          </p>

          <div className="mt-2 flex flex-wrap justify-center gap-3">
            <Button to="/" size="lg">
              Back to home <span className="arrow" aria-hidden>→</span>
            </Button>
            <Button to="/contact" variant="secondary" size="lg">
              Get in touch
            </Button>
          </div>

          <nav aria-label="Site pages" className="mt-6">
            <ul className="eyebrow flex flex-wrap justify-center gap-x-5 gap-y-2 text-ink-soft">
              {primaryNav.map((item) => (
                <li key={item.path}>
                  <Link href={item.path} className="footer-link hover:text-ink">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </Container>
    </section>
  )
}
