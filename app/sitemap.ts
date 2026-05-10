import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://zipd.io'
  
  // Define public routes
  const routes = [
    '',
    '/about',
    '/features',
    '/pricing',
    '/security',
    '/analytics',
    '/domains',
    '/contact',
    '/blog',
    '/careers',
    '/privacy',
    '/terms',
    '/dpa',
    '/cookie-policy',
  ]

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: route === '' ? 1 : 0.8,
  }))
}
