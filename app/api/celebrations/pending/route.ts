
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/db';
import { isAdminEmail } from '@/lib/admin';

// GET /api/celebrations/pending - Fetch pending celebrations for admin review
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!isAdminEmail(session.user.email)) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Fetch pending celebrations
    const celebrations = await prisma.celebration.findMany({
      where: {
        status: 'pending',
      },
      orderBy: {
        submittedAt: 'asc', // oldest first
      },
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Generate fresh signed URLs for all photos
    const { downloadFile } = await import('@/lib/s3');
    const celebrationsWithUrls = await Promise.all(
      celebrations.map(async (celebration) => {
        const photoUrl = await downloadFile(celebration.cloudStoragePath);
        return {
          ...celebration,
          photoUrl,
        };
      })
    );

    return NextResponse.json({
      success: true,
      celebrations: celebrationsWithUrls,
      count: celebrationsWithUrls.length,
    });
  } catch (error) {
    console.error('Error fetching pending celebrations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pending celebrations' },
      { status: 500 }
    );
  }
}
