
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/db';
import { uploadFile } from '@/lib/s3';

// POST /api/celebrations - Submit new celebration
export async function POST(req: NextRequest) {
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

    // Check if user is Premium or Family tier
    if (user.subscriptionTier === 'FREE') {
      return NextResponse.json(
        { error: 'Premium subscription required to submit celebrations' },
        { status: 403 }
      );
    }

    // Parse form data
    const formData = await req.formData();
    const dogId = formData.get('dogId') as string;
    const milestoneType = formData.get('milestoneType') as string;
    const caption = formData.get('caption') as string;
    const milestoneDate = formData.get('milestoneDate') as string;
    const photo = formData.get('photo') as File;

    // Validation
    if (!dogId || !milestoneType || !caption || !milestoneDate || !photo) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate caption length
    if (caption.length > 100) {
      return NextResponse.json(
        { error: 'Caption must be 100 characters or less' },
        { status: 400 }
      );
    }

    // Validate milestone type
    const validMilestoneTypes = [
      'birthday',
      'adoption_anniversary',
      'gotcha_day',
      'training_achievement',
      'health_milestone',
    ];
    if (!validMilestoneTypes.includes(milestoneType)) {
      return NextResponse.json(
        { error: 'Invalid milestone type' },
        { status: 400 }
      );
    }

    // Validate photo file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(photo.type)) {
      return NextResponse.json(
        { error: 'Photo must be JPEG, PNG, or WebP format' },
        { status: 400 }
      );
    }

    // Validate photo size (max 5MB)
    if (photo.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Photo must be less than 5MB' },
        { status: 400 }
      );
    }

    // Get dog to verify ownership and get info
    const dog = await prisma.dog.findUnique({
      where: { id: dogId },
    });

    if (!dog) {
      return NextResponse.json(
        { error: 'Dog not found' },
        { status: 404 }
      );
    }

    if (dog.userId !== user.id) {
      return NextResponse.json(
        { error: 'You can only submit celebrations for your own dogs' },
        { status: 403 }
      );
    }

    // Upload photo to S3
    const buffer = Buffer.from(await photo.arrayBuffer());
    const fileName = `celebrations/${Date.now()}-${photo.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const cloudStoragePath = await uploadFile(buffer, fileName);

    // Generate a signed URL for the photo (valid for 7 days)
    const { downloadFile } = await import('@/lib/s3');
    const photoUrl = await downloadFile(cloudStoragePath);

    // Create celebration record
    const celebration = await prisma.celebration.create({
      data: {
        userId: user.id,
        dogId: dog.id,
        dogName: dog.name,
        dogBreed: dog.breed,
        milestoneType,
        caption,
        milestoneDate: new Date(milestoneDate),
        photoUrl,
        cloudStoragePath,
        status: 'pending', // Requires admin approval
      },
    });

    return NextResponse.json({
      success: true,
      celebration,
      message: 'Celebration submitted successfully! It will appear in the gallery once approved by our team.',
    });
  } catch (error) {
    console.error('Error submitting celebration:', error);
    return NextResponse.json(
      { error: 'Failed to submit celebration' },
      { status: 500 }
    );
  }
}

// GET /api/celebrations - Fetch approved celebrations with filtering
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const milestoneType = searchParams.get('milestoneType');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build where clause
    const where: any = {
      status: 'approved',
    };

    if (milestoneType && milestoneType !== 'all') {
      where.milestoneType = milestoneType;
    }

    // Fetch celebrations
    const celebrations = await prisma.celebration.findMany({
      where,
      orderBy: {
        milestoneDate: 'desc',
      },
      take: limit,
      skip: offset,
      select: {
        id: true,
        dogName: true,
        dogBreed: true,
        milestoneType: true,
        caption: true,
        milestoneDate: true,
        cloudStoragePath: true,
        submittedAt: true,
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
          cloudStoragePath: undefined, // Don't expose S3 keys to client
        };
      })
    );

    // Get total count for pagination
    const total = await prisma.celebration.count({ where });

    return NextResponse.json({
      success: true,
      celebrations: celebrationsWithUrls,
      total,
      hasMore: offset + celebrations.length < total,
    });
  } catch (error) {
    console.error('Error fetching celebrations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch celebrations' },
      { status: 500 }
    );
  }
}
