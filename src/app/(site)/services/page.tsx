import type { Metadata } from 'next'
import { Container } from '@/components/ui/Container'
import { TickList } from '@/components/ui/TickList'
import { Accordion } from '@/components/ui/Accordion'
import { Icon } from '@/components/ui/Icon'
import { CtaBanner } from '@/components/sections/CtaBanner'
import { PageHero } from '@/components/sections/PageHero'
import { JsonLd } from '@/components/JsonLd'
import { audiences } from '@/data/audiences'
import { faqs } from '@/data/faqs'
import { services } from '@/data/services'
import { SITE_URL, site } from '@/config/site'
import { buildMetadata } from '@/seo/nextMetadata'
import {
  breadcrumbSchema,
  buildGraph,
  faqSchema,
  organisationSchema,
  personSchema,
  servicesListSchema,
  webPageSchema,
  websiteSchema,
} from '@/seo/structuredData'

const OG_IMAGE = `${SITE_URL}/og-image.jpg`

export const metadata: Metadata = buildMetadata({
  title: 'Services | Neuro-Art Therapy, Bibliotherapy & Workshops',
  description:
    'Child behaviour analysis, Neuro-Art Therapy, Bibliotherapy, emotional and social skills support, creative writing workshops and personalised home plans — for children, parents, schools and NGOs.',
  canonical: `${SITE_URL}/services`,
  ogType: 'website',
  ogImage: OG_IMAGE,
  ogImageAlt: `Services at ${site.name}`,
})

const jsonLd = buildGraph([
  organisationSchema(),
  personSchema(),
  websiteSchema(),
  webPageSchema({
    path: '/services',
    name: `Services — ${site.name}`,
    description: 'Therapeutic and creative programmes for children, parents and educational organisations.',
    type: 'CollectionPage',
  }),
  servicesListSchema(),
  faqSchema(),
  breadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
  ]),
])

const ACCENT_TEXT: Record<string, string> = {
  brand: 'text-brand-deep',
  leaf: 'text-teal',
  coral: 'text-coral',
  indigo: 'text-teal-soft',
}

const ACCENT_BG: Record<string, string> = {
  brand: 'bg-brand/15',
  leaf: 'bg-teal/10',
  coral: 'bg-coral/10',
  indigo: 'bg-teal-soft/10',
}

const ACCENT_BORDER_T: Record<string, string> = {
  brand: 'border-t-brand-deep',
  leaf: 'border-t-teal',
  coral: 'border-t-coral',
  indigo: 'border-t-teal-soft',
}

function SectionLabel({ index, children }: { index: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 text-ink-soft">
      <span className="eyebrow text-brand-deep">{index}</span>
      <span className="h-px w-8 bg-line" />
      <span className="eyebrow">{children}</span>
    </div>
  )
}

function DetailToggle({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <details className="group mt-4">
      <summary className="eyebrow flex cursor-pointer list-none items-center gap-2 text-ink-soft transition-colors duration-200 hover:text-ink">
        {label}
        <Icon
          name="plus"
          size={13}
          className="shrink-0 transition-transform duration-300 group-open:rotate-45"
        />
      </summary>
      <div className="mt-3">{children}</div>
    </details>
  )
}

