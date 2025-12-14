import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/management/', '/organizer/'],
    },
    sitemap: 'https://travonex.app/sitemap.xml',
  }
}
