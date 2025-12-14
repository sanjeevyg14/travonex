import { MetadataRoute } from 'next'
import { initialTrips, initialBlogStories, initialExperiences } from '@/lib/data'

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = 'https://travonex.app';

  // Get all trips routes
  const tripRoutes = initialTrips
    .filter(trip => trip.status === 'published')
    .map(trip => ({
      url: `${siteUrl}/discover/${trip.slug}`,
      lastModified: new Date().toISOString(),
    }));
    
  // Get all experience routes
  const experienceRoutes = initialExperiences
    .map(exp => ({
        url: `${siteUrl}/experiences/${exp.slug}`,
        lastModified: new Date().toISOString(), // In a real app, use the actual last modified date
    }));

  const blogRoutes = initialBlogStories.map(story => ({
    url: `${siteUrl}/blog/${story.slug}`,
    lastModified: new Date(story.date).toISOString(),
  }));

  // Define static routes
  const staticRoutes = [
    '/',
    '/discover',
    '/experiences',
    '/deals',
    '/ai-planner',
    '/pro',
    '/blog',
    '/faq',
    '/login',
    '/signup',
  ].map(route => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date().toISOString(),
  }));

  return [...staticRoutes, ...tripRoutes, ...experienceRoutes, ...blogRoutes];
}
