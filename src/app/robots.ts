import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard', '/agency-dashboard', '/admin', '/login', '/signup', '/forgot-password', '/info', '/api/'],
      }
    ],
    sitemap: 'https://www.internationalescorts.com/sitemap.xml',
  }
}
