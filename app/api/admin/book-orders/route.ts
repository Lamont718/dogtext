import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/db';
import { isAdminEmail } from '@/lib/admin';

export const dynamic = 'force-dynamic';

const Body = z.object({ id: z.string().min(1), status: z.enum(['paid', 'sent_to_mixam', 'shipped']) });

// POST: move a book order along (admin only): sent to Mixam, then shipped.
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!isAdminEmail(session?.user?.email)) return new NextResponse('Not found', { status: 404 });
  let body;
  try {
    body = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }
  const now = new Date();
  const order = await prisma.bookOrder.update({
    where: { id: body.id },
    data: {
      status: body.status,
      ...(body.status === 'sent_to_mixam' ? { sentToMixamAt: now } : {}),
      ...(body.status === 'shipped' ? { shippedAt: now } : {}),
    },
    select: { id: true, status: true },
  });
  return NextResponse.json(order);
}
