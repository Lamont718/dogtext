import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// POST: reserve a printed book of the letters. Printing isn't open yet; this
// is the list to email (with the price) when it is.
export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }
  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: { bookReservedAt: new Date() },
    select: { bookReservedAt: true },
  });
  return NextResponse.json({ reservedAt: user.bookReservedAt });
}
