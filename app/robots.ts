import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard/', '/success', '/api/'],
    },
    sitemap: 'https://linksnip.ca/sitemap.xml',
  }
}
