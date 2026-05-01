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
  title: 'LinkSnip | Global Sovereign Link Infrastructure for Enterprise',
  description: 'The world\'s first isolated link infrastructure. Stop renting from public SaaS. Own your private vault with 100% data sovereignty and infinite global scale.',
  keywords: ['Sovereign Infrastructure', 'Global Link Management', 'Isolated Data Vaults', 'Enterprise URL Shortener', 'SOC2 Infrastructure', 'Data Ownership', 'LinkSnip', 'Global SaaS'],
  metadataBase: new URL('https://linksnip.ca'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Global Data Sovereignty | LinkSnip',
    description: 'Stop funding public infrastructure. Deploy your private, high-performance link engine for global dominance.',
    url: 'https://linksnip.ca',
    siteName: 'LinkSnip',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'LinkSnip — Global Sovereign Link Infrastructure',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Global Data Sovereignty | LinkSnip',
    description: 'Stop funding public infrastructure. Deploy your private, high-performance link engine for global dominance.',
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
      name: 'LinkSnip',
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
  return (
    <ClerkProvider>
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
