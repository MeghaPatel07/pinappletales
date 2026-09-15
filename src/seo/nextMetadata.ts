/**
 * Builds a Next.js `Metadata` object from the same fields the old
 * seo.config.ts / PageSeo shape used, so each page.tsx's generateMetadata
 * stays a short, declarative call instead of repeating the Open Graph /
 * Twitter boilerplate nine times.
 */

import type { Metadata } from 'next'
import { site } from '@/config/site'

export type BasicSeo = {
  title: string
  description: string
  canonical: string
  ogType?: 'website' | 'profile' | 'article'
  ogImage: string
  ogImageAlt: string
  noIndex?: boolean
  publishedTime?: string
  modifiedTime?: string
  authorName?: string
}

export function buildMetadata(seo: BasicSeo): Metadata {
  const openGraph: Record<string, unknown> = {
    type: seo.ogType ?? 'website',
    url: seo.canonical,
    siteName: site.name,
    locale: 'en_IN',
    title: seo.title,
    description: seo.description,
    images: [{ url: seo.ogImage, alt: seo.ogImageAlt }],
  }
  if (seo.ogType === 'article') {
    if (seo.publishedTime) openGraph.publishedTime = seo.publishedTime
    if (seo.modifiedTime) openGraph.modifiedTime = seo.modifiedTime
    if (seo.authorName) openGraph.authors = [seo.authorName]
  }

  return {
    title: seo.title,
    description: seo.description,
    alternates: { canonical: seo.canonical },
    robots: seo.noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
    openGraph: openGraph as Metadata['openGraph'],
    twitter: {
      card: 'summary_large_image',
      title: seo.title,
      description: seo.description,
      images: [seo.ogImage],
    },
  }
}
