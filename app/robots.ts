import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/bark-card';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Private or per-member pages: nothing for a search engine there.
      disallow: ['/api/', '/dashboard', '/chat', '/admin', '/auth/'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
