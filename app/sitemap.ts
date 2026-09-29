import type { MetadataRoute } from 'next';
import { prisma } from '@/lib/db';
import { SITE_URL } from '@/lib/bark-card';

// Rebuilt hourly so new guides show up without a deploy.
export const revalidate = 3600;

const STATIC_PAGES: [path: string, priority: number][] = [
  ['/', 1],
  ['/learn/breeds', 0.8],
  ['/learn/articles', 0.7],
  ['/learn', 0.6],
  ['/tools', 0.6],
  ['/tools/age-calculator', 0.7],
  ['/tools/food-calculator', 0.7],
  ['/celebrations', 0.5],
  ['/premium', 0.5],
  ['/about', 0.4],
  ['/courses/puppy-training', 0.4],
  ['/contact', 0.3],
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [breeds, articles] = await Promise.all([
    prisma.breedProfile.findMany({ select: { slug: true, updatedAt: true } }).catch(() => []),
    prisma.article
      .findMany({ where: { isPublished: true }, select: { slug: true, updatedAt: true } })
      .catch(() => []),
  ]);

  return [
    ...STATIC_PAGES.map(([path, priority]) => ({ url: `${SITE_URL}${path}`, priority })),
    ...breeds.map((b) => ({ url: `${SITE_URL}/learn/breeds/${b.slug}`, lastModified: b.updatedAt, priority: 0.8 })),
    ...articles.map((a) => ({ url: `${SITE_URL}/learn/articles/${a.slug}`, lastModified: a.updatedAt, priority: 0.6 })),
  ];
}
