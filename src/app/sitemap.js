// src/app/sitemap.js - Dynamic XML Sitemap Generation
import { SEED_IDEAS } from '@/lib/seedData';

export default async function sitemap() {
  const baseUrl = 'https://studentearningideas.com';

  const staticRoutes = [
    '',
    '/saved',
    '/privacy',
    '/terms',
    '/disclaimer',
    '/contact'
  ].map(route => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly',
    priority: route === '' ? 1.0 : 0.7
  }));

  const ideaRoutes = SEED_IDEAS.map(idea => ({
    url: `${baseUrl}/idea/${idea.slug}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily',
    priority: 0.9
  }));

  return [...staticRoutes, ...ideaRoutes];
}
