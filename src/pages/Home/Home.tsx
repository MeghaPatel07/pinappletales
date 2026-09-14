import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Icon } from '@/components/ui/Icon'
import { CtaBanner } from '@/components/sections/CtaBanner'
import { contact } from '@/config/site'
import { getPrimaryEvent, listHomeTestimonials } from '@/content/api'
import { snapshotKeys } from '@/content/snapshot'
import { useContent } from '@/content/useContent'
import { formatDate } from '@/lib/date'
import type { EventItem, Testimonial } from '@/types/content'
import styles from './Home.module.css'

const images = {
  hero: 'https://images.unsplash.com/photo-1607211851821-8be3cd6146f0?auto=format&fit=crop&w=1200&q=85',
  founder: 'https://images.unsplash.com/photo-1695477718933-a35f4921e903?auto=format&fit=crop&w=1100&q=85',
  process: 'https://images.unsplash.com/photo-1549737221-bef65e2604a6?auto=format&fit=crop&w=1100&q=85',
  trust: 'https://images.unsplash.com/photo-1608734265656-f035d3e7bcbf?auto=format&fit=crop&w=1000&q=85',
  childPortrait: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=85',
  event: 'https://images.unsplash.com/photo-1579018024219-fa9694ca5698?auto=format&fit=crop&w=1000&q=85',
}

const sixWaysServices = [
  {
    id: 'child-behaviour-analysis',
    num: '01',
    title: 'Child Behaviour & Development Analysis',
    summary: 'Reading how a child learns, responds and regulates.',
  },
  {
    id: 'neuro-art-therapy',
    num: '02',
    title: 'Neuro-Art Therapy',
    summary: 'Art-making used deliberately to support development.',
  },
  {
    id: 'bibliotherapy',
    num: '03',
    title: 'Bibliotherapy',
    summary: 'Carefully chosen stories that give feelings a language.',
  },
  {
    id: 'emotional-social-skills',
    num: '04',
    title: 'Emotional & Social Skills Support',
    summary: 'Practising friendship, conversation and self-regulation.',
  },
  {
    id: 'creative-expressive-sessions',
    num: '05',
    title: 'Creative & Expressive Therapy Sessions',
    summary: 'Writing and storytelling for children who think on paper.',
  },
  {
    id: 'personalised-plans',
    num: '06',
    title: 'Personalised Plans for Every Child',
    summary: 'A home curriculum built around your child.',
  },
]

const processSteps = [
  {
    num: '01',
    title: 'Understand the child',
    desc: 'We begin with observation and a conversation with parents. Nothing is prescribed before it is understood.',
  },
  {
    num: '02',
    title: 'Design the session',
    desc: 'Each session is curated to the child’s age and stage of development, blending art, making and structured play.',
  },
  {
    num: '03',
    title: 'Work through art and story',
    desc: 'Creative writing, brainstorming and ambidextrous practices support cognitive growth and emotional intelligence.',
  },
  {
    num: '04',
    title: 'Extend it into the home',
    desc: 'Parents receive targeted brain-development solutions and a home-based growth curriculum.',
  },
]

const trustPoints = [
  {
    num: '01',
    title: 'Led by Kenaa Jadeja',
    desc: 'Child Analyst, Author, Neuro-Art Therapist and Bibliotherapist.',
  },
  {
    num: '02',
    title: 'A transparent approach',
    desc: 'Understand the child, design the session, work through art and story, extend it home.',
  },
  {
    num: '03',
    title: 'Personalised, never templated',
    desc: 'Plans are built around your child’s neuro-development, not a fixed programme.',
  },
  {
    num: '04',
    title: 'Offline & online',
    desc: 'Sessions in Vadodara, and online for families worldwide.',
  },
]

function SectionEyebrow({ number, label }: { number: string; label: string }) {
  return (
    <div className={styles.sectionEyebrow}>
      <span className={styles.eyebrowNumber}>{number}</span>
      <span className={styles.eyebrowDash} />
      <span className={styles.eyebrowText}>{label}</span>
    </div>
  )
}

