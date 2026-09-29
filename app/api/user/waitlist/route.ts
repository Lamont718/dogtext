import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

const Body = z.object({ plan: z.enum(['PREMIUM', 'FAMILY']) });

// GET: which plan's list the signed-in user is on, if any.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ plan: null });
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { interestedPlan: true },
  });
  return NextResponse.json({ plan: user?.interestedPlan ?? null });
}

// POST: join the list for a paid plan (billing isn't open yet).
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }
  let body;
  try {
    body = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
  }
  await prisma.user.update({
    where: { id: session.user.id },
    data: { interestedPlan: body.plan, interestedAt: new Date() },
  });
  return NextResponse.json({ plan: body.plan });
}
