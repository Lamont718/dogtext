import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// The browser shrinks photos to a ~512px JPEG before upload; anything much
// bigger than that didn't come from our uploader.
const MAX_BYTES = 600 * 1024;

// GET /api/dogs/[id]/photo - public, like the bark pages that show it.
// Dog ids are unguessable, and the URL carries ?v= so a new photo busts caches.
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const photo = await prisma.dogPhoto
    .findUnique({ where: { dogId: params.id }, select: { data: true, contentType: true } })
    .catch(() => null);
  if (!photo) return new NextResponse('Not found', { status: 404 });

  return new NextResponse(photo.data, {
    headers: {
      'Content-Type': photo.contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}

// PUT /api/dogs/[id]/photo - body is the JPEG itself.
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const dog = await prisma.dog.findFirst({
    where: { id: params.id, userId: session.user.id, isActive: true },
    select: { id: true },
  });
  if (!dog) return NextResponse.json({ error: 'Dog not found' }, { status: 404 });

  const data = Buffer.from(await req.arrayBuffer());
  if (data.length === 0 || data.length > MAX_BYTES) {
    return NextResponse.json({ error: 'That photo is too large. Try another one.' }, { status: 413 });
  }
  // JPEG files start FF D8 FF.
  if (data[0] !== 0xff || data[1] !== 0xd8 || data[2] !== 0xff) {
    return NextResponse.json({ error: 'Photo must be a JPEG.' }, { status: 415 });
  }

  const photo = await prisma.dogPhoto.upsert({
    where: { dogId: dog.id },
    create: { dogId: dog.id, data, contentType: 'image/jpeg' },
    update: { data, contentType: 'image/jpeg' },
    select: { updatedAt: true },
  });

  const photoUrl = `/api/dogs/${dog.id}/photo?v=${photo.updatedAt.getTime()}`;
  await prisma.dog.update({ where: { id: dog.id }, data: { photoUrl } });

  return NextResponse.json({ photoUrl });
}
