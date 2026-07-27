/**
 * Frequently asked questions. Also emitted as FAQPage structured data, so
 * answers are kept factual and self-contained.
 */

export type Faq = {
  question: string
  answer: string
}

export const faqs: readonly Faq[] = [
  {
    question: 'What is Neuro-Art Therapy?',
    answer:
      'Neuro-Art Therapy uses fine art techniques, woodwork, printmaking, collage and sculpture as a deliberate tool for brain development. Sessions are aligned to a child’s age and stage of neuroplastic development and integrate structured play planning, brainstorming, creative writing and ambidextrous practices, so the work supports cognitive growth and emotional intelligence rather than only producing artwork.',
  },
  {
    question: 'What is Bibliotherapy, and how does it help a child?',
    answer:
      'Bibliotherapy uses carefully chosen books as a therapeutic instrument. Reading is selected to match what a child is working through and then guided through discussion, journalling and creative response, so the story becomes a safe way to name and examine difficult feelings.',
  },
  {
    question: 'Do you offer online sessions?',
    answer:
      'Yes. Pineappletales runs both offline sessions at the Gotri Road studio in Vadodara and online sessions for families elsewhere in India and abroad. Writing and Neuro-Art workshops are available in both formats.',
  },
  {
    question: 'Where is Pineappletales located?',
    answer:
      'The studio is at 5/6 Mangal Murti Society, opposite Mother’s School, Gotri Road, Vadodara, Gujarat 390021, India.',
  },
  {
    question: 'How does an engagement usually begin?',
    answer:
      'It begins with a child behaviour and development analysis — structured observation plus a conversation with parents about developmental history and current concerns. That analysis determines which sessions, workshops or home curriculum are recommended.',
  },
  {
    question: 'Do you work with schools, NGOs and libraries?',
    answer:
      'Yes. Pineappletales designs school workshops and enrichment programmes, storytelling and creative writing initiatives, and customised collaborative projects for schools, NGOs, libraries and community groups.',
  },
  {
    question: 'How do I book a session?',
    answer:
      'Write to pineappletales1@gmail.com, call +91 98256 78226, or send a direct message on Instagram at @pineappletales1. Share your child’s age and what you would like support with, and you will receive a recommended starting point.',
  },
] as const
