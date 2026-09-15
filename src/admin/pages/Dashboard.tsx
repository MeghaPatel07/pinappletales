'use client'

import { useCallback, useMemo } from 'react'
import Link from 'next/link'
import { isCloudinaryConfigured } from '@/lib/cloudinary'
import { isUpcoming } from '@/lib/date'
import { toBlogPost, toEventItem, toEventRegistration, toPodcast } from '@/lib/mappers'
import type { RawDocument } from '@/lib/apiTypes'
import {
  COLLECTIONS,
  type BlogPost,
  type EventItem,
  type EventRegistration,
  type Podcast,
} from '@/types/content'
import { useAuth } from '../auth/AuthProvider'
import { PageHeader } from '../components/PageHeader'
import { useCollection } from '../hooks/useCollection'
import styles from './shared.module.css'

type Stat = {
  to: string
  label: string
  value: number
  meta: string
}

export function Dashboard() {
  const { session } = useAuth()

  const mapBlog = useCallback((doc: RawDocument) => toBlogPost(doc), [])
  const mapEvent = useCallback((doc: RawDocument) => toEventItem(doc), [])
  const mapPodcast = useCallback((doc: RawDocument) => toPodcast(doc), [])
  const mapRegistration = useCallback((doc: RawDocument) => toEventRegistration(doc), [])

  const blogs = useCollection<BlogPost>(COLLECTIONS.blogs, mapBlog, {
    orderByField: 'date',
    direction: 'desc',
  })
  const events = useCollection<EventItem>(COLLECTIONS.events, mapEvent, {
    orderByField: 'date',
    direction: 'desc',
  })
  const podcasts = useCollection<Podcast>(COLLECTIONS.podcasts, mapPodcast, {
    orderByField: 'date',
    direction: 'desc',
  })
  const registrations = useCollection<EventRegistration>(
    COLLECTIONS.eventRegistrations,
    mapRegistration,
    { orderByField: 'createdAt', direction: 'desc' },
  )

  const stats = useMemo<Stat[]>(() => {
    const published = <T extends { isActive: boolean }>(items: T[]) =>
      items.filter((item) => item.isActive).length

    return [
      {
        to: '/admin/blogs',
        label: 'Blog posts',
        value: blogs.items.length,
        meta: `${published(blogs.items)} published`,
      },
      {
        to: '/admin/events',
        label: 'Events',
        value: events.items.length,
        meta: `${events.items.filter((event) => isUpcoming(event.date)).length} upcoming`,
      },
      {
        to: '/admin/podcasts',
        label: 'Podcast episodes',
        value: podcasts.items.length,
        meta: `${published(podcasts.items)} published`,
      },
      {
        to: '/admin/registrations',
        label: 'Registrations',
        value: registrations.items.length,
        meta: 'across all events',
      },
    ]
  }, [blogs.items, events.items, podcasts.items, registrations.items])

  const setupIssues = [
    !isCloudinaryConfigured() &&
      'Cloudinary: add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET to .env.',
  ].filter((issue): issue is string => Boolean(issue))

  const recentPosts = blogs.items.slice(0, 5)

  return (
    <>
      <PageHeader
        title={`Welcome back, ${session?.name ?? 'Admin'}`}
        description="Everything published here appears on the website immediately."
      />

      {setupIssues.length > 0 && (
        <div className={styles.setupPanel}>
          <h2 className={styles.setupTitle}>Finish the setup</h2>
          <div className={styles.setupList}>
            {setupIssues.map((issue) => (
              <p key={issue}>{issue}</p>
            ))}
            <p>Restart the dev server after editing <code>.env</code>.</p>
          </div>
        </div>
      )}

      <h2 className={styles.sectionTitle}>At a glance</h2>

      <div className={styles.statGrid}>
        {stats.map((stat) => (
          <Link key={stat.to} href={stat.to} className={styles.statCard}>
            <span className={styles.statValue}>{stat.value}</span>
            <span className={styles.statLabel}>{stat.label}</span>
            <span className={styles.statMeta}>{stat.meta}</span>
          </Link>
        ))}
      </div>

      {recentPosts.length > 0 && (
        <>
          <h2 className={styles.sectionTitle}>Latest posts</h2>
          <div className={styles.statGrid}>
            {recentPosts.map((post) => (
              <Link
                key={post.id}
                href={`/admin/blogs/${post.id}`}
                className={styles.statCard}
              >
                <span className={styles.statLabel}>{post.title || 'Untitled'}</span>
                <span className={styles.statMeta}>
                  {post.isActive ? 'Published' : 'Draft'} · {post.date}
                </span>
              </Link>
            ))}
          </div>
        </>
      )}
    </>
  )
}
