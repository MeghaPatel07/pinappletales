import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Container } from '@/components/ui/Container'
import { Icon } from '@/components/ui/Icon'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { TickList } from '@/components/ui/TickList'
import { CtaBanner } from '@/components/sections/CtaBanner'
import { Hero } from '@/components/sections/Hero'
import { approachSteps, philosophy, principles } from '@/data/approach'
import { audiences } from '@/data/audiences'
import { services, sessionFormats } from '@/data/services'
import styles from './Home.module.css'

export default function Home() {
  return (
    <>
      <Hero />

      {/* Principles ------------------------------------------------------ */}
      <Section tone="canvas" size="compact" aria-labelledby="principles-title">
        <Container>
          <h2 id="principles-title" className="visually-hidden">
            How we work
          </h2>
          <ul className={styles.principles}>
            {principles.map((principle) => (
              <li key={principle.title} className={styles.principle}>
                <h3 className={styles.principleTitle}>{principle.title}</h3>
                <p className={styles.principleBody}>{principle.body}</p>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      {/* Who we work with ------------------------------------------------ */}
      <Section tone="alt" id="who-we-help" aria-labelledby="audiences-title">
        <Container>
          <SectionHeading
            id="audiences-title"
            eyebrow="Who we work with"
            title="Three ways into the same work"
            lead="Pineappletales supports the child, the parent and the wider community around them — because a child’s growth is never a solo project."
          />

          <ul className={styles.audienceGrid}>
            {audiences.map((audience) => (
              <Card
                as="li"
                key={audience.id}
                accent={audience.accent}
                className={styles.audienceCard}
              >
                <p className={styles.audienceEyebrow}>{audience.eyebrow}</p>
                <h3 className={styles.audienceTitle}>{audience.title}</h3>
                <p className={styles.audienceIntro}>{audience.intro}</p>
                <TickList
                  items={audience.offerings.slice(0, 3)}
                  size="compact"
                  className={styles.audienceList}
                />
                <Link
                  to={`/services#${audience.id}`}
                  className={styles.audienceLink}
                >
                  See the full list
                  <Icon name="arrowRight" size={15} />
                </Link>
              </Card>
            ))}
          </ul>
        </Container>
      </Section>

      {/* Philosophy ------------------------------------------------------ */}
      <Section tone="dark" aria-labelledby="philosophy-title">
        <Container>
          <div className={styles.philosophyGrid}>
            <div>
              <SectionHeading
                id="philosophy-title"
                eyebrow="The thinking behind it"
                title="Children are born with remarkably plastic brains"
                tone="dark"
              />
            </div>
            <div className={styles.philosophyBody}>
              <p className={styles.philosophyLead}>
                Naturally wired for curiosity, exploration and imagination.
              </p>
              {philosophy.body.map((paragraph) => (
                <p key={paragraph.slice(0, 40)} className={styles.philosophyText}>
                  {paragraph}
                </p>
              ))}
              <blockquote className={styles.pullQuote}>{philosophy.close}</blockquote>
              <Button to="/about" variant="onDark">
                More about the method
                <Icon name="arrowRight" size={16} />
              </Button>
            </div>
          </div>
        </Container>
      </Section>

      {/* Services preview ------------------------------------------------ */}
      <Section tone="canvas" aria-labelledby="services-title">
        <Container>
          <div className={styles.servicesHeader}>
            <SectionHeading
              id="services-title"
              eyebrow="What we offer"
              title="Services built around one child at a time"
              lead="Six core offerings, delivered one-to-one, in small groups, or as workshops for schools and community organisations."
            />
            <Button to="/services" variant="secondary" className={styles.headerAction}>
              All services
              <Icon name="arrowRight" size={16} />
            </Button>
          </div>

          <ul className={styles.serviceGrid}>
            {services.map((service) => (
              <Card as="li" key={service.id} tone="outline" className={styles.serviceCard}>
                <h3 className={styles.serviceTitle}>
                  <Link to={`/services#${service.id}`} className={styles.serviceLink}>
                    {service.title}
                  </Link>
                </h3>
                <p className={styles.serviceSummary}>{service.summary}</p>
                <p className={styles.serviceMeta}>{service.bestFor}</p>
              </Card>
            ))}
          </ul>
        </Container>
      </Section>

      {/* Approach -------------------------------------------------------- */}
      <Section tone="alt" aria-labelledby="approach-title">
        <Container>
          <SectionHeading
            id="approach-title"
            eyebrow="How it works"
            title="Understanding first, then a plan"
            lead="Nothing is prescribed before it is understood. Four steps take a family from first conversation to a routine that continues at home."
          />

          <ol className={styles.steps}>
            {approachSteps.map((step) => (
              <li key={step.index} className={styles.step}>
                <span className={styles.stepIndex}>{step.index}</span>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepBody}>{step.body}</p>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      {/* Formats --------------------------------------------------------- */}
      <Section tone="canvas" size="compact" divider aria-labelledby="formats-title">
        <Container>
          <div className={styles.formatsLayout}>
            <SectionHeading
              id="formats-title"
              eyebrow="Session formats"
              title="Ways to work together"
            />
            <ul className={styles.formatList}>
              {sessionFormats.map((format) => (
                <li key={format.title} className={styles.format}>
                  <h3 className={styles.formatTitle}>{format.title}</h3>
                  <p className={styles.formatDetail}>{format.detail}</p>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </Section>

      <CtaBanner
        title="Whether you’re here for parenting insights, emotional well-being or creative learning — you’re in the right place."
        body="Send a message to start the conversation. Share your child’s age and what you would like support with, and you’ll receive a recommended starting point."
      />
    </>
  )
}
