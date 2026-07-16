import type { Metadata, Viewport } from 'next'
import { Space_Grotesk, Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from 'next-themes'
import './globals.css'
import { LanguageProvider } from '@/lib/i18n/context'

const spaceGrotesk = Space_Grotesk({ 
  subsets: ["latin"],
  variable: '--font-heading'
});
const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-body'
});

export const metadata: Metadata = {
  title: 'Zipd | Institutional Link Infrastructure for Enterprise',
  description: 'The world\'s first sovereign link infrastructure. Stop renting from public SaaS. Own your private network with 100% data ownership and infinite global scale.',
  keywords: ['Institutional Infrastructure', 'Sovereign Link Management', 'Isolated Data Network', 'Enterprise URL Shortener', 'SOC2 Infrastructure', 'Data Ownership', 'Zipd', 'Global SaaS', 'Link Buyout', 'Bitly Alternative', 'Enterprise Link Shortener', 'Secure Link Management', 'Self-hosted URL Shortener'],
  metadataBase: new URL('https://zipd.io'),
  authors: [{ name: 'Northern Ventures' }],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Sovereign Data Ownership | Zipd',
    description: 'The world\'s first sovereign link infrastructure. Own your private network with 100% data ownership.',
    url: 'https://zipd.io',
    siteName: 'Zipd',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Zipd — Sovereign Institutional Link Infrastructure',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sovereign Data Ownership | Zipd',
    description: 'The world\'s first sovereign link infrastructure. Own your private network with 100% data ownership.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
  other: {
    'application/ld+json': JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'Zipd',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      description: 'The world\'s first isolated link infrastructure. Own your private vault with 100% data sovereignty.',
      offers: {
        '@type': 'Offer',
        price: '999.00',
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
      },
      featureList: [
        'Isolated Neon PostgreSQL Database',
        'Clerk-Secured Edge Middleware',
        '100% Data Ownership',
        'SOC2 & GDPR Compliance',
        'Infinite Custom Domains',
      ],
    }),
  },
}

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
}

import { ClerkProvider } from '@clerk/nextjs'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

  return (
    <ClerkProvider
      publishableKey={publishableKey}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      afterSignOutUrl="/"
    >
      <html lang="en" suppressHydrationWarning>
        <body className={`${spaceGrotesk.variable} ${inter.variable} font-sans antialiased`}>
          <LanguageProvider>
            <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
              {children}
            </ThemeProvider>
          </LanguageProvider>
          {process.env.NODE_ENV === 'production' && <Analytics />}
        </body>
      </html>
    </ClerkProvider>
  )
}
