
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');
    const search = searchParams.get('search');
    const limit = searchParams.get('limit');

    const where: any = { isPublished: true };

    if (category && category !== 'all') {
      where.category = category;
    }

    if (featured === 'true') {
      where.isFeatured = true;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { tags: { hasSome: [search] } },
      ];
    }

    const articles = await prisma.article.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      take: limit ? parseInt(limit) : undefined,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        category: true,
        readTime: true,
        author: true,
        imageUrl: true,
        imageAlt: true,
        tags: true,
        publishedAt: true,
        viewCount: true,
        isFeatured: true,
      },
    });

    return NextResponse.json(articles);
  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    );
  }
}
