import type { Metadata } from 'next'
import { Icon } from '@/components/ui/Icon'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'
import { JsonLd } from '@/components/JsonLd'
import { approachSteps, philosophy, principles } from '@/data/approach'
import { SITE_URL, site } from '@/config/site'
import { buildMetadata } from '@/seo/nextMetadata'
import {
  breadcrumbSchema,
  buildGraph,
  organisationSchema,
  personSchema,
  webPageSchema,
  websiteSchema,
} from '@/seo/structuredData'

const OG_IMAGE = `${SITE_URL}/og-image.jpg`
const PORTRAIT_IMAGE = '/images/kenaa/kenaa-portrait.jpg'

export const metadata: Metadata = buildMetadata({
  title: 'About Kenaa Jadeja | Child Analyst & Neuro-Art Therapist',
  description:
    'Meet Kenaa Jadeja — Child Analyst, Author, Neuro-Art Therapist and Bibliotherapist. How Pineappletales works with a child’s neuroplastic development through art, story and structured play.',
  canonical: `${SITE_URL}/about`,
  ogType: 'profile',
  ogImage: OG_IMAGE,
  ogImageAlt: `${site.founder} — ${site.founderTitleLine}`,
})

const jsonLd = buildGraph([
  organisationSchema(),
  personSchema(),
  websiteSchema(),
  webPageSchema({
    path: '/about',
    name: `About ${site.founder} — ${site.name}`,
    description: 'The practitioner, the method and the principles behind Pineappletales.',
    type: 'AboutPage',
  }),
  breadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
  ]),
])

function SectionLabel({ index, children, light = false }: { index: string; children: React.ReactNode; light?: boolean }) {
  return (
    <div className={`flex items-center gap-3 ${light ? 'text-paper/72' : 'text-ink-soft'}`}>
      <span className="eyebrow text-brand-deep">{index}</span>
      <span className={`h-px w-8 ${light ? 'bg-paper/30' : 'bg-line'}`} />
      <span className="eyebrow">{children}</span>
    </div>
  )
}

