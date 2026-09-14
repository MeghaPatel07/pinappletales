import { useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Container } from '@/components/ui/Container'
import { ContentImage } from '@/components/ui/ContentImage'
import { Icon } from '@/components/ui/Icon'
import { Section } from '@/components/ui/Section'
import { PageHero } from '@/components/sections/PageHero'
import { CtaBanner } from '@/components/sections/CtaBanner'
import { listBlogPosts } from '@/content/api'
import { snapshotKeys } from '@/content/snapshot'
import { useContent } from '@/content/useContent'
import { formatDate } from '@/lib/date'
import { blogSummary } from '@/seo/contentSchemas'
import type { BlogPost } from '@/types/content'
import styles from './Blog.module.css'

export default function BlogIndex() {
  const load = useCallback(() => listBlogPosts(), [])
  const { data, loading, failed } = useContent<BlogPost[]>(
    snapshotKeys.blogIndex,
    load,
  )

  const posts = useMemo(() => data ?? [], [data])

  const primaryPost = useMemo(() => posts.find((post) => post.isPrimary), [posts])
  const rest = useMemo(() => posts.filter((post) => !post.isPrimary), [posts])

  return (
    <>
      {primaryPost ? (
        <section className={styles.primaryBanner}>
          <Link to={`/blog/${primaryPost.slug}`} className={styles.primaryBannerLink}>
            {primaryPost.bannerImage ? (
              <ContentImage
                image={primaryPost.bannerImage}
                width={1800}
                height={720}
                sizes="100vw"
                className={styles.primaryBannerImage}
                priority
              />
            ) : (
              <div className={styles.primaryBannerFallback} aria-hidden="true" />
            )}
            <div className={styles.primaryBannerOverlay} />
            <div className={styles.primaryBannerContent}>
              <h1>{primaryPost.title}</h1>
              <span className={styles.primaryReadMore}>READ MORE <Icon name="arrowRight" size={14} /></span>
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

      <Section>
        <Container>
          {loading && <p className={styles.status}>Loading articles…</p>}

          {!loading && failed && (
            <p className={styles.status}>
              The articles could not be loaded just now. Please refresh the page.
            </p>
          )}

          {!loading && !failed && posts.length === 0 && (
            <p className={styles.status}>
              The first articles are being written. Do check back soon.
            </p>
          )}

          {rest.length > 0 && (
            <ul className={styles.grid}>
              {rest.map((post) => (
                <li key={post.id}>
                  <article className={styles.card}>
                    <Link to={`/blog/${post.slug}`} className={styles.cardLink}>
                      {post.bannerImage ? (
                        <ContentImage
                          image={post.bannerImage}
                          width={420}
                          height={236}
                          sizes="(min-width: 64rem) 22rem, (min-width: 40rem) 45vw, 100vw"
                          className={styles.cardImage}
                        />
                      ) : (
                        <div className={styles.cardImagePlaceholder} aria-hidden="true" />
                      )}

                      <div className={styles.cardBody}>
                        <PostMeta post={post} />
                        <h2 className={styles.cardTitle}>{post.title}</h2>
                        <p className={styles.cardSummary}>{blogSummary(post)}</p>
                      </div>
                    </Link>
                  </article>
                </li>
              ))}
            </ul>
          )}
        </Container>
      </Section>

      <CtaBanner
        title="Have a question about your child?"
        body="If something you have read here sounds familiar, a conversation is the best place to start."
      />
    </>
  )
}

function PostMeta({ post, featured }: { post: BlogPost; featured?: boolean }) {
  return (
    <p className={styles.meta}>
      {featured && <span className={styles.featuredTag}>Featured</span>}
      <time dateTime={post.date}>{formatDate(post.date)}</time>
      <span aria-hidden="true">·</span>
      <span>{post.minuteRead} min read</span>
    </p>
  )
}
