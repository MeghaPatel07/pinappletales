import { Card } from '@/components/ui/Card'
import { Container } from '@/components/ui/Container'
import { Icon } from '@/components/ui/Icon'
import { Logo } from '@/components/ui/Logo'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { CtaBanner } from '@/components/sections/CtaBanner'
import { PageHero } from '@/components/sections/PageHero'
import { approachSteps, philosophy, principles } from '@/data/approach'
import { address, contact, site } from '@/config/site'
import { sessionFormats } from '@/data/services'
import styles from './About.module.css'

export default function About() {
  return (
    <>
      <PageHero
        eyebrow="About"
        title="The practitioner behind Pineappletales"
        lead={`${site.founder} works with children, parents and schools as a ${site.founderTitles
          .join(', ')
          .replace(/, ([^,]*)$/, ' and $1')
          .toLowerCase()} — using art, story and structured play as instruments of development rather than decoration.`}
        crumbs={[{ label: 'Home', to: '/' }, { label: 'About' }]}
      />

      {/* Profile --------------------------------------------------------- */}
      <Section tone="canvas" aria-labelledby="profile-title">
        <Container>
          <div className={styles.profile}>
            <div className={styles.profileCopy}>
              <SectionHeading
                id="profile-title"
                eyebrow="Kenaa Jadeja"
                title="Therapy that understands, and then empowers"
              />
              <p className={styles.paragraph}>
                Pineappletales began from a straightforward conviction: a child’s
                behaviour is information, not a verdict. Read it properly and it tells
                you how that child learns, what overwhelms them, and where their
                confidence is quietly building.
              </p>
              <p className={styles.paragraph}>
                That reading is the starting point for everything here — Neuro-Art
                Therapy sessions, Bibliotherapy, creative writing work, parent guidance
                and school programmes. Sessions run at the Gotri Road studio in Vadodara
                and online, so families outside the city can work together just as
                closely.
              </p>
              <p className={styles.paragraph}>
                Whether you’re here for parenting insights, emotional well-being,
                overall growth or creative learning and writing — you’re in the right
                place.
              </p>
            </div>

            <aside className={styles.profileAside} aria-label="Practice at a glance">
              <Card tone="alt" className={styles.factCard}>
                <Logo
                  loading="lazy"
                  alt={`${site.name} by ${site.founder}`}
                  className={styles.factMark}
                />
                <dl className={styles.factList}>
                  <div className={styles.fact}>
                    <dt className={styles.factLabel}>Practises as</dt>
                    <dd className={styles.factValue}>
                      {site.founderTitles.map((title) => (
                        <span key={title} className={styles.tag}>
                          {title}
                        </span>
                      ))}
                    </dd>
                  </div>
                  <div className={styles.fact}>
                    <dt className={styles.factLabel}>Works with</dt>
                    <dd className={styles.factValue}>
                      Children, parents, schools, NGOs, libraries and community groups
                    </dd>
                  </div>
                  <div className={styles.fact}>
                    <dt className={styles.factLabel}>Formats</dt>
                    <dd className={styles.factValue}>
                      {sessionFormats.map((format) => format.title).join(' · ')}
                    </dd>
                  </div>
                  <div className={styles.fact}>
                    <dt className={styles.factLabel}>Based in</dt>
                    <dd className={styles.factValue}>
                      {address.locality} — offline and online
                    </dd>
                  </div>
                </dl>
                <a href={contact.instagramUrl} className={styles.factLink} target="_blank" rel="noopener noreferrer">
                  <Icon name="instagram" size={16} />
                  {contact.instagramHandle}
                </a>
              </Card>
            </aside>
          </div>
        </Container>
      </Section>

      {/* Philosophy ------------------------------------------------------ */}
      <Section tone="dark" aria-labelledby="philosophy-title">
        <Container>
          <SectionHeading
            id="philosophy-title"
            eyebrow="The method"
            title="Working with the architecture of a growing mind"
            tone="dark"
            align="center"
          />
          <div className={styles.philosophy}>
            <p className={styles.philosophyLead}>{philosophy.lead}</p>
            {philosophy.body.map((paragraph) => (
              <p key={paragraph.slice(0, 40)} className={styles.philosophyText}>
                {paragraph}
              </p>
            ))}
            <blockquote className={styles.pullQuote}>{philosophy.close}</blockquote>
          </div>
        </Container>
      </Section>

      {/* Process --------------------------------------------------------- */}
      <Section tone="canvas" aria-labelledby="process-title">
        <Container>
          <SectionHeading
            id="process-title"
            eyebrow="The process"
            title="From first conversation to a routine that holds"
            lead="Each stage produces something usable — an understanding, a session plan, a practice you can continue at home."
          />

          <ol className={styles.timeline}>
            {approachSteps.map((step) => (
              <li key={step.index} className={styles.timelineItem}>
                <span className={styles.timelineIndex} aria-hidden="true">
                  {step.index}
                </span>
                <div>
                  <h3 className={styles.timelineTitle}>{step.title}</h3>
                  <p className={styles.timelineBody}>{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      {/* Principles ------------------------------------------------------ */}
      <Section tone="alt" aria-labelledby="principles-title">
        <Container>
          <SectionHeading
            id="principles-title"
            eyebrow="What guides the work"
            title={site.promise}
            align="center"
          />
          <ul className={styles.principleGrid}>
            {principles.map((principle) => (
              <Card as="li" key={principle.title} accent="brand">
                <h3 className={styles.principleTitle}>{principle.title}</h3>
                <p className={styles.principleBody}>{principle.body}</p>
              </Card>
            ))}
          </ul>
        </Container>
      </Section>

      <CtaBanner
        eyebrow="Let’s connect"
        title="Follow along, say hello, or send a message to start your journey."
        body={`${site.closingLine} Sessions are available offline in Vadodara and online wherever you are.`}
      />
    </>
  )
}