export default function AboutPage() {
  const roles = site.founderTitles

  return (
    <>
      <JsonLd data={jsonLd} />

      {/* Hero ---------------------------------------------------------- */}
      <section className="relative overflow-hidden bg-paper pt-[clamp(120px,16vh,168px)]">
        <Container className="grid items-center gap-12 pb-20 md:grid-cols-12 md:gap-8 md:pb-28">
          <div className="md:col-span-7">
            <div className="reveal is-in">
              <SectionLabel index="—">The practitioner behind Pineappletales</SectionLabel>
            </div>
            <h1
              className="reveal is-in font-display mt-6 font-medium leading-[1.03] tracking-[-0.02em]"
              style={{ fontSize: 'clamp(2.5rem, 5.4vw, 4.2rem)' }}
            >
              The practitioner behind <span className="text-brand-deep">Pineappletales.</span>
            </h1>
            <p className="reveal is-in font-display mt-5 text-[clamp(1.15rem,2vw,1.5rem)] italic leading-[1.3] text-ink-soft">
              Understanding the child before deciding what comes next.
            </p>
            <p className="reveal is-in mt-7 max-w-[52ch] text-[1.08rem] leading-[1.6] text-ink-soft">
              {site.founder} works with children, parents and schools as a{' '}
              {roles.join(', ').replace(/, ([^,]*)$/, ' and $1').toLowerCase()} — bringing together art, story and
              structured play as purposeful tools for development.
            </p>
            <div className="reveal is-in mt-7 flex flex-wrap gap-2.5">
              {roles.map((r) => (
                <span key={r} className="rounded-full border border-line bg-card px-4 py-1.5 text-[0.85rem]">
                  {r}
                </span>
              ))}
            </div>
          </div>

          <div className="reveal is-in md:col-span-5">
            <div className="relative mx-auto" style={{ maxWidth: 420 }}>
              <div
                aria-hidden
                className="anim-spin absolute inset-[-6%] bg-brand opacity-50"
                style={{ borderRadius: '56% 44% 48% 52% / 53% 52% 48% 47%' }}
              />
              <div
                className="img-zoom relative overflow-hidden rounded-card bg-paper-2 shadow-[0_40px_80px_-46px_rgba(36,31,24,0.4)]"
                style={{ aspectRatio: '4 / 5' }}
              >
                <img
                  src={PORTRAIT_IMAGE}
                  alt="Kenaa Jadeja, founder of Pineappletales."
                  className="h-full w-full object-cover"
                  style={{ objectPosition: '50% 18%' }}
                  loading="eager"
                />
              </div>
              <Icon name="sparkle" size={30} className="sparkle absolute text-brand-deep" style={{ top: '-4%', right: '6%' }} />
            </div>
          </div>
        </Container>
      </section>

      {/* Story ----------------------------------------------------------- */}
      <section className="bg-paper-2 py-20 md:py-28">
        <Container className="grid gap-10 md:grid-cols-12 md:gap-12">
          <div className="md:col-span-5">
            <div className="reveal">
              <SectionLabel index="01">Why Pineappletales</SectionLabel>
            </div>
            <h2
              className="reveal font-display mt-6 font-medium leading-[1.06] tracking-[-0.02em]"
              style={{ fontSize: 'clamp(2rem, 3.8vw, 3.2rem)' }}
            >
              Therapy that understands, and then empowers.
            </h2>
            <p className="reveal eyebrow mt-7 inline-flex items-center gap-2 text-ink-soft">
              <span aria-hidden className="h-[7px] w-[7px] rounded-full bg-brand-deep" />
              Vadodara · Offline + Online
            </p>
          </div>

          <div className="md:col-span-7">
            <div className="reveal border-l-2 border-brand pl-7">
              <p className="reveal max-w-[58ch] text-[1.2rem] leading-[1.6] text-ink">
                Pineappletales began with a simple belief: a child’s behaviour is information, not a verdict. Look
                closely, and a moment can tell us how a child learns, what overwhelms them, what helps them settle
                and where their confidence is beginning to grow.
              </p>
              <p className="reveal mt-[22px] max-w-[58ch] text-[1.06rem] leading-[1.6] text-ink-soft">
                That way of reading the child became the starting point for everything that followed — Neuro-Art
                Therapy, Bibliotherapy, creative writing, parent guidance and school programmes.
              </p>
              <p className="reveal mt-[22px] max-w-[58ch] text-[1.06rem] leading-[1.6] text-ink-soft">
                Sessions are offered from the Gotri Road studio in Vadodara and online, allowing families beyond the
                city to work together with the same care and attention.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Method ------------------------------------------------------------ */}
      <section className="bg-ink py-20 text-paper md:py-28">
        <Container>
          <div className="reveal max-w-[52ch]">
            <SectionLabel index="02" light>
              The method
            </SectionLabel>
          </div>
          <h2
            className="reveal font-display mt-6 max-w-[20ch] font-medium leading-[1.04] tracking-[-0.02em]"
            style={{ fontSize: 'clamp(2.1rem, 4.2vw, 3.5rem)' }}
          >
            Working with the architecture of a growing mind.
          </h2>

          <blockquote
            className="reveal font-display mx-auto mt-14 max-w-[24ch] text-center italic leading-[1.22] text-brand"
            style={{ fontSize: 'clamp(1.6rem, 3.4vw, 2.6rem)' }}
          >
            {philosophy.lead}
          </blockquote>

          <div className="mx-auto mt-14 grid max-w-[52rem] gap-6 md:grid-cols-2 md:gap-x-12">
            {philosophy.body.map((p, i) => (
              <p key={i} className="reveal text-[1.05rem] leading-[1.6] text-paper/82">
                {p}
              </p>
            ))}
          </div>

          <div className="reveal mx-auto mt-14 max-w-[52rem]">
            <span className="block h-0.5 w-full bg-brand" />
            <p className="font-display mt-6 font-medium leading-[1.3]" style={{ fontSize: 'clamp(1.3rem, 2.4vw, 1.8rem)' }}>
              {philosophy.close}
            </p>
          </div>
        </Container>
      </section>

      {/* Process ------------------------------------------------------------ */}
      <section className="bg-paper py-20 md:py-28">
        <Container>
          <div className="reveal max-w-[46ch]">
            <SectionLabel index="03">The process</SectionLabel>
            <h2
              className="font-display mt-6 font-medium leading-[1.05] tracking-[-0.02em]"
              style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)' }}
            >
              From first conversation to a routine that holds.
            </h2>
            <p className="mt-5 text-[1.06rem] text-ink-soft">
              Each stage produces something useful — an understanding, a session plan, a practice you can continue
              at home.
            </p>
          </div>

          <ol className="mt-14 ml-2 border-l-2 border-line">
            {approachSteps.map((p) => (
              <li key={p.index} className="reveal relative grid gap-4 pb-12 pl-8 last:pb-0 md:grid-cols-[auto_1fr] md:gap-10 md:pl-12">
                <span aria-hidden className="absolute left-[-9px] top-1 h-4 w-4 rounded-full border-2 border-brand-deep bg-brand" />
                <span
                  className="font-display font-medium leading-[0.9] text-brand-deep"
                  style={{ fontSize: 'clamp(2.2rem, 4vw, 3.4rem)' }}
                >
                  {p.index}
                </span>
                <div className="max-w-[56ch]">
                  <h3
                    className="font-display font-semibold leading-[1.15] tracking-[-0.01em]"
                    style={{ fontSize: 'clamp(1.35rem, 2.3vw, 1.85rem)' }}
                  >
                    {p.title}
                  </h3>
                  <p className="mt-2.5 text-[1.02rem] leading-[1.6] text-ink-soft">{p.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* Philosophy / principles --------------------------------------------- */}
      <section className="bg-card py-20 md:py-28">
        <Container>
          <div className="reveal max-w-[46ch]">
            <SectionLabel index="04">What guides the work</SectionLabel>
            <h2
              className="font-display mt-6 font-medium leading-[1.05] tracking-[-0.02em]"
              style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)' }}
            >
              Personalised. <span className="text-brand-deep">Creative.</span> Meaningful.
            </h2>
          </div>

          <div className="reveal mt-12 grid gap-px overflow-hidden rounded-card bg-line md:grid-cols-3">
            {principles.map((p, i) => (
              <div key={p.title} className="about-principle group bg-paper px-7 py-9 transition-colors duration-300 ease-[var(--ease-organic)]">
                <span className="font-mono-label text-[0.78rem] text-brand-deep">0{i + 1}</span>
                <h3
                  className="about-principle-word font-display mt-3 font-semibold leading-[1.1] tracking-[-0.01em]"
                  style={{ fontSize: 'clamp(1.6rem, 2.6vw, 2.1rem)' }}
                >
                  {p.title}
                </h3>
                <span className="about-principle-rule mt-2.5 block h-0.5 w-0 bg-brand transition-[width] duration-[360ms] ease-[var(--ease-organic)]" />
                <p className="mt-4 max-w-[34ch] text-[1.02rem] leading-[1.55] text-ink-soft">{p.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA ------------------------------------------------------------------ */}
      <section className="bg-brand py-16 text-ink md:py-20">
        <Container>
          <div className="reveal mx-auto max-w-[46ch] text-center">
            <span className="eyebrow">Let’s begin</span>
            <h2
              className="font-display mt-4 font-medium leading-[1.04] tracking-[-0.02em]"
              style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
            >
              Let’s begin with your child’s story.
            </h2>
            <p className="mx-auto mt-4 max-w-[42ch] text-[1.04rem]" style={{ color: '#4a3f22' }}>
              Tell us a little about your child, and we’ll find a thoughtful way to begin — in Vadodara or online.
            </p>
            <div className="mt-7 flex justify-center">
              <Button to="/contact" variant="dark" size="lg">
                Book a Session <span className="arrow" aria-hidden>→</span>
              </Button>
            </div>
            <p className="eyebrow mt-6" style={{ color: '#4a3f22' }}>
              Offline sessions in Vadodara · Online sessions worldwide
            </p>
          </div>
        </Container>
      </section>
    </>
  )
}
