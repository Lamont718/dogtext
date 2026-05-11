import { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '../lib/auth-config';
import { prisma } from '../lib/db';
import HomePageContent from './homepage-content';

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  // Get featured content
  const [featuredArticles, popularBreeds, recentArticles, sampleBarks] = await Promise.all([
    prisma.article.findMany({
      where: { isFeatured: true, isPublished: true },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        category: true,
        readTime: true,
        author: true,
        imageUrl: true,
        publishedAt: true,
      },
      take: 3,
      orderBy: { publishedAt: 'desc' },
    }),
    prisma.breedProfile.findMany({
      where: { isPopular: true },
      select: {
        id: true,
        breedName: true,
        slug: true,
        description: true,
        imageUrl: true,
        temperament: true,
        sizeCategory: true,
        energyLevel: true,
      },
      take: 6,
      orderBy: { breedName: 'asc' },
    }),
    prisma.article.findMany({
      where: { isPublished: true },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        category: true,
        readTime: true,
        author: true,
        imageUrl: true,
        publishedAt: true,
      },
      take: 3,
      orderBy: { publishedAt: 'desc' },
    }),
    prisma.dailyBark
      .findMany({
        where: { user: { email: 'samples@dogtext.local' } },
        select: {
          id: true,
          messageText: true,
          dog: { select: { name: true, breed: true } },
        },
        take: 6,
        orderBy: { createdAt: 'asc' },
      })
      .catch(() => []),
  ]);

  return (
    <Suspense fallback={<div className="animate-pulse">Loading...</div>}>
      <HomePageContent
        session={session}
        featuredArticles={featuredArticles}
        popularBreeds={popularBreeds}
        recentArticles={recentArticles}
        sampleBarks={sampleBarks}
      />
    </Suspense>
  );
}