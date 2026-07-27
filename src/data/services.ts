/**
 * The six core offerings listed on the Pineappletales card, expanded with
 * detail drawn from the studio poster and session material.
 */

export type ServiceId =
  | 'child-behaviour-analysis'
  | 'neuro-art-therapy'
  | 'bibliotherapy'
  | 'emotional-social-skills'
  | 'creative-expressive-sessions'
  | 'personalised-plans'

export type Service = {
  id: ServiceId
  title: string
  /** One-line summary used on cards and in the services list. */
  summary: string
  /** Long-form description for the service detail block. */
  description: string
  /** Concrete things included, kept short and scannable. */
  includes: readonly string[]
  /** Who it is primarily for. */
  bestFor: string
  /** Delivery formats available. */
  formats: readonly string[]
  accent: 'brand' | 'leaf' | 'coral' | 'indigo'
}

export const services: readonly Service[] = [
  {
    id: 'child-behaviour-analysis',
    title: 'Child Behaviour & Development Analysis',
    summary:
      'A structured read of how your child learns, responds and regulates — before any plan is made.',
    description:
      'Every engagement begins with understanding. Through observation, guided activity and conversation with parents, we map your child’s behavioural patterns, learning style and stage of development. The outcome is a clear picture of strengths and pressure points that everything else is built on.',
    includes: [
      'Structured observation across play and task settings',
      'Parent intake conversation and developmental history',
      'Learning-style and behavioural pattern mapping',
      'A written summary with practical next steps',
    ],
    bestFor: 'Parents seeking clarity before choosing a direction',
    formats: ['One-to-one', 'Offline & online'],
    accent: 'indigo',
  },
  {
    id: 'neuro-art-therapy',
    title: 'Neuro-Art Therapy',
    summary:
      'Fine art, woodwork, printmaking and sculpture used deliberately to support brain development.',
    description:
      'Children are born with remarkably plastic brains — naturally wired for curiosity, exploration and imagination. Neuro-Art Therapy channels that plasticity through fine art techniques inspired by world-renowned artists, alongside woodwork, printmaking, collage and sculpture. Each session is aligned to the child’s age and stage of neuroplastic development, so the work supports cognitive growth and emotional regulation rather than simply producing art.',
    includes: [
      'Age-aligned fine art and mixed-media practice',
      'Ambidextrous exercises for balanced brain development',
      'Structured play planning and brainstorming',
      'Progress tracked across cognitive and emotional markers',
    ],
    bestFor: 'Children building focus, regulation and confidence',
    formats: ['One-to-one', 'Small group', 'Offline & online'],
    accent: 'brand',
  },
  {
    id: 'bibliotherapy',
    title: 'Bibliotherapy',
    summary:
      'Carefully chosen stories that give a child language for what they are feeling.',
    description:
      'Bibliotherapy uses literature as a therapeutic instrument. Books are selected to match what a child is working through — a transition, a fear, a friendship difficulty, a loss — and the reading is guided so the story becomes a safe place to name and examine feelings. Discussion, journalling and creative response turn reading into insight.',
    includes: [
      'Curated reading matched to the child’s situation and age',
      'Guided discussion and reflective questioning',
      'Creative written and visual responses to text',
      'Reading suggestions parents can continue at home',
    ],
    bestFor: 'Children processing change, anxiety or big feelings',
    formats: ['One-to-one', 'Small group', 'Offline & online'],
    accent: 'coral',
  },
  {
    id: 'emotional-social-skills',
    title: 'Emotional & Social Skills Support',
    summary:
      'Practising the everyday skills of friendship, conversation and self-regulation.',
    description:
      'Social confidence is learned, not assumed. These sessions give children a low-pressure setting to rehearse the mechanics of connection — reading cues, taking turns, disagreeing safely, recovering from conflict — and to build a working vocabulary for their own emotional states.',
    includes: [
      'Communication and conversation practice',
      'Emotion identification and regulation strategies',
      'Turn-taking, collaboration and conflict repair',
      'Confidence building through structured play formats',
    ],
    bestFor: 'Children who find peer settings difficult',
    formats: ['One-to-one', 'Small group', 'Offline & online'],
    accent: 'leaf',
  },
  {
    id: 'creative-expressive-sessions',
    title: 'Creative & Expressive Therapy Sessions',
    summary:
      'Creative writing, storytelling and research-led work for children who think on paper.',
    description:
      'For many children, expression comes more easily through making than through talking. These sessions combine creative writing, storytelling and research-encouraging projects with expressive art, giving children a craft they can keep — and a reliable outlet when words are hard to find.',
    includes: [
      'Creative writing and storytelling craft',
      'Research-encouraging projects and enrichment work',
      'Expressive art, collage and sculpture',
      'Saturday sessions and holiday workshops',
    ],
    bestFor: 'Children drawn to writing, stories and making',
    formats: ['Workshops', 'Saturday sessions', 'Offline & online'],
    accent: 'brand',
  },
  {
    id: 'personalised-plans',
    title: 'Personalised Plans for Every Child',
    summary:
      'A home curriculum built around your child’s neuro-development, not a template.',
    description:
      'Following analysis, families receive targeted brain-development solutions: a home-based growth curriculum grounded in neuro brain development, with parent-child bonding activities and recommendations calibrated to your child’s specific learning needs. Plans are reviewed and adjusted as the child grows.',
    includes: [
      'Home-based growth curriculum built on neuro-development',
      'Parent-child creative bonding activities',
      'Targeted recommendations for unique learning needs',
      'Periodic review and recalibration',
    ],
    bestFor: 'Families who want structure to continue at home',
    formats: ['Consultation', 'Offline & online'],
    accent: 'indigo',
  },
] as const

/** Session formats offered, as listed on the studio poster. */
export const sessionFormats: readonly { title: string; detail: string }[] = [
  {
    title: 'Saturday Sessions',
    detail: 'Weekend studio time for ongoing creative and therapeutic work.',
  },
  {
    title: 'Curated Curriculums',
    detail: 'Programmes sequenced to a child’s age and developmental stage.',
  },
  {
    title: 'Neuro Therapy Consultation',
    detail: 'Focused one-to-one consultation for parents and children.',
  },
  {
    title: 'Workshops',
    detail: 'Writing and Neuro-Art workshops, run in person and online.',
  },
  {
    title: 'Structured Play Formats',
    detail: 'Play designed with an objective — planning, turn-taking, recovery.',
  },
] as const
