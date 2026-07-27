import { Card } from '@/components/ui/Card'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { TickList } from '@/components/ui/TickList'
import { Accordion } from '@/components/ui/Accordion'
import { CtaBanner } from '@/components/sections/CtaBanner'
import { PageHero } from '@/components/sections/PageHero'
import { audiences } from '@/data/audiences'
import { faqs } from '@/data/faqs'
import { services, sessionFormats } from '@/data/services'
import styles from './Services.module.css'

export default function Services() {
  return (
    <>
      <PageHero
        eyebrow="Services"
        title="What we offer at Pineappletales"
        lead="Therapeutic and creative programmes for children, guidance for parents, and workshops for schools and community organisations — delivered offline in Vadodara and online."
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Services' }]}
      />

      {/* Jump links ------------------------------------------------------ */}
      <div className={styles.jumpBar}>
        <Container>
          <nav aria-label="Jump to section">
            <ul className={styles.jumpList}>
              {audiences.map((audience) => (
                <li key={audience.id}>
                  <a href={`#${audience.id}`} className={styles.jumpLink}>
                    {audience.eyebrow}
                  </a>
                </li>
              ))}
              <li>
                <a href="#core-services" className={styles.jumpLink}>
                  Core services
                </a>
              </li>
              <li>
                <a href="#faqs" className={styles.jumpLink}>
                  FAQs
                </a>
              </li>
            </ul>
          </nav>
        </Container>
      </div>

      {/* Audiences ------------------------------------------------------- */}
      <Section tone="canvas" aria-labelledby="audiences-title">
        <Container>
          <SectionHeading
            id="audiences-title"
            eyebrow="Who it’s for"
            title="Support shaped around the person receiving it"
            lead="The same underlying method, adapted for a child in the room, a parent at home, or a hall full of students."
          />

          <div className={styles.audienceStack}>
            {audiences.map((audience) => (
              <article
                key={audience.id}
                id={audience.id}
                className={styles.audience}
                aria-labelledby={`${audience.id}-title`}
              >
                <div className={styles.audienceHeader}>
                  <p className={`${styles.audienceEyebrow} ${styles[audience.accent]}`}>
                    {audience.eyebrow}
                  </p>
                  <h3 id={`${audience.id}-title`} className={styles.audienceTitle}>
                    {audience.title}
                  </h3>
                  <p className={styles.audienceIntro}>{audience.intro}</p>
                </div>
                <TickList items={audience.offerings} className={styles.audienceList} />
              </article>
            ))}
          </div>
        </Container>
      </Section>

      {/* Core services --------------------------------------------------- */}
      <Section
        tone="alt"
        id="core-services"
        className={styles.anchorSection}
        aria-labelledby="core-title"
      >
        <Container>
          <SectionHeading
            id="core-title"
            eyebrow="Core services"
            title="Six ways we work"
            lead="Every engagement starts with understanding the child. What follows is chosen from these six, alone or in combination."
          />

          <div className={styles.serviceStack}>
            {services.map((service, index) => (
              <article
                key={service.id}
                id={service.id}
                className={styles.service}
                aria-labelledby={`${service.id}-title`}
              >
                <div className={styles.serviceIndex}>
                  <span className={`${styles.indexNumber} ${styles[service.accent]}`}>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>

                <div className={styles.serviceBody}>
                  <h3 id={`${service.id}-title`} className={styles.serviceTitle}>
                    {service.title}
                  </h3>
                  <p className={styles.serviceSummary}>{service.summary}</p>
                  <p className={styles.serviceDescription}>{service.description}</p>

                  <div className={styles.serviceDetail}>
                    <Card tone="surface" className={styles.includesCard}>
                      <h4 className={styles.detailTitle}>What’s included</h4>
                      <TickList items={service.includes} size="compact" />
                    </Card>

                    <dl className={styles.metaList}>
                      <div className={styles.metaRow}>
                        <dt className={styles.metaLabel}>Best for</dt>
                        <dd className={styles.metaValue}>{service.bestFor}</dd>
                      </div>
                      <div className={styles.metaRow}>
                        <dt className={styles.metaLabel}>Formats</dt>
                        <dd className={styles.metaValue}>
                          {service.formats.map((format) => (
                            <span key={format} className={styles.chip}>
                              {format}
                            </span>
                          ))}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </Section>

      {/* Formats --------------------------------------------------------- */}
      <Section tone="canvas" aria-labelledby="formats-title">
        <Container>
          <SectionHeading
            id="formats-title"
            eyebrow="Session formats"
            title="How sessions are scheduled"
            lead="Choose the rhythm that suits your family or institution — weekend studio time, a curated programme, or a one-off workshop."
          />
          <ul className={styles.formatGrid}>
            {sessionFormats.map((format) => (
              <Card as="li" key={format.title} tone="outline">
                <h3 className={styles.formatTitle}>{format.title}</h3>
                <p className={styles.formatDetail}>{format.detail}</p>
              </Card>
            ))}
          </ul>
        </Container>
      </Section>

      {/* FAQs ------------------------------------------------------------ */}
      <Section
        tone="alt"
        id="faqs"
        className={styles.anchorSection}
        aria-labelledby="faq-title"
      >
        <Container width="narrow">
          <SectionHeading
            id="faq-title"
            eyebrow="Questions"
            title="Frequently asked"
            align="center"
          />
          <Accordion items={faqs} />
        </Container>
      </Section>

      <CtaBanner
        title="Not sure which of these your child needs?"
        body="That is exactly what the first conversation is for. Share your child’s age and what you’d like support with, and you’ll get a recommended starting point."
        primaryLabel="Start with a conversation"
      />
    </>
  )
}
