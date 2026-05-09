
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const limit = searchParams.get('limit');

    const where: any = {};

    if (search) {
      where.OR = [
        { breedName: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { temperament: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category === 'popular') {
      where.isPopular = true;
    } else if (category) {
      where.sizeCategory = category;
    }

    const breeds = await prisma.breedProfile.findMany({
      where,
      orderBy: { breedName: 'asc' },
      take: limit ? parseInt(limit) : undefined,
    });

    return NextResponse.json(breeds);
  } catch (error) {
    console.error('Error fetching breeds:', error);
    return NextResponse.json(
      { error: 'Failed to fetch breeds' },
      { status: 500 }
    );
  }
}