export default function ServicesPage() {
  return (
    <>
      <JsonLd data={jsonLd} />
      <PageHero
        eyebrow="Services"
        title="What we offer at Pineappletales"
        lead="One method, six ways in — for the child in the room, the parent at home, or a hall full of students."
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Services' }]}
      />

      {/* Who it's for ------------------------------------------------------ */}
      <section className="bg-paper py-16 md:py-20" aria-labelledby="audiences-title">
        <Container>
          <div className="reveal">
            <SectionLabel index="01">Who it’s for</SectionLabel>
            <h2
              id="audiences-title"
              className="font-display mt-4 max-w-[26ch] font-medium leading-[1.08] tracking-[-0.02em]"
              style={{ fontSize: 'clamp(1.9rem, 3.6vw, 2.9rem)' }}
            >
              Shaped around the person receiving it
            </h2>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {audiences.map((audience, index) => (
              <article
                key={audience.id}
                id={audience.id}
                className={`reveal lift scroll-mt-28 rounded-card border border-t-[3px] border-line bg-card p-6 ${ACCENT_BORDER_T[audience.accent] ?? 'border-t-brand-deep'}`}
                style={{ transitionDelay: `${index * 90}ms` }}
              >
                <span className={`eyebrow ${ACCENT_TEXT[audience.accent] ?? 'text-brand-deep'}`}>{audience.eyebrow}</span>
                <h3 className="font-display mt-2 text-[1.2rem] font-semibold leading-[1.22]">{audience.title}</h3>
                <p className="mt-2 text-[0.95rem] text-ink-soft">{audience.intro}</p>

                <DetailToggle label="What’s included">
                  <TickList items={audience.offerings} size="compact" />
                </DetailToggle>
              </article>
            ))}
          </div>
        </Container>
      </section>

      {/* Core services ------------------------------------------------------ */}
      <section id="core-services" className="bg-paper-2 py-16 md:py-20" aria-labelledby="core-title">
        <Container>
          <div className="reveal flex flex-wrap items-end justify-between gap-6">
            <div>
              <SectionLabel index="02">Core services</SectionLabel>
              <h2
                id="core-title"
                className="font-display mt-4 max-w-[18ch] font-medium leading-[1.08] tracking-[-0.02em]"
                style={{ fontSize: 'clamp(1.9rem, 3.6vw, 2.9rem)' }}
              >
                Six ways in
              </h2>
            </div>
            <Icon name="sparkle" size={38} className="anim-spin hidden text-brand-deep sm:block" />
          </div>
          <p className="reveal mt-4 max-w-[56ch] text-[1.02rem] text-ink-soft">
            Every engagement starts with understanding the child. What follows is chosen from these six, alone or in combination.
          </p>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service, index) => (
              <article
                key={service.id}
                id={service.id}
                className="reveal lift relative scroll-mt-28 overflow-hidden rounded-card border border-line bg-paper p-6"
                style={{ transitionDelay: `${(index % 3) * 90}ms` }}
              >
                <span
                  aria-hidden
                  className={`font-display pointer-events-none absolute -right-2 -top-5 text-[5.5rem] font-semibold leading-none opacity-[0.07] ${ACCENT_TEXT[service.accent] ?? 'text-brand-deep'}`}
                >
                  {String(index + 1).padStart(2, '0')}
                </span>

                <span
                  className={`eyebrow relative inline-flex rounded-full px-3 py-1 ${ACCENT_BG[service.accent] ?? 'bg-brand/15'} ${ACCENT_TEXT[service.accent] ?? 'text-brand-deep'}`}
                >
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="font-display relative mt-4 text-[1.15rem] font-semibold leading-[1.28]">{service.title}</h3>
                <p className="relative mt-2 text-[0.94rem] leading-relaxed text-ink-soft">{service.summary}</p>
                <p className="eyebrow relative mt-4 text-ink-soft/70">Best for — {service.bestFor}</p>

                <div className="relative">
                  <DetailToggle label="What’s included">
                    <TickList items={service.includes} size="compact" />
                    <div className="mt-3 flex flex-wrap gap-2">
                      {service.formats.map((format) => (
                        <span key={format} className="rounded-full border border-line bg-card px-3 py-1 text-[0.78rem]">
                          {format}
                        </span>
                      ))}
                    </div>
                  </DetailToggle>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>

      {/* FAQs ----------------------------------------------------------------- */}
      <section id="faqs" className="reveal bg-paper py-16 md:py-20" aria-labelledby="faq-title">
        <Container width="narrow">
          <div className="text-center">
            <SectionLabel index="03">Questions</SectionLabel>
          </div>
          <h2
            id="faq-title"
            className="font-display mx-auto mt-4 max-w-[16ch] text-center font-medium leading-[1.08] tracking-[-0.02em]"
            style={{ fontSize: 'clamp(1.9rem, 3.6vw, 2.9rem)' }}
          >
            Frequently asked
          </h2>
          <div className="mt-10">
            <Accordion items={faqs} />
          </div>
        </Container>
      </section>

      <CtaBanner
        title="Not sure which of these your child needs?"
        body="That is exactly what the first conversation is for. Share your child’s age and what you’d like support with, and you’ll get a recommended starting point."
        primaryLabel="Start with a conversation"
      />
    </>
  )
}
