
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/db';

const MILESTONE_TYPES = [
  'birthday',
  'adoption_anniversary',
  'gotcha_day',
  'training_achievement',
  'health_milestone',
];
// The browser shrinks photos to a 1080px JPEG before upload (lib/dog-photo.ts).
const MAX_PHOTO_BYTES = 1.5 * 1024 * 1024;
// Everything waits for review; this keeps one person from flooding the queue.
const MAX_PENDING = 3;

// POST /api/celebrations - Submit a new celebration (any member; reviewed before it shows)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    const formData = await req.formData();
    const dogId = String(formData.get('dogId') || '');
    const milestoneType = String(formData.get('milestoneType') || '');
    const caption = String(formData.get('caption') || '').trim();
    const milestoneDate = String(formData.get('milestoneDate') || '');
    const photo = formData.get('photo');

    if (!dogId || !milestoneType || !caption || !milestoneDate || !(photo instanceof Blob)) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }
    if (caption.length > 100) {
      return NextResponse.json({ error: 'Caption must be 100 characters or less' }, { status: 400 });
    }
    if (!MILESTONE_TYPES.includes(milestoneType)) {
      return NextResponse.json({ error: 'Invalid milestone type' }, { status: 400 });
    }
    const date = new Date(milestoneDate);
    if (Number.isNaN(date.getTime())) {
      return NextResponse.json({ error: 'Invalid date' }, { status: 400 });
    }

    const data = Buffer.from(await photo.arrayBuffer());
    if (data.length === 0 || data.length > MAX_PHOTO_BYTES) {
      return NextResponse.json({ error: 'That photo is too large. Try another one.' }, { status: 413 });
    }
    // JPEG files start FF D8 FF.
    if (data[0] !== 0xff || data[1] !== 0xd8 || data[2] !== 0xff) {
      return NextResponse.json({ error: 'Photo must be a JPEG.' }, { status: 415 });
    }

    const [dog, pending] = await Promise.all([
      prisma.dog.findFirst({ where: { id: dogId, userId, isActive: true } }),
      prisma.celebration.count({ where: { userId, status: 'pending' } }),
    ]);
    if (!dog) {
      return NextResponse.json({ error: 'Dog not found' }, { status: 404 });
    }
    if (pending >= MAX_PENDING) {
      return NextResponse.json(
        { error: `You have ${MAX_PENDING} celebrations waiting for review. Once they're approved you can share more.` },
        { status: 429 }
      );
    }

    const created = await prisma.celebration.create({
      data: {
        userId,
        dogId: dog.id,
        dogName: dog.name,
        dogBreed: dog.breed,
        milestoneType,
        caption,
        milestoneDate: date,
        photoUrl: '',
        status: 'pending', // Requires admin approval
        photo: { create: { data, contentType: 'image/jpeg' } },
      },
    });
    const celebration = await prisma.celebration.update({
      where: { id: created.id },
      data: { photoUrl: `/api/celebrations/${created.id}/photo` },
    });

    return NextResponse.json({
      success: true,
      celebration,
      message: 'Celebration submitted! It will appear in the gallery once it has been reviewed.',
    });
  } catch (error) {
    console.error('Error submitting celebration:', error);
    return NextResponse.json({ error: 'Failed to submit celebration' }, { status: 500 });
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
        photoUrl: true,
        submittedAt: true,
      },
    });

    // Get total count for pagination
    const total = await prisma.celebration.count({ where });

    return NextResponse.json({
      success: true,
      celebrations,
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
