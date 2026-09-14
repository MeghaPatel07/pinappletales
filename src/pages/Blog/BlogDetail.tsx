import { useCallback, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Container } from '@/components/ui/Container'
import { ContentImage } from '@/components/ui/ContentImage'
import { Icon } from '@/components/ui/Icon'
import { RichText } from '@/components/ui/RichText'
import { Section } from '@/components/ui/Section'
import { CtaBanner } from '@/components/sections/CtaBanner'
import { SITE_URL, site } from '@/config/site'
import { getBlogPostBySlug, listBlogPosts } from '@/content/api'
import { snapshotKeys } from '@/content/snapshot'
import { useContent } from '@/content/useContent'
import { formatDate } from '@/lib/date'
import { DynamicSeo } from '@/seo/Seo'
import { blogImage, blogPostingSchema, blogSummary } from '@/seo/contentSchemas'
import {
  breadcrumbSchema,
  buildGraph,
  organisationSchema,
  personSchema,
  webPageSchema,
  websiteSchema,
} from '@/seo/structuredData'
import type { BlogPost } from '@/types/content'
import NotFound from '@/pages/NotFound/NotFound'
import styles from './Blog.module.css'

export default function BlogDetail() {
  const { slug = '' } = useParams<{ slug: string }>()

  const load = useCallback(() => getBlogPostBySlug(slug), [slug])
  const { data: post, loading, failed } = useContent<BlogPost | null>(
    snapshotKeys.blogPost(slug),
    load,
  )

  // Loaded alongside the article so the "more reading" strip is ready when the
  // reader reaches the end of the page.
  const loadAll = useCallback(() => listBlogPosts(), [])
  const { data: allPosts } = useContent<BlogPost[]>(snapshotKeys.blogIndex, loadAll)

  const related = useMemo(
    () => (allPosts ?? []).filter((entry) => entry.slug !== slug).slice(0, 3),
    [allPosts, slug],
  )

  if (loading) {
    return (
      <Section>
        <Container width="narrow">
          <p className={styles.status}>Loading article…</p>
        </Container>
      </Section>
    )
  }

  // Genuinely absent, not merely unreachable — show the site's 404 so the
  // status and the page agree.
  if (!post) {
    if (failed) {
      return (
        <Section>
          <Container width="narrow">
            <p className={styles.status}>
              This article could not be loaded just now. Please refresh the page.
            </p>
          </Container>
        </Section>
      )
    }
    return <NotFound />
  }

  const canonical = `${SITE_URL}/blog/${post.slug}`
  const summary = blogSummary(post)

  return (
    <>
      <DynamicSeo
        title={`${post.title} | ${site.name}`}
        description={summary}
        canonical={canonical}
        ogType="article"
        ogImage={blogImage(post)}
        ogImageAlt={post.bannerImage?.alt || post.title}
        publishedTime={post.date}
        modifiedTime={post.updatedAt ?? post.date}
        author={post.author}
        jsonLd={buildGraph([
          organisationSchema(),
          personSchema(),
          websiteSchema(),
          webPageSchema({
            path: `/blog/${post.slug}`,
            name: post.title,
            description: summary,
          }),
          blogPostingSchema(post),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Blog', path: '/blog' },
            { name: post.title, path: `/blog/${post.slug}` },
          ]),
        ])}
      />

      <article className={styles.article}>
        <header className={styles.articleHeader}>
          <Container width="narrow">
            <nav aria-label="Breadcrumb" className={styles.crumbs}>
              <Link to="/blog" className={styles.crumbLink}>
                Blog
              </Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page">{post.title}</span>
            </nav>

            <h1 className={styles.articleTitle}>{post.title}</h1>

            {post.shortDescription && (
              <p className={styles.articleLead}>{post.shortDescription}</p>
            )}

            <p className={styles.articleMeta}>
              <span>{post.author}</span>
              <span aria-hidden="true">·</span>
              <time dateTime={post.date}>{formatDate(post.date)}</time>
              <span aria-hidden="true">·</span>
              <span>{post.minuteRead} min read</span>
            </p>
          </Container>
        </header>

        {post.bannerImage && (
          <Container>
            <div className={styles.banner}>
              <ContentImage
                image={post.bannerImage}
                width={1120}
                height={630}
                sizes="(min-width: 74rem) 70rem, 100vw"
                className={styles.bannerImage}
                priority
              />
            </div>
          </Container>
        )}

        <Section size="compact">
          <Container width="narrow">
            <RichText html={post.description} />
          </Container>
        </Section>
      </article>

      {related.length > 0 && (
        <Section tone="alt">
          <Container>
            <h2 className={styles.relatedHeading}>More reading</h2>
            <ul className={styles.relatedGrid}>
              {related.map((entry) => (
                <li key={entry.id}>
                  <Link to={`/blog/${entry.slug}`} className={styles.relatedCard}>
                    <span className={styles.relatedDate}>{formatDate(entry.date)}</span>
                    <span className={styles.relatedTitle}>{entry.title}</span>
                    <span className={styles.readMore}>
                      Read
                      <Icon name="arrowRight" size={15} />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </Section>
      )}

      <CtaBanner
        title="Wondering how this applies to your child?"
        body="Every child is different. A first conversation is where we work out what would actually help."
      />
    </>
  )
}
