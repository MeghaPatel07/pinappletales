'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Icon } from '@/components/ui/Icon'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'
import { approachSteps } from '@/data/approach'
import { services } from '@/data/services'
import { contact } from '@/config/site'
import { cloudinaryUrl } from '@/lib/cloudinary'
import { formatDate } from '@/lib/date'
import type { EventItem, Testimonial } from '@/types/content'

/** Real Pineappletales session and studio photography — see public/images. */
const IMAGES = {
  gardenWorkshop: '/images/community/garden-workshop.jpg',
  creativePouches: '/images/sessions/creative-pouches.jpg',
  inclusiveBags: '/images/community/inclusive-bags.jpg',
  kenaaWithKids: '/images/kenaa/kenaa-with-kids.jpg',
  kenaaGroupWide: '/images/kenaa/kenaa-group-wide.jpg',
  neuroArtMural: '/images/sessions/neuro-art-mural.jpg',
  bibliotherapyCircle: '/images/sessions/bibliotherapy-circle.jpg',
  paintedPlants: '/images/sessions/painted-plants.jpg',
}

/** One real photo per service, in the same order as data/services.ts. */
const SERVICE_IMAGES = [
  IMAGES.kenaaGroupWide,
  IMAGES.neuroArtMural,
  IMAGES.bibliotherapyCircle,
  IMAGES.inclusiveBags,
  IMAGES.creativePouches,
  IMAGES.paintedPlants,
]

const TRUST = [
  { t: 'Led by Kenaa Jadeja', d: 'Child Analyst, Author, Neuro-Art Therapist and Bibliotherapist.' },
  { t: 'A transparent approach', d: 'Understand the child, design the session, work through art and story, extend it home.' },
  { t: 'Personalised, never templated', d: 'Plans are built around your child’s neuro-development — not a fixed programme.' },
  { t: 'Offline & online', d: 'Sessions in Vadodara, and online for families worldwide.' },
]

function SectionLabel({ index, children, light = false }: { index: string; children: React.ReactNode; light?: boolean }) {
  return (
    <div className={`flex items-center gap-3 ${light ? 'text-paper/72' : 'text-ink-soft'}`}>
      <span className="eyebrow text-brand-deep">{index}</span>
      <span className={`h-px w-8 ${light ? 'bg-paper/30' : 'bg-line'}`} />
      <span className="eyebrow">{children}</span>
    </div>
  )
}

/* ------------------------- hero ------------------------- */
const HERO_SLIDES = [
  {
    image: IMAGES.gardenWorkshop,
    focal: '68% 52%',
    alt: 'Children working on a craft project together at an outdoor Pineappletales workshop.',
    eyebrow: 'Personalised · Creative · Meaningful',
    title: (
      <>
        Empowering every <span className="relative whitespace-nowrap italic">Parent–Child</span> Mind.
      </>
    ),
    copy: 'Neuro-Art Therapy, Bibliotherapy and creative writing workshops that work with a child’s developing brain — not against it. Led by Kenaa Jadeja in Vadodara, offline and online.',
    ctas: [
      { label: 'Book a Session', href: '/contact', primary: true },
      { label: 'Explore services', href: '/services', primary: false },
    ],
  },
  {
    image: IMAGES.creativePouches,
    focal: '62% 38%',
    alt: 'Children painting affirmation cards and fabric pouches with acrylic markers.',
    eyebrow: 'Art + story + structured play',
    title: (
      <>
        Personalised. <span className="italic">Creative.</span> Meaningful.
      </>
    ),
    copy: 'An approach built on art + story + structured play — designed around each child’s developing brain.',
    ctas: [
      { label: 'Explore services', href: '/services', primary: true },
      { label: 'Book a Session', href: '/contact', primary: false },
    ],
  },
  {
    image: IMAGES.inclusiveBags,
    focal: '70% 42%',
    alt: 'A group of young people showing the jute bags they hand-painted in a Pineappletales workshop.',
    eyebrow: 'Every child has a story',
    title: <>We help it unfold.</>,
    copy: 'Working with children and their parents through art, story and structured play — offline in Vadodara and online.',
    ctas: [
      { label: 'Book a Session', href: '/contact', primary: true },
      { label: 'Meet Kenaa', href: '#kenaa', primary: false },
    ],
  },
]

