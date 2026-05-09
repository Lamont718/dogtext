
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/db';

// GET /api/dogs - Fetch user's dogs
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Fetch user's dogs
    const dogs = await prisma.dog.findMany({
      where: {
        userId: user.id,
        isActive: true,
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        breed: true,
        age: true,
        ageUnit: true,
        weight: true,
        weightUnit: true,
        gender: true,
        personalityTraits: true,
        photoUrl: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      dogs,
    });
  } catch (error) {
    console.error('Error fetching dogs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dogs' },
      { status: 500 }
    );
  }
}
