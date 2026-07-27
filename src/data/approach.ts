/**
 * The Pineappletales method — drawn from the studio poster copy on
 * neuroplasticity, curated sessions and personalised consultation.
 */

export type ApproachStep = {
  index: string
  title: string
  body: string
}

export const approachSteps: readonly ApproachStep[] = [
  {
    index: '01',
    title: 'Understand the child',
    body: 'We begin with observation and a conversation with parents — how your child learns, what settles them, where they get stuck. Nothing is prescribed before it is understood.',
  },
  {
    index: '02',
    title: 'Design the session',
    body: 'Each session is curated to the child’s age and stage of neuroplastic development, blending fine art techniques, woodwork, printmaking, collage and sculpture with structured play planning.',
  },
  {
    index: '03',
    title: 'Work through art and story',
    body: 'Creative writing, brainstorming and ambidextrous practices are integrated deliberately, so the experience supports cognitive growth, emotional intelligence and balanced brain development.',
  },
  {
    index: '04',
    title: 'Extend it into the home',
    body: 'Parents receive targeted brain-development solutions and a home-based growth curriculum, so progress continues between sessions rather than pausing at the studio door.',
  },
] as const

export const philosophy = {
  lead: 'Children are born with remarkably plastic brains — naturally wired for curiosity, exploration and imagination.',
  body: [
    'Our thoughtfully curated sessions are designed to nurture this potential through a rich blend of fine art techniques inspired by world-renowned artists, alongside woodwork, printmaking, collage and sculpture.',
    'Each session integrates structured play planning, brainstorming, creative writing and ambidextrous practices — carefully aligned with the child’s age and stage of neuroplastic development. This ensures the experience goes beyond creating art; it actively supports cognitive growth, emotional intelligence and balanced brain development.',
    'Alongside sessions, we offer personalised consultations that provide targeted brain-development solutions, helping parents understand and support their child’s unique learning and developmental needs.',
  ],
  close:
    'These experiences don’t just spark creativity — they meaningfully shape the architecture of a growing mind.',
} as const

export type Principle = {
  title: string
  body: string
}

export const principles: readonly Principle[] = [
  {
    title: 'Personalised',
    body: 'No two children are given the same plan. Sessions are built around the child in front of us.',
  },
  {
    title: 'Creative',
    body: 'Art, writing and story are the working method — not a reward at the end of the hour.',
  },
  {
    title: 'Meaningful',
    body: 'Every activity has a developmental purpose behind it, and parents are told what it is.',
  },
] as const