export default function Home() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [testimonialPage, setTestimonialPage] = useState(0)
  const loadTestimonials = useCallback(() => listHomeTestimonials(), [])
  const loadEvent = useCallback(() => getPrimaryEvent(), [])
  const { data: testimonials = [] } = useContent<Testimonial[]>(snapshotKeys.homeTestimonials, loadTestimonials)
  const { data: primaryEvent } = useContent<EventItem | null>(snapshotKeys.homeEvent, loadEvent)
  const testimonialPages = Math.max(1, Math.ceil(testimonials.length / 3))
  const safeTestimonialPage = Math.min(testimonialPage, testimonialPages - 1)
  const visibleTestimonials = testimonials.slice(safeTestimonialPage * 3, safeTestimonialPage * 3 + 3)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <>
      {/* -------------------------------------------------------------------
          1. HERO HEADER SECTION
          ------------------------------------------------------------------- */}
      <section className={styles.heroSection}>
        <Container>
          <div className={styles.heroGrid}>
            <div className={styles.heroCopy}>
              <SectionEyebrow number="01" label="PERSONALISED · CREATIVE · MEANINGFUL" />
              <h1>
                Empowering every <em>Parent–Child</em> Mind.
              </h1>
              <p>
                Art & Play Therapy for children & teenagers, helping them find their voice, build resilience,
                developing emotional regulation, and fostering deeper connections with their parents.
              </p>
              <div className={styles.heroActions}>
                <Button to="/contact" variant="primary">
                  Book a Session <Icon name="arrowRight" size={16} />
                </Button>
                <Button to="/services" variant="secondary">
                  Explore services
                </Button>
              </div>
            </div>
            <div className={styles.heroImageWrap}>
              <img
                src={images.hero}
                alt="Child creating art with hands and paint"
                className={styles.heroImage}
              />
            </div>
          </div>
        </Container>
      </section>

      {/* -------------------------------------------------------------------
          2. MEET KENAA JADEJA SECTION
          ------------------------------------------------------------------- */}
      <section className={styles.meetSection}>
        <Container>
          <div className={styles.meetGrid}>
            <div className={styles.meetImageCard}>
              <div className={styles.meetYellowCircle} />
              <img
                src={images.founder}
                alt="Creative art materials on worktable"
                className={styles.meetImage}
              />
            </div>
            <div className={styles.meetCopy}>
              <SectionEyebrow number="06" label="THE PERSON BEHIND THE PRACTICE" />
              <h2>Meet Kenaa Jadeja.</h2>
              <div className={styles.roleBadges}>
                <span className={styles.roleBadge}>CHILD ANALYST</span>
                <span className={styles.roleBadge}>AUTHOR</span>
                <span className={styles.roleBadge}>NEURO-ART THERAPIST</span>
                <span className={styles.roleBadge}>BIBLIOTHERAPIST</span>
              </div>
              <blockquote className={styles.meetQuote}>
                “A child’s behaviour is information, not a verdict.”
              </blockquote>
              <p className={styles.meetBio}>
                Kenaa Jadeja leads Pineappletales from Vadodara, working with children and their parents through art, story and structured play, offline and online.
              </p>
              <div className={styles.meetCta}>
                <Link to="/about" className={styles.yellowPillBtn} style={{ padding: '0.65rem 1.4rem' }}>
                  More about Kenaa <Icon name="arrowRight" size={15} />
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* -------------------------------------------------------------------
          3. WHAT IS PINEAPPLETALES? (APPROACH)
          ------------------------------------------------------------------- */}
      <section className={styles.approachSection}>
        <Container>
          <div className={styles.approachHeader}>
            <div>
              <SectionEyebrow number="07" label="WHAT IS PINEAPPLETALES?" />
              <h2>
                Personalised. <span className={styles.yellowItalic}>Creative.</span> Meaningful.
              </h2>
            </div>
            <div>
              <p>
                An approach built on <strong>art + story + structured play</strong>, designed around each child’s developing brain.
              </p>
            </div>
          </div>

          <div className={styles.processGrid}>
            <img src={images.process} alt="Child reading picture book" className={styles.processImg} />
            <div className={styles.processList}>
              {processSteps.map((step) => (
                <div className={styles.processItem} key={step.num}>
                  <div className={styles.processNum}>{step.num}</div>
                  <div className={styles.processContent}>
                    <h3>{step.title}</h3>
                    <p>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* -------------------------------------------------------------------
          4. SIX WAYS OF WORKING WITH A CHILD (SERVICES - EXACT MATCH)
          ------------------------------------------------------------------- */}
      <section className={styles.servicesSection} id="services">
        <Container>
          <div className={styles.servicesHeader}>
            <div>
              <SectionEyebrow number="08" label="WHAT I OFFER" />
              <h2>Six ways of working with a child.</h2>
            </div>
            <div>
              <p>
                Each service begins with understanding — never a template. A quick map of the practice; the full detail lives on the Services page.
              </p>
            </div>
          </div>

          <div className={styles.servicesBody}>
            {/* Left Dotted Timeline List */}
            <div className={styles.timelineContainer}>
              <div className={styles.dottedLine} />
              <div className={styles.timelineList}>
                {sixWaysServices.map((item) => (
                  <Link
                    to={`/services#${item.id}`}
                    className={styles.timelineItem}
                    key={item.num}
                  >
                    <span className={styles.ringNode} />
                    <div className={styles.itemHeader}>
                      <span className={styles.itemNum}>{item.num}</span>
                      <h3 className={styles.itemTitle}>{item.title}</h3>
                    </div>
                    <p className={styles.itemSummary}>{item.summary}</p>
                  </Link>
                ))}
              </div>

              <div className={styles.servicesFooter}>
                <Link to="/services" className={styles.yellowPillBtn}>
                  Explore services <Icon name="arrowRight" size={16} />
                </Link>
              </div>
            </div>

            {/* Right Soft Yellow Oval Portrait Frame */}
            <div className={styles.portraitWrap}>
              <div className={styles.portraitOvalFrame}>
                <img
                  src={images.childPortrait}
                  alt="Portrait of child in art therapy session"
                  className={styles.portraitOvalImg}
                />
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* -------------------------------------------------------------------
          5. WHY PARENTS TRUST PINEAPPLETALES (ENVIRONMENT / TRUST)
          ------------------------------------------------------------------- */}
      <section className={styles.envSection}>
        <Container>
          <div className={styles.envHeader}>
            <SectionEyebrow number="12" label="WHY PARENTS TRUST PINEAPPLETALES" />
            <h2>Calm, clear and built on understanding.</h2>
          </div>

          <div className={styles.trustGrid}>
            <img src={images.trust} alt="Child exploring creative materials" className={styles.trustImg} />
            <div className={styles.trustList}>
              {trustPoints.map((pt) => (
                <div className={styles.trustItem} key={pt.num}>
                  <div className={styles.trustNum}>{pt.num}</div>
                  <div className={styles.trustContent}>
                    <h3>{pt.title}</h3>
                    <p>{pt.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* -------------------------------------------------------------------
          6. IN PARENTS' WORDS (TESTIMONIALS)
          ------------------------------------------------------------------- */}
      <section className={styles.testiSection}>
        <Container>
          <div className={styles.testiHeader}>
            <SectionEyebrow number="13" label="IN PARENTS' WORDS" />
            <h2>In parents’ words.</h2>
          </div>

          <div className={styles.testiGrid}>
            {visibleTestimonials.map((item) => (
              <div className={styles.testiCard} key={item.id}>
                <blockquote>“{item.testimonial}”</blockquote>
                <div className={styles.testiCite}>{item.name}{item.designation ? ` · ${item.designation}` : ''}</div>
              </div>
            ))}
          </div>
          {testimonialPages > 1 && (
            <div className={styles.testiControls}>
              <button type="button" aria-label="Previous testimonials" disabled={safeTestimonialPage === 0} onClick={() => setTestimonialPage((page) => Math.max(0, page - 1))}><Icon name="chevronLeft" size={18} /></button>
              <span>{safeTestimonialPage + 1} / {testimonialPages}</span>
              <button type="button" aria-label="Next testimonials" disabled={safeTestimonialPage === testimonialPages - 1} onClick={() => setTestimonialPage((page) => Math.min(testimonialPages - 1, page + 1))}><Icon name="chevronRight" size={18} /></button>
            </div>
          )}
        </Container>
      </section>

      {/* -------------------------------------------------------------------
          7. UPCOMING EVENT (WORKSHOPS & GATHERINGS)
          ------------------------------------------------------------------- */}
      <section className={styles.eventSection} id="events">
        <Container>
          <div className={styles.eventHeader}>
            <SectionEyebrow number="14" label="UPCOMING EVENT" />
            <h2>Workshops & gatherings.</h2>
          </div>

          {primaryEvent && <div className={styles.eventCard}>
            <div className={styles.eventImgWrap}>
              <img
                src={primaryEvent.mainImage?.url || images.event}
                alt={primaryEvent.mainImage?.alt || primaryEvent.name}
                className={styles.eventImg}
              />
            </div>
            <div className={styles.eventContent}>
              <span className={styles.eventMeta}>{formatDate(primaryEvent.date)}</span>
              <h3>{primaryEvent.name}</h3>
              <p>
                {primaryEvent.shortDescription}
              </p>
              <div>
                <Link to={`/events/${primaryEvent.slug}`} className={styles.yellowPillBtn} style={{ padding: '0.65rem 1.4rem' }}>
                  Explore event <Icon name="arrowRight" size={15} />
                </Link>
              </div>
            </div>
          </div>}
        </Container>
      </section>

      {/* -------------------------------------------------------------------
          8. GET IN TOUCH (CONTACT FORM)
          ------------------------------------------------------------------- */}
      <section className={styles.contactSection}>
        <Container>
          <div className={styles.contactHeader}>
            <SectionEyebrow number="15" label="GET IN TOUCH" />
            <h2>Let’s begin with your child’s story.</h2>
            <p>
              Tell us a little about your child, and we’ll find a thoughtful way to begin — in Vadodara or online. Reach us at {contact.email}.
            </p>
          </div>

          <div className={styles.contactGrid}>
            <div className={styles.contactInfoList}>
              <div className={styles.infoCard}>
                <div className={styles.infoIcon}>
                  <Icon name="mail" size={18} />
                </div>
                <div className={styles.infoText}>
                  <strong>Email Us</strong>
                  <a href={`mailto:${contact.email}`}>{contact.email}</a>
                </div>
              </div>

              <div className={styles.infoCard}>
                <div className={styles.infoIcon}>
                  <Icon name="phone" size={18} />
                </div>
                <div className={styles.infoText}>
                  <strong>Phone</strong>
                  <a href={`tel:${contact.phoneE164}`}>{contact.phoneDisplay}</a>
                </div>
              </div>

              <div className={styles.infoCard}>
                <div className={styles.infoIcon}>
                  <Icon name="mapPin" size={18} />
                </div>
                <div className={styles.infoText}>
                  <strong>Location</strong>
                  <span>Vadodara, Gujarat</span>
                </div>
              </div>

              <div className={styles.infoCard}>
                <div className={styles.infoIcon}>
                  <Icon name="clock" size={18} />
                </div>
                <div className={styles.infoText}>
                  <strong>Working Hours</strong>
                  <span>Mon - Fri: 9:00 AM - 6:00 PM</span>
                </div>
              </div>
            </div>

            <div className={styles.contactFormCard}>
              {submitted ? (
                <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                  <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Thank You!</h3>
                  <p style={{ color: '#57534e' }}>We have received your request and will reach out shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className={styles.formGrid}>
                  <div className={styles.formRowTwo}>
                    <div className={styles.formGroup}>
                      <label htmlFor="firstName">First Name</label>
                      <input
                        id="firstName"
                        type="text"
                        required
                        placeholder="First name"
                        className={styles.inputField}
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="lastName">Last Name</label>
                      <input
                        id="lastName"
                        type="text"
                        placeholder="Last name"
                        className={styles.inputField}
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="email">Email Address</label>
                    <input
                      id="email"
                      type="email"
                      required
                      placeholder="your.email@example.com"
                      className={styles.inputField}
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="phone">Phone Number</label>
                    <input
                      id="phone"
                      type="tel"
                      placeholder="+91 00000 00000"
                      className={styles.inputField}
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="message">How can we help your child?</label>
                    <textarea
                      id="message"
                      rows={4}
                      placeholder="Tell us a little about your child's needs..."
                      className={styles.textareaField}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    />
                  </div>

                  <div className={styles.submitBtn}>
                    <Button type="submit" variant="dark" block>
                      Submit <Icon name="arrowRight" size={16} />
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </Container>
      </section>

      {/* -------------------------------------------------------------------
          9. BRIGHT YELLOW CTA BANNER
          ------------------------------------------------------------------- */}
      <CtaBanner
        variant="yellow"
        title="Let’s build a brighter tomorrow, one child at a time."
      />
    </>
  )
}
