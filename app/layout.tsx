import './global.css'
import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Navbar } from './components/nav'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import Footer from './components/footer'
import { baseUrl } from './sitemap'
import { SessionProvider } from './components/session-provider'
import { getSession } from '@/lib/auth'

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'theautist.me',
    template: '%s | theautist.me',
  },
  description: 'Personal blog and portfolio.',
  openGraph: {
    title: 'theautist.me',
    description: 'Personal blog and portfolio.',
    url: baseUrl,
    siteName: 'theautist.me',
    locale: 'en_US',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

const cx = (...classes: (string | false | null | undefined)[]) => classes.filter(Boolean).join(' ')

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  return (
    <html
      lang="en"
      className={cx(
        'text-black bg-white dark:text-white dark:bg-black',
        GeistSans.variable,
        GeistMono.variable
      )}
    >
      <body className="antialiased max-w-xl mx-4 mt-8 lg:mx-auto">
        <SessionProvider session={session}>
          <main className="flex-auto min-w-0 mt-6 flex flex-col px-2 md:px-0">
            <Navbar />
            {children}
            <Footer />
            <Analytics />
            <SpeedInsights />
          </main>
        </SessionProvider>
      </body>
    </html>
  )
}
