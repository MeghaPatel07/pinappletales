/**
 * The three groups Pineappletales works with, taken from the "What do we offer"
 * series. Used on the home page as an overview and on the services page as the
 * primary organising structure.
 */

export type AudienceId = 'children' | 'parents' | 'communities'

export type Audience = {
  id: AudienceId
  eyebrow: string
  title: string
  intro: string
  offerings: readonly string[]
  accent: 'brand' | 'leaf' | 'indigo'
}

export const audiences: readonly Audience[] = [
  {
    id: 'children',
    eyebrow: 'For children',
    title: 'Space to grow at their own pace',
    intro:
      'Sessions that meet a child where they are — through stories, art and structured play rather than pressure.',
    offerings: [
      'Neuro-Art Therapy sessions and Bibliotherapy — healing through stories and art',
      'Age-appropriate learning enrichment workshops',
      'Creative writing and research-encouraging sessions, online and offline',
      'Social skills and communication development sessions',
      'Personalised support for emotional, social and creative growth',
    ],
    accent: 'brand',
  },
  {
    id: 'parents',
    eyebrow: 'For parents',
    title: 'Understanding, then a plan you can use',
    intro:
      'Guidance that makes your child’s behaviour legible — and gives you something practical to do at home.',
    offerings: [
      'One-on-one parent guidance consultations',
      'Child behaviour analysis',
      'Parent-child creative bonding activities',
      'Personalised recommendations for your child’s unique needs, with a home-based growth curriculum built on neuro brain development',
    ],
    accent: 'indigo',
  },
  {
    id: 'communities',
    eyebrow: 'For communities & educational organisations',
    title: 'Programmes that scale beyond one child',
    intro:
      'Workshops and collaborative projects for schools, NGOs, libraries and community groups.',
    offerings: [
      'School workshops and enrichment programmes',
      'Child behaviour and learning insights for educators',
      'Storytelling, reading and creative writing initiatives',
      'Customised programmes for schools, NGOs, libraries and community groups',
      'Collaborative projects that foster empathy, creativity, inclusion and mental well-being',
    ],
    accent: 'leaf',
  },
] as const
