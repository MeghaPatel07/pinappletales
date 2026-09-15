import { address, contact, primaryNav, site } from '@/config/site'
import { Icon } from '@/components/ui/Icon'
import { Logo } from '@/components/ui/Logo'
import { Container } from '@/components/ui/Container'
import { LetterWave } from './LetterWave'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-ink text-paper">
      <div className="bg-brand text-ink">
        <Container>
          <div className="reveal flex flex-col items-center gap-3 py-8 text-center">
            <Icon name="sparkle" className="sparkle text-ink" />
            <LetterWave
              text="Let's build a brighter tomorrow, one child at a time."
              className="font-display mx-auto max-w-[26ch] font-semibold leading-[1.18] tracking-[-0.01em]"
            />
          </div>
        </Container>
      </div>

      <Container className="grid gap-12 py-16 md:grid-cols-12">
        <div className="md:col-span-4">
          <div className="inline-flex items-center rounded-2xl bg-paper px-4 py-3">
            <Logo alt={`${site.name} by ${site.founder}`} className="h-[52px]" />
          </div>
          <p className="font-display mt-5 text-[1.3rem] font-medium leading-[1.3]">
            Empowering every Parent–Child Mind.
          </p>
          <p className="eyebrow mt-4 text-brand">Personalised · Creative · Meaningful</p>
        </div>

        <div className="md:col-span-4">
          <p className="eyebrow text-paper/60">Explore</p>
          <ul className="mt-4 flex flex-col gap-2.5 text-[0.98rem]">
            {primaryNav.map((item) => (
              <li key={item.path}>
                <a href={item.path} className="footer-link text-paper/90">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-4">
          <p className="eyebrow text-paper/60">Get in touch</p>
          <ul className="mt-4 flex flex-col gap-2.5 text-[0.94rem]">
            <li>
              <a href={`mailto:${contact.email}`} className="footer-link text-paper/90">
                {contact.email}
              </a>
            </li>
            <li>
              <a href={`tel:${contact.phoneE164}`} className="footer-link text-paper/90">
                {contact.phoneDisplay}
              </a>
            </li>
          </ul>
          <p className="mt-6 flex items-start gap-2.5 text-[0.94rem] text-paper/72">
            <Icon name="mapPin" className="mt-0.5 shrink-0" />
            {address.locality} · Online worldwide
          </p>
        </div>
      </Container>

      <div className="border-t border-paper/14">
        <Container className="flex flex-wrap items-center justify-between gap-4 py-6">
          <p className="text-[0.85rem] text-paper/50">
            © {year} {site.legalName}. All rights reserved.
          </p>
          <p className="eyebrow text-paper/50">Offline in Vadodara · Online worldwide</p>
        </Container>
      </div>
    </footer>
  )
}
