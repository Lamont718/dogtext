
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const breed = await prisma.breedProfile.findUnique({
      where: { slug: params.slug },
    });

    if (!breed) {
      return NextResponse.json({ error: 'Breed not found' }, { status: 404 });
    }

    return NextResponse.json(breed);
  } catch (error) {
    console.error('Error fetching breed:', error);
    return NextResponse.json(
      { error: 'Failed to fetch breed' },
      { status: 500 }
    );
  }
}