function Hero() {
  const [active, setActive] = useState(0)
  const count = HERO_SLIDES.length

  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduce) return
    const id = window.setInterval(() => setActive((a) => (a + 1) % count), 6000)
    return () => window.clearInterval(id)
  }, [count])

  const go = (dir: number) => setActive((a) => (a + dir + count) % count)

  return (
    <section
      id="top"
      className="relative overflow-hidden"
      aria-roledescription="carousel"
      aria-label="Pineappletales introduction"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') go(-1)
        if (e.key === 'ArrowRight') go(1)
      }}
      style={{ minHeight: 'clamp(560px, 88vh, 760px)' }}
    >
      {HERO_SLIDES.map((s, i) => (
        <div
          key={i}
          aria-hidden={i !== active}
          className="absolute inset-0 transition-opacity duration-[900ms] ease-[var(--ease-organic)]"
          style={{ opacity: i === active ? 1 : 0, zIndex: i === active ? 1 : 0 }}
        >
          <img
            src={s.image}
            alt={i === active ? s.alt : ''}
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: s.focal }}
            loading={i === 0 ? 'eager' : 'lazy'}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(100deg, rgba(28,22,15,0.78) 0%, rgba(28,22,15,0.5) 42%, rgba(28,22,15,0.12) 72%, rgba(28,22,15,0) 100%)',
            }}
          />
        </div>
      ))}

      <div
        aria-hidden
        className="anim-spin pointer-events-none absolute z-[2] h-[190px] w-[190px] bg-brand opacity-50"
        style={{ top: '14%', right: '7%', borderRadius: '58% 42% 46% 54% / 55% 52% 48% 45%' }}
      />

      <div className="container-1200 relative z-[3] flex items-center" style={{ minHeight: 'clamp(560px, 88vh, 760px)' }}>
        <div className="max-w-[42rem] py-28 text-paper md:py-32">
          {HERO_SLIDES.map((s, i) => (
            <div key={i} className={i === active ? 'block' : 'hidden'}>
              <span className="eyebrow text-paper/86">{s.eyebrow}</span>
              <h1
                className="font-display mt-5 font-medium leading-[1.03] tracking-[-0.02em]"
                style={{ fontSize: 'clamp(2.6rem, 5.6vw, 4.4rem)' }}
              >
                {s.title}
              </h1>
              <p className="mt-6 max-w-[40ch] text-[1.1rem] leading-[1.65] text-paper/90">{s.copy}</p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                {s.ctas.map((c) =>
                  c.primary ? (
                    <Button key={c.label} to={c.href} variant="primary" size="lg">
                      {c.label} <span className="arrow" aria-hidden>→</span>
                    </Button>
                  ) : (
                    <Button key={c.label} to={c.href} variant="onDark" size="lg">
                      {c.label}
                    </Button>
                  ),
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="container-1200 pointer-events-none absolute inset-x-0 bottom-8 z-[4]">
        <div className="pointer-events-auto flex items-center gap-3">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === active}
              className="h-[9px] rounded-full transition-all duration-[400ms] ease-[var(--ease-organic)]"
              style={{ width: i === active ? 26 : 9, background: i === active ? 'var(--brand)' : 'rgba(251,247,239,0.5)' }}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

/* ------------------------- Kenaa ------------------------- */
function Kenaa() {
  const roles = ['Child Analyst', 'Author', 'Neuro-Art Therapist', 'Bibliotherapist']
  return (
    <section id="kenaa" className="bg-paper-2 py-20 md:py-28">
      <Container className="grid items-center gap-12 md:grid-cols-12">
        <div className="reveal md:col-span-5">
          <div className="relative">
            <div
              aria-hidden
              className="anim-spin absolute inset-[-5%] bg-brand opacity-55"
              style={{ borderRadius: '54% 46% 48% 52% / 52% 54% 46% 48%' }}
            />
            <div className="img-zoom relative overflow-hidden rounded-card bg-paper" style={{ aspectRatio: '4 / 5' }}>
              <img
                src={IMAGES.kenaaWithKids}
                alt="Kenaa Jadeja with a group of children at Pineappletales."
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </div>

        <div className="reveal md:col-span-7">
          <SectionLabel index="06">The person behind the practice</SectionLabel>
          <h2 className="font-display mt-6 font-medium leading-[1.05] tracking-[-0.02em]" style={{ fontSize: 'clamp(2.1rem, 4vw, 3.4rem)' }}>
            Meet Kenaa Jadeja.
          </h2>
          <div className="mt-6 flex flex-wrap gap-2.5">
            {roles.map((r) => (
              <span key={r} className="lift rounded-full border border-line bg-card px-4 py-1.5 text-[0.85rem]">
                {r}
              </span>
            ))}
          </div>
          <figure className="mt-8">
            <blockquote className="font-display max-w-[46ch] text-[1.5rem] italic leading-[1.35]">
              <span aria-hidden className="text-brand-deep">“</span>
              A child’s behaviour is information, not a verdict.
              <span aria-hidden className="text-brand-deep">”</span>
            </blockquote>
          </figure>
          <p className="mt-6 max-w-[52ch] text-[1.06rem] text-ink-soft">
            Kenaa Jadeja leads Pineappletales from Vadodara, working with children and their parents through art, story and structured play — offline and online.
          </p>
          <div className="mt-8">
            <Link href="/about" className="btn arrow-move inline-flex items-center gap-2 rounded-full border border-[1.5px] border-ink px-6 py-3 text-[0.95rem] font-medium text-ink hover:bg-ink/5">
              More about Kenaa <span className="arrow" aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </Container>
    </section>
  )
}

/* ------------------------- philosophy (roadmap) ------------------------- */
function Philosophy() {
  const [active, setActive] = useState<number | null>(null)
  return (
    <section className="bg-paper py-20 md:py-28">
      <Container>
        <div className="reveal grid gap-8 md:grid-cols-12 md:items-end">
          <div className="md:col-span-8">
            <SectionLabel index="07">What is Pineappletales?</SectionLabel>
            <h2 className="font-display mt-6 font-medium leading-[1.02] tracking-[-0.02em]" style={{ fontSize: 'clamp(2.2rem, 5vw, 3.9rem)' }}>
              Personalised. <span className="text-brand-deep">Creative.</span> Meaningful.
            </h2>
          </div>
          <div className="md:col-span-4">
            <p className="text-[1.06rem] text-ink-soft">
              An approach built on <strong className="text-ink">art + story + structured play</strong> — designed around each child’s developing brain.
            </p>
          </div>
        </div>

        {/* desktop: one continuous dotted journey */}
        <div className="reveal relative mt-16 hidden md:block">
          <div className="relative" style={{ height: 60 }}>
            <svg aria-hidden className="absolute inset-x-0 top-0 z-0" viewBox="0 0 1000 60" preserveAspectRatio="none" style={{ height: 60 }}>
              <line x1="125" y1="30" x2="875" y2="30" stroke="var(--brand-deep)" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="0.5 7" />
            </svg>

            {approachSteps.map((p, i) => (
              <span
                key={p.index}
                className="road-node absolute z-[1] grid place-items-center rounded-full border-2 border-brand-deep"
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => setActive(null)}
                style={{
                  left: `${12.5 + i * 25}%`,
                  top: 30,
                  transform: `translate(-50%, -50%) scale(${active === i ? 1.04 : 1})`,
                  width: 52,
                  height: 52,
                  background: active === i ? 'var(--brand)' : 'var(--card)',
                }}
              >
                <span className="font-mono-label text-[0.85rem] font-medium text-ink">{p.index}</span>
              </span>
            ))}
          </div>

          <ol className="mt-6 grid grid-cols-4 gap-5">
            {approachSteps.map((p, i) => (
              <li
                key={p.index}
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => setActive(null)}
                className="text-center transition-opacity duration-300"
                style={{ opacity: active === null || active === i ? 1 : 0.6 }}
              >
                <h3 className="font-display mx-auto max-w-[20ch] text-[1.24rem] font-semibold leading-[1.14]">{p.title}</h3>
                <p className="mx-auto mt-2.5 max-w-[26ch] text-[0.92rem] leading-[1.45] text-ink-soft">{p.body}</p>
              </li>
            ))}
          </ol>
        </div>

        {/* mobile: vertical journey */}
        <ol className="reveal mt-10 border-l-2 border-dashed border-brand-deep pl-0 md:hidden" style={{ marginLeft: 26 }}>
          {approachSteps.map((p) => (
            <li key={p.index} className="relative pb-9 pl-8 last:pb-0">
              <span
                className="absolute grid place-items-center rounded-full border-2 border-brand-deep bg-card"
                style={{ left: -27, top: 0, width: 50, height: 50 }}
              >
                <span className="font-mono-label text-[0.82rem] text-ink">{p.index}</span>
              </span>
              <h3 className="font-display text-[1.24rem] font-semibold leading-[1.15]">{p.title}</h3>
              <p className="mt-2 text-[0.95rem] text-ink-soft">{p.body}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  )
}

/* ------------------------- services ------------------------- */
function ServicesSection() {
  const [active, setActive] = useState<number | null>(null)
  const shown = active ?? 0

  return (
    <section id="services" className="bg-paper py-20 md:py-24">
      <Container>
        <div className="reveal grid gap-4 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <SectionLabel index="08">What I offer</SectionLabel>
            <h2 className="font-display mt-5 font-medium leading-[1.04] tracking-[-0.02em]" style={{ fontSize: 'clamp(2rem, 4vw, 3.3rem)' }}>
              Six ways of working with a child.
            </h2>
          </div>
          <div className="md:col-span-5 md:pb-1.5">
            <p className="text-[1.02rem] leading-[1.5] text-ink-soft">
              Each service begins with understanding — never a template. A quick map of the practice; the full detail lives on the Services page.
            </p>
          </div>
        </div>

        <div
          className="reveal mt-8 overflow-hidden md:hidden"
          style={{ height: 150, borderRadius: 'var(--radius)', maskImage: 'linear-gradient(to bottom, #000 68%, transparent)' }}
        >
          <img src={SERVICE_IMAGES[0]} alt="A Pineappletales creative session." className="h-full w-full object-cover" style={{ objectPosition: '50% 35%' }} loading="lazy" />
        </div>

        <div className="reveal mt-8 grid items-center gap-10 md:mt-14 md:grid-cols-12 md:gap-8">
          <ol className="relative md:col-span-7">
            <span
              aria-hidden
              className="absolute hidden md:block"
              style={{
                left: 7,
                top: 18,
                bottom: 18,
                width: 2,
                background: 'repeating-linear-gradient(to bottom, var(--brand) 0 3px, transparent 3px 9px)',
                opacity: 0.65,
              }}
            />
            {services.map((s, i) => {
              const on = active === i
              return (
                <li key={s.id} className="relative">
                  <Link
                    href={`/services#${s.id}`}
                    className="group flex items-start gap-4 py-3.5 transition-transform duration-300 ease-[var(--ease-organic)] md:gap-6 md:pl-7"
                    style={{ transform: on ? 'translateX(6px)' : 'none' }}
                    onMouseEnter={() => setActive(i)}
                    onMouseLeave={() => setActive(null)}
                    onFocus={() => setActive(i)}
                    onBlur={() => setActive(null)}
                  >
                    <span
                      aria-hidden
                      className="absolute hidden rounded-full transition-all duration-300 ease-[var(--ease-organic)] md:block"
                      style={{
                        left: 3,
                        top: 22,
                        width: 10,
                        height: 10,
                        background: on ? 'var(--brand)' : 'var(--paper)',
                        border: `2px solid ${on ? 'var(--brand-deep)' : 'var(--line)'}`,
                        zIndex: 1,
                      }}
                    />
                    <span
                      className="font-mono-label shrink-0 pt-0.5 text-[0.82rem] transition-colors duration-300 ease-[var(--ease-organic)]"
                      style={{ color: on ? 'var(--brand-deep)' : 'var(--ink-soft)', width: 22 }}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span
                          className="font-display leading-[1.15] tracking-[-0.01em] text-ink transition-[font-weight,color] duration-200"
                          style={{ fontSize: 'clamp(1.2rem, 2vw, 1.55rem)', fontWeight: on ? 600 : 500 }}
                        >
                          {s.title}
                        </span>
                        <span
                          className="font-display transition-all duration-300 ease-[var(--ease-organic)]"
                          aria-hidden
                          style={{ color: 'var(--brand-deep)', fontSize: '1.05rem', opacity: on ? 1 : 0, transform: on ? 'translateX(0)' : 'translateX(-6px)' }}
                        >
                          →
                        </span>
                      </span>
                      <span className="mt-0.5 block text-[0.92rem] leading-[1.4] text-ink-soft">{s.summary}</span>
                    </span>
                  </Link>
                </li>
              )
            })}
          </ol>

          <div className="hidden md:col-span-5 md:block">
            <div className="relative mx-auto" style={{ maxWidth: 420 }}>
              <div
                aria-hidden
                className="anim-spin absolute bg-brand opacity-30"
                style={{ inset: '-7% -5% -5% -7%', borderRadius: '56% 44% 47% 53% / 54% 51% 49% 46%' }}
              />
              <div
                className="relative overflow-hidden"
                style={{
                  aspectRatio: '4 / 5',
                  borderRadius: '46% 54% 50% 50% / 54% 50% 50% 46%',
                  maskImage: 'radial-gradient(130% 120% at 50% 40%, #000 62%, transparent 100%)',
                }}
              >
                {services.map((s, i) => (
                  <img
                    key={s.id}
                    src={SERVICE_IMAGES[i]}
                    alt={i === shown ? `${s.title} — a Pineappletales creative session.` : ''}
                    aria-hidden={i !== shown}
                    className="absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-500 ease-[var(--ease-organic)]"
                    style={{
                      opacity: i === shown ? (active === null ? 0.82 : 1) : 0,
                      transform: active === i ? 'scale(1.03) translateY(-6px)' : 'scale(1)',
                    }}
                    loading="lazy"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="reveal mt-10">
          <Button to="/services" variant="primary" size="md">
            Explore services <span className="arrow" aria-hidden>→</span>
          </Button>
        </div>
      </Container>
    </section>
  )
}

/* ------------------------- trust roadmap ------------------------- */
function Trust() {
  const [active, setActive] = useState<number | null>(null)
  return (
    <section className="bg-paper py-20 md:py-28">
      <Container>
        <div className="reveal max-w-[46ch]">
          <SectionLabel index="12">Why parents trust Pineappletales</SectionLabel>
          <h2 className="font-display mt-6 font-medium leading-[1.08] tracking-[-0.02em]" style={{ fontSize: 'clamp(2rem, 4vw, 3.1rem)' }}>
            Calm, clear and built on understanding.
          </h2>
        </div>

        <div className="reveal relative mt-16">
          <svg aria-hidden className="absolute left-0 top-0 z-0 hidden w-full md:block" viewBox="0 0 1000 64" preserveAspectRatio="none" style={{ height: 64 }}>
            <path
              className="road-line"
              pathLength={1}
              d="M125,32 C 220,10 280,10 375,32 S 530,54 625,32 S 780,10 875,32"
              fill="none"
              stroke="var(--brand-deep)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray="1 0.02"
            />
          </svg>

          <ol className="relative z-[1] grid gap-8 md:grid-cols-4">
            {TRUST.map((s, i) => (
              <li
                key={s.t}
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => setActive(null)}
                className="transition-opacity duration-300"
                style={{ opacity: active === null || active === i ? 1 : 0.55 }}
              >
                <div className="flex items-center justify-center" style={{ height: 64 }}>
                  <span
                    className="road-node grid place-items-center rounded-full border-2 border-brand-deep font-semibold"
                    style={{ width: 46, height: 46, background: active === i ? 'var(--brand)' : 'var(--paper-2)', transform: active === i ? 'scale(1.08)' : 'none' }}
                  >
                    <span className="font-mono-label text-[0.85rem] text-ink">0{i + 1}</span>
                  </span>
                </div>
                <h3 className="font-display mt-4 text-center text-[1.28rem] font-semibold leading-[1.15]">{s.t}</h3>
                <p className="mt-3 text-center text-[0.98rem] text-ink-soft">{s.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  )
}

/* ------------------------- testimonials ------------------------- */
function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  const [index, setIndex] = useState(0)
  const trackRef = useRef<HTMLDivElement | null>(null)

  if (testimonials.length === 0) return null

  const onScroll = () => {
    const el = trackRef.current
    if (!el) return
    const card = el.scrollWidth / testimonials.length
    setIndex(Math.round(el.scrollLeft / card))
  }
  const go = (i: number) => {
    const el = trackRef.current
    if (!el) return
    const card = el.scrollWidth / testimonials.length
    el.scrollTo({ left: card * i, behavior: 'smooth' })
  }

  return (
    <section className="bg-paper-2 py-20 md:py-24">
      <Container>
        <div className="reveal flex flex-wrap items-center justify-between gap-4">
          <SectionLabel index="13">In parents’ words</SectionLabel>
        </div>

        <div
          ref={trackRef}
          onScroll={onScroll}
          className="reveal [scrollbar-width:none] mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2 md:grid md:grid-cols-3 md:overflow-visible"
        >
          {testimonials.map((t) => (
            <figure key={t.id} className="lift flex min-w-[85%] shrink-0 snap-center flex-col rounded-card border border-line bg-card p-8 md:min-w-0">
              <span aria-hidden className="font-display text-[46px] leading-[0.5] text-brand-deep">“</span>
              <blockquote className="font-display mt-4 flex-1 text-[1.24rem] font-medium leading-[1.4]">{t.testimonial}</blockquote>
              <figcaption className="mt-6 text-[0.9rem] text-ink-soft">
                — {t.name}
                {t.designation ? `, ${t.designation}` : ''}
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="mt-6 flex justify-center gap-2 md:hidden" role="tablist" aria-label="Testimonials">
          {testimonials.map((t, i) => (
            <button
              key={t.id}
              onClick={() => go(i)}
              aria-label={`Go to testimonial ${i + 1}`}
              aria-selected={index === i}
              className="h-2 rounded-full transition-all duration-300 ease-[var(--ease-organic)]"
              style={{ width: index === i ? 22 : 8, background: index === i ? 'var(--brand-deep)' : 'var(--line)' }}
            />
          ))}
        </div>
      </Container>
    </section>
  )
}

/* ------------------------- upcoming event ------------------------- */
function EventBanner({ event }: { event: EventItem | null }) {
  if (!event) return null

  return (
    <section id="events" className="bg-paper py-20 md:py-24">
      <Container>
        <div className="reveal">
          <SectionLabel index="14">Upcoming event</SectionLabel>
          <h2 className="font-display mt-5 font-medium" style={{ fontSize: 'clamp(1.9rem, 3.4vw, 2.8rem)' }}>
            Workshops & gatherings.
          </h2>
        </div>

        <article className="reveal img-zoom mt-8 grid w-full items-stretch overflow-hidden rounded-[10px] bg-card md:grid-cols-[minmax(0,38%)_1fr]">
          <div className="relative bg-paper-2" style={{ minHeight: 190 }}>
            <img
              src={event.mainImage ? cloudinaryUrl(event.mainImage, { width: 600, height: 450, crop: 'fill', gravity: 'auto' }) : IMAGES.gardenWorkshop}
              alt={`${event.name} — a creative workshop moment.`}
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
            />
            <span className="absolute left-5 top-5 flex flex-col items-center rounded-2xl bg-brand px-3.5 py-2 text-center leading-[1.05] text-ink">
              <span className="font-display text-[1.2rem] font-bold">{formatDate(event.date).split(' ')[0]}</span>
              <span className="eyebrow text-[0.55rem]">{formatDate(event.date).split(' ')[1]}</span>
            </span>
          </div>
          <div className="flex flex-col justify-center gap-3 px-7 py-8 md:px-10">
            <p className="eyebrow text-ink-soft">{formatDate(event.date)}</p>
            <h3 className="font-display font-semibold leading-[1.1] tracking-[-0.01em]" style={{ fontSize: 'clamp(1.45rem, 2.4vw, 1.9rem)' }}>
              {event.name}
            </h3>
            <p className="max-w-[52ch] text-[0.98rem] text-ink-soft">{event.shortDescription}</p>
            <Link href={`/events/${event.slug}`} className="arrow-move mt-1 inline-flex items-center gap-1.5 text-[0.95rem] font-medium text-ink">
              Explore event <span className="arrow" aria-hidden>→</span>
            </Link>
          </div>
        </article>
      </Container>
    </section>
  )
}

/* ------------------------- connect ------------------------- */
function Connect() {
  const [values, setValues] = useState({ name: '', email: '', phone: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  const contacts = [
    { label: 'Email', value: contact.email, href: `mailto:${contact.email}`, icon: 'mail' as const },
    { label: 'WhatsApp', value: contact.phoneDisplay, href: contact.whatsappUrl, icon: 'whatsapp' as const },
    { label: 'Phone', value: contact.phoneDisplay, href: `tel:${contact.phoneE164}`, icon: 'phone' as const },
    { label: 'Instagram', value: contact.instagramHandle, href: contact.instagramUrl, icon: 'instagram' as const },
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const body = [`Name: ${values.name}`, `Email: ${values.email}`, values.phone ? `Phone: ${values.phone}` : null, '', values.message]
      .filter((line) => line !== null)
      .join('\n')
    window.location.href = `mailto:${contact.email}?subject=${encodeURIComponent('Enquiry from the Pineappletales website')}&body=${encodeURIComponent(body)}`
    setSubmitted(true)
  }

  const fieldClasses = 'w-full rounded-xl border border-line bg-paper px-3.5 py-3 text-[0.98rem] text-ink'

  return (
    <section id="connect" className="bg-card py-16 text-ink md:py-20">
      <Container>
        <div className="reveal max-w-[46ch]">
          <SectionLabel index="15">Let’s connect</SectionLabel>
          <h2 className="font-display mt-5 font-medium leading-[1.03] tracking-[-0.02em]" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
            Let’s begin with your child’s story.
          </h2>
          <p className="mt-4 text-[1.02rem] text-ink-soft">
            Tell us a little about your child, and we’ll find a thoughtful way to begin — in Vadodara or online.
          </p>
        </div>

        <div className="reveal mt-10 grid gap-10 md:grid-cols-12 md:gap-14">
          <div className="md:col-span-5">
            <ul className="flex flex-col gap-3">
              {contacts.map((c) => (
                <li key={c.label}>
                  <a href={c.href} className="lift flex items-center gap-4 rounded-2xl border border-line bg-paper p-4">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand text-ink">
                      <Icon name={c.icon} />
                    </span>
                    <span className="min-w-0">
                      <span className="eyebrow block text-ink-soft">{c.label}</span>
                      <span className="block truncate text-[0.98rem] font-medium">{c.value}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
            <p className="eyebrow mt-6 flex flex-wrap items-center gap-x-4 gap-y-1 text-ink-soft">
              <span className="inline-flex items-center gap-1.5">
                <span aria-hidden className="h-[7px] w-[7px] rounded-full bg-brand-deep" />
                Offline in Vadodara
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span aria-hidden className="h-[7px] w-[7px] rounded-full bg-brand-deep" />
                Online worldwide
              </span>
            </p>
          </div>

          <div className="md:col-span-7">
            {submitted ? (
              <div className="grid gap-4 rounded-card border border-line bg-paper p-6 text-center md:p-8">
                <p className="font-display text-[1.2rem] font-medium">Your email app should now be open.</p>
                <p className="text-[0.95rem] text-ink-soft">If nothing happened, write to {contact.email} directly.</p>
              </div>
            ) : (
              <form className="grid gap-4 rounded-card border border-line bg-paper p-6 md:p-8" onSubmit={handleSubmit}>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="grid gap-1.5">
                    <span className="eyebrow text-ink-soft">Name</span>
                    <input
                      type="text"
                      required
                      autoComplete="name"
                      placeholder="Your name"
                      className={fieldClasses}
                      value={values.name}
                      onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
                    />
                  </label>
                  <label className="grid gap-1.5">
                    <span className="eyebrow text-ink-soft">Email</span>
                    <input
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="you@example.com"
                      className={fieldClasses}
                      value={values.email}
                      onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
                    />
                  </label>
                </div>
                <label className="grid gap-1.5">
                  <span className="eyebrow text-ink-soft">Phone / contact</span>
                  <input
                    type="text"
                    autoComplete="tel"
                    placeholder="Best way to reach you"
                    className={fieldClasses}
                    value={values.phone}
                    onChange={(e) => setValues((v) => ({ ...v, phone: e.target.value }))}
                  />
                </label>
                <label className="grid gap-1.5">
                  <span className="eyebrow text-ink-soft">Message</span>
                  <textarea
                    rows={4}
                    required
                    placeholder="Tell us a little about your child…"
                    className={`${fieldClasses} resize-y`}
                    value={values.message}
                    onChange={(e) => setValues((v) => ({ ...v, message: e.target.value }))}
                  />
                </label>
                <div>
                  <Button type="submit" variant="dark" size="md">
                    Submit <span className="arrow" aria-hidden>→</span>
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </Container>
    </section>
  )
}

export function HomeView({ testimonials, primaryEvent }: { testimonials: Testimonial[]; primaryEvent: EventItem | null }) {
  return (
    <>
      <Hero />
      <Kenaa />
      <Philosophy />
      <ServicesSection />
      <Trust />
      <Testimonials testimonials={testimonials} />
      <EventBanner event={primaryEvent} />
      <Connect />
    </>
  )
}
