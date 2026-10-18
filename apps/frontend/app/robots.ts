import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.awesomeprojects.in').replace(/\/+$/, '')

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard/', '/api/', '/auth/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
