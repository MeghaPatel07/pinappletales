import { Icon } from './Icon'

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
    <div className="flex flex-col gap-3">
      {items.map((item, index) => (
        <details
          key={item.question}
          className="group rounded-card border border-line bg-card px-6 py-4 open:pb-5"
          open={index === defaultOpenIndex}
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-1 font-display text-[1.1rem] font-medium">
            <span>{item.question}</span>
            <span className="shrink-0 text-brand-deep transition-transform duration-300 group-open:rotate-45" aria-hidden>
              <Icon name="plus" size={16} />
            </span>
          </summary>
          <div className="mt-3 max-w-[64ch] text-[0.98rem] leading-relaxed text-ink-soft">
            <p>{item.answer}</p>
          </div>
        </details>
      ))}
    </div>
  )
}
