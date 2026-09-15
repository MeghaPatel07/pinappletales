import type { Metadata } from 'next'
import { DM_Mono, Fraunces, Work_Sans } from 'next/font/google'
import { AuthProvider } from '@/admin/auth/AuthProvider'
import { ToastProvider } from '@/admin/components/Toast'
import '@/styles/globals.css'

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-fraunces',
  display: 'swap',
})

const workSans = Work_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-work-sans',
  display: 'swap',
})

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-dm-mono',
  display: 'swap',
})

/**
 * The admin has its own root layout — no public Header/Footer, and it must
 * never be indexed. A second <html>/<body> here (rather than nesting inside
 * the public (site) root layout) is what Next.js calls "multiple root
 * layouts": /admin and the public site share no layout above this point.
 */
export const metadata: Metadata = {
  title: 'Admin | Pineappletales',
  robots: { index: false, follow: false },
}

// The whole admin section is session-gated and reads the URL query string
// for table state (search/sort/page) — always dynamic, never statically
// generated at build time.
export const dynamic = 'force-dynamic'

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${workSans.variable} ${dmMono.variable}`}>
      <body className="bg-paper-2 text-ink">
        <AuthProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
