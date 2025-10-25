import './global.css'
import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Navbar } from './components/nav'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import Footer from './components/footer'
import { baseUrl } from './sitemap'
import { GrowthBookProviderWrapper } from './components/growthbook-provider'
import { StructuredData } from './components/structured-data'

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'theautist.me - Developer Portfolio & Projects',
    template: '%s | theautist.me',
  },
  description: 'Personal portfolio showcasing software development projects, AWFixerOS engineering work, and innovative tech solutions. Join the community on Discord.',
  keywords: ['developer', 'portfolio', 'AWFixerOS', 'software engineering', 'projects', 'tech', 'programming'],
  authors: [{ name: 'theautist' }],
  creator: 'theautist',
  publisher: 'theautist',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'mask-icon', url: '/safari-pinned-tab.svg', color: '#000000' },
    ],
  },
  manifest: '/site.webmanifest',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: baseUrl,
    title: 'theautist.me - Developer Portfolio & Projects',
    description: 'Personal portfolio showcasing software development projects, AWFixerOS engineering work, and innovative tech solutions.',
    siteName: 'theautist.me',
    images: [
      {
        url: '/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'theautist.me - Developer Portfolio',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'theautist.me - Developer Portfolio & Projects',
    description: 'Personal portfolio showcasing software development projects, AWFixerOS engineering work, and innovative tech solutions.',
    images: ['/og-image.svg'],
    creator: '@theautist',
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
  verification: {
    google: 'your-google-verification-code',
  },
}

const cx = (...classes: (string | false | null | undefined)[]) => classes.filter(Boolean).join(' ')

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={cx(
        'bg-black text-white',
        GeistSans.variable,
        GeistMono.variable
      )}
    >
      <body className="antialiased max-w-xl mx-4 mt-8 lg:mx-auto bg-black">
        <StructuredData />
        <GrowthBookProviderWrapper>
          <main className="flex-auto min-w-0 mt-6 flex flex-col px-2 md:px-0">
            <Navbar />
            {children}
            <Footer />
            <Analytics />
            <SpeedInsights />
          </main>
        </GrowthBookProviderWrapper>
      </body>
    </html>
  )
}
