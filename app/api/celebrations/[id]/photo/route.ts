import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/db';
import { isAdminEmail } from '@/lib/admin';

export const dynamic = 'force-dynamic';

// GET /api/celebrations/[id]/photo
// Approved: public (it's in the gallery). Pending or rejected: only the person
// who posted it and admins, so an unreviewed photo can't be passed around.
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const celebration = await prisma.celebration
    .findUnique({
      where: { id: params.id },
      select: { status: true, userId: true, photo: { select: { data: true, contentType: true } } },
    })
    .catch(() => null);
  if (!celebration?.photo) return new NextResponse('Not found', { status: 404 });

  const approved = celebration.status === 'approved';
  if (!approved) {
    const session = await getServerSession(authOptions);
    const allowed =
      session?.user?.id === celebration.userId || isAdminEmail(session?.user?.email ?? null);
    if (!allowed) return new NextResponse('Not found', { status: 404 });
  }

  return new NextResponse(celebration.photo.data, {
    headers: {
      'Content-Type': celebration.photo.contentType,
      // Approved photos never change; unreviewed ones must not sit in shared caches.
      'Cache-Control': approved ? 'public, max-age=86400' : 'private, no-store',
    },
  });
}
