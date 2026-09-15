import type { Metadata } from 'next'
import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import { ContentImage } from '@/components/ui/ContentImage'
import { Icon } from '@/components/ui/Icon'
import { PageHero } from '@/components/sections/PageHero'
import { CtaBanner } from '@/components/sections/CtaBanner'
import { JsonLd } from '@/components/JsonLd'
import { listBlogPosts } from '@/lib/content'
import { formatDate } from '@/lib/date'
import { SITE_URL, site } from '@/config/site'
import { buildMetadata } from '@/seo/nextMetadata'
import { blogSummary, itemListSchema } from '@/seo/contentSchemas'
import {
  breadcrumbSchema,
  buildGraph,
  organisationSchema,
  personSchema,
  webPageSchema,
  websiteSchema,
} from '@/seo/structuredData'
import type { BlogPost } from '@/types/content'

export const revalidate = 60

const OG_IMAGE = `${SITE_URL}/og-image.jpg`

export const metadata: Metadata = buildMetadata({
  title: 'Blog | Child Development, Art Therapy & Reading Ideas',
  description:
    'Writing from Kenaa Jadeja on child behaviour, Neuro-Art Therapy, Bibliotherapy and creative practice at home — practical ideas for parents, teachers and anyone raising a curious mind.',
  canonical: `${SITE_URL}/blog`,
  ogType: 'website',
  ogImage: OG_IMAGE,
  ogImageAlt: `The ${site.name} blog`,
})

function PostMeta({ post }: { post: BlogPost }) {
  return (
    <p className="eyebrow flex items-center gap-2 text-ink-soft">
      <time dateTime={post.date}>{formatDate(post.date)}</time>
      <span aria-hidden>·</span>
      <span>{post.minuteRead} min read</span>
    </p>
  )
}

export default async function BlogIndexPage() {
  const posts = await listBlogPosts()
  const primaryPost = posts.find((post) => post.isPrimary)
  const rest = posts.filter((post) => !post.isPrimary)

  const jsonLd = buildGraph([
    organisationSchema(),
    personSchema(),
    websiteSchema(),
    webPageSchema({
      path: '/blog',
      name: `Blog — ${site.name}`,
      description: 'Articles on child development, art therapy and reading, written by Kenaa Jadeja.',
      type: 'CollectionPage',
    }),
    breadcrumbSchema([
      { name: 'Home', path: '/' },
      { name: 'Blog', path: '/blog' },
    ]),
    itemListSchema(
      `Articles from ${site.name}`,
      posts.map((post) => ({ url: `${SITE_URL}/blog/${post.slug}`, name: post.title })),
    ),
  ])

  return (
    <>
      <JsonLd data={jsonLd} />

      {primaryPost ? (
        <section className="reveal is-in relative mt-[clamp(78px,10vh,104px)]">
          <Link href={`/blog/${primaryPost.slug}`} className="img-zoom group relative block h-[420px] overflow-hidden md:h-[520px]">
            {primaryPost.bannerImage ? (
              <ContentImage image={primaryPost.bannerImage} width={1800} height={720} sizes="100vw" className="h-full w-full object-cover" priority />
            ) : (
              <div className="h-full w-full bg-paper-2" aria-hidden />
            )}
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(180deg, rgba(28,22,15,0.1) 30%, rgba(28,22,15,0.82) 100%)' }}
            />
            <div className="container-1200 absolute inset-x-0 bottom-0 pb-10 text-paper md:pb-14">
              <h1 className="font-display max-w-[24ch] font-medium leading-[1.1]" style={{ fontSize: 'clamp(1.9rem, 4vw, 3rem)' }}>
                {primaryPost.title}
              </h1>
              <span className="arrow-move mt-4 inline-flex items-center gap-1.5 text-[0.92rem] font-medium uppercase tracking-[0.1em]">
                Read more <Icon name="arrowRight" size={14} className="arrow" />
              </span>
            </div>
          </Link>
        </section>
      ) : (
        <PageHero
          eyebrow="Writing"
          title="Notes on children, art and stories"
          lead="Practical thinking on child development, Neuro-Art Therapy and Bibliotherapy — written for parents, teachers and anyone raising a curious mind."
          crumbs={[{ label: 'Home', to: '/' }, { label: 'Blog' }]}
        />
      )}

      <section className="reveal bg-paper py-16 md:py-24">
        <Container>
          {posts.length === 0 && <p className="text-ink-soft">The first articles are being written. Do check back soon.</p>}

          {rest.length > 0 && (
            <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((post) => (
                <li key={post.id}>
                  <article className="lift img-zoom overflow-hidden rounded-card border border-line bg-card">
                    <Link href={`/blog/${post.slug}`}>
                      {post.bannerImage ? (
                        <ContentImage
                          image={post.bannerImage}
                          width={420}
                          height={236}
                          sizes="(min-width: 64rem) 22rem, (min-width: 40rem) 45vw, 100vw"
                          className="aspect-[16/9] w-full object-cover"
                        />
                      ) : (
                        <div className="aspect-[16/9] w-full bg-paper-2" aria-hidden />
                      )}

                      <div className="p-6">
                        <PostMeta post={post} />
                        <h2 className="font-display mt-3 text-[1.2rem] font-semibold leading-[1.25]">{post.title}</h2>
                        <p className="mt-2 text-[0.94rem] leading-relaxed text-ink-soft">{blogSummary(post)}</p>
                      </div>
                    </Link>
                  </article>
                </li>
              ))}
            </ul>
          )}
        </Container>
      </section>

      <CtaBanner
        title="Have a question about your child?"
        body="If something you have read here sounds familiar, a conversation is the best place to start."
      />
    </>
  )
}
