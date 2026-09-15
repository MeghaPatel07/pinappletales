import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/config/site'
import { listBlogPosts, listEvents } from '@/lib/content'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, events] = await Promise.all([listBlogPosts(), listEvents()])
  const today = new Date().toISOString().split('T')[0]

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: today, changeFrequency: 'monthly', priority: 1.0 },
    { url: `${SITE_URL}/about`, lastModified: today, changeFrequency: 'yearly', priority: 0.8 },
    { url: `${SITE_URL}/services`, lastModified: today, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE_URL}/contact`, lastModified: today, changeFrequency: 'yearly', priority: 0.7 },
    { url: `${SITE_URL}/blog`, lastModified: today, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/events`, lastModified: today, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/podcast`, lastModified: today, changeFrequency: 'weekly', priority: 0.7 },
  ]

  const blogPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: (post.updatedAt ?? post.date).slice(0, 10) || today,
    changeFrequency: 'yearly',
    priority: 0.6,
  }))

  const eventPages: MetadataRoute.Sitemap = events.map((event) => ({
    url: `${SITE_URL}/events/${event.slug}`,
    lastModified: (event.updatedAt ?? event.date).slice(0, 10) || today,
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  return [...staticPages, ...blogPages, ...eventPages]
}
