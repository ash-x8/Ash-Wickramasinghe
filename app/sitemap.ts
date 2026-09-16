import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://ash-wickramasinghe.site';
  return ['', '/about', '/projects', '/cv', '/contact', '/admin'].map(path => ({ url: `${base}${path}`, lastModified: new Date(), changeFrequency: path === '' ? 'weekly' : 'monthly', priority: path === '' ? 1 : 0.7 }));
}
