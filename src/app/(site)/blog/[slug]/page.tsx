import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Container } from '@/components/ui/Container'
import { ContentImage } from '@/components/ui/ContentImage'
import { Icon } from '@/components/ui/Icon'
import { RichText } from '@/components/ui/RichText'
import { CtaBanner } from '@/components/sections/CtaBanner'
import { JsonLd } from '@/components/JsonLd'
import { SITE_URL, site } from '@/config/site'
import { getBlogPostBySlug, listBlogPosts } from '@/lib/content'
import { formatDate } from '@/lib/date'
import { buildMetadata } from '@/seo/nextMetadata'
import { blogImage, blogPostingSchema, blogSummary } from '@/seo/contentSchemas'
import {
  breadcrumbSchema,
  buildGraph,
  organisationSchema,
  personSchema,
  webPageSchema,
  websiteSchema,
} from '@/seo/structuredData'

export const revalidate = 60
export const dynamicParams = true

type Params = { slug: string }

export async function generateStaticParams(): Promise<Params[]> {
  const posts = await listBlogPosts()
  return posts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params
  const post = await getBlogPostBySlug(slug)
  if (!post) return {}

  const summary = blogSummary(post)
  return buildMetadata({
    title: post.title.length > 45 ? post.title : `${post.title} | ${site.name}`,
    description: summary,
    canonical: `${SITE_URL}/blog/${post.slug}`,
    ogType: 'article',
    ogImage: blogImage(post),
    ogImageAlt: post.bannerImage?.alt || post.title,
    publishedTime: post.date,
    modifiedTime: (post.updatedAt ?? post.date).slice(0, 10),
    authorName: post.author,
  })
}

export default async function BlogDetailPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params
  const post = await getBlogPostBySlug(slug)
  if (!post) notFound()

  const summary = blogSummary(post)
  const allPosts = await listBlogPosts()
  const related = allPosts.filter((entry) => entry.slug !== slug).slice(0, 3)

  const jsonLd = buildGraph([
    organisationSchema(),
    personSchema(),
    websiteSchema(),
    webPageSchema({ path: `/blog/${post.slug}`, name: post.title, description: summary }),
    blogPostingSchema(post),
    breadcrumbSchema([
      { name: 'Home', path: '/' },
      { name: 'Blog', path: '/blog' },
      { name: post.title, path: `/blog/${post.slug}` },
    ]),
  ])

  return (
    <>
      <JsonLd data={jsonLd} />

      <article className="pt-[clamp(120px,16vh,168px)]">
        <header className="pb-10">
          <Container width="narrow">
            <nav aria-label="Breadcrumb" className="eyebrow flex items-center gap-2 text-ink-soft">
              <Link href="/blog" className="footer-link hover:text-ink">
                Blog
              </Link>
              <span aria-hidden>/</span>
              <span aria-current="page" className="text-ink">
                {post.title}
              </span>
            </nav>

            <h1
              className="font-display mt-5 font-medium leading-[1.06] tracking-[-0.02em]"
              style={{ fontSize: 'clamp(2rem, 4.4vw, 3.2rem)' }}
            >
              {post.title}
            </h1>

            {post.shortDescription && <p className="mt-4 text-[1.08rem] text-ink-soft">{post.shortDescription}</p>}

            <p className="eyebrow mt-5 flex flex-wrap items-center gap-2 text-ink-soft">
              <span>{post.author}</span>
              <span aria-hidden>·</span>
              <time dateTime={post.date}>{formatDate(post.date)}</time>
              <span aria-hidden>·</span>
              <span>{post.minuteRead} min read</span>
            </p>
          </Container>
        </header>

        {post.bannerImage && (
          <Container>
            <div className="overflow-hidden rounded-card">
              <ContentImage
                image={post.bannerImage}
                width={1120}
                height={630}
                sizes="(min-width: 74rem) 70rem, 100vw"
                className="w-full object-cover"
                priority
              />
            </div>
          </Container>
        )}

        <section className="py-12 md:py-16">
          <Container width="narrow">
            <RichText html={post.description} />
          </Container>
        </section>
      </article>

      {related.length > 0 && (
        <section className="bg-paper-2 py-16 md:py-20">
          <Container>
            <h2 className="font-display text-[1.5rem] font-semibold">More reading</h2>
            <ul className="mt-8 grid gap-6 sm:grid-cols-3">
              {related.map((entry) => (
                <li key={entry.id}>
                  <Link href={`/blog/${entry.slug}`} className="lift block rounded-card border border-line bg-paper p-6">
                    <span className="eyebrow block text-ink-soft">{formatDate(entry.date)}</span>
                    <span className="font-display mt-2 block text-[1.05rem] font-semibold leading-[1.3]">{entry.title}</span>
                    <span className="arrow-move mt-3 inline-flex items-center gap-1.5 text-[0.88rem] font-medium">
                      Read <Icon name="arrowRight" size={15} className="arrow" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}

      <CtaBanner
        title="Wondering how this applies to your child?"
        body="Every child is different. A first conversation is where we work out what would actually help."
      />
    </>
  )
}
