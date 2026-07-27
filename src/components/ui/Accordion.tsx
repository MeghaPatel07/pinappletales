import { Icon } from './Icon'
import styles from './Accordion.module.css'

export type AccordionItem = {
  question: string
  answer: string
}

type AccordionProps = {
  items: readonly AccordionItem[]
  /** The first item opens by default so the pattern is discoverable. */
  defaultOpenIndex?: number
}

/**
 * Built on native <details>/<summary>: keyboard accessible without JavaScript,
 * and all answer text stays in the DOM so it is indexable.
 */
export function Accordion({ items, defaultOpenIndex = 0 }: AccordionProps) {
  return (
    <div className={styles.accordion}>
      {items.map((item, index) => (
        <details
          key={item.question}
          className={styles.item}
          open={index === defaultOpenIndex}
        >
          <summary className={styles.summary}>
            <span className={styles.question}>{item.question}</span>
            <span className={styles.indicator} aria-hidden="true">
              <Icon name="plus" size={16} />
            </span>
          </summary>
          <div className={styles.answer}>
            <p>{item.answer}</p>
          </div>
        </details>
      ))}
    </div>
  )
}
