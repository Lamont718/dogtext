import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/db';
import { pushConfigured, sendDogPush } from '@/lib/push';

export const dynamic = 'force-dynamic';

const Subscription = z.object({
  endpoint: z.string().url().max(1000),
  keys: z.object({ p256dh: z.string().min(1).max(200), auth: z.string().min(1).max(100) }),
});

// GET: how many devices this member has turned on.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ devices: 0 });
  const devices = await prisma.pushSubscription.count({ where: { userId: session.user.id } });
  return NextResponse.json({ devices, available: pushConfigured() });
}

// POST: turn on notifications for this device, then send a hello so they see it work.
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }
  if (!pushConfigured()) {
    return NextResponse.json({ error: 'Notifications are not set up yet.' }, { status: 503 });
  }

  let sub;
  try {
    sub = Subscription.parse(await req.json());
  } catch {
    return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 });
  }

  const userId = session.user.id;
  await prisma.pushSubscription.upsert({
    where: { endpoint: sub.endpoint },
    create: {
      userId,
      endpoint: sub.endpoint,
      p256dh: sub.keys.p256dh,
      auth: sub.keys.auth,
      userAgent: req.headers.get('user-agent')?.slice(0, 300) ?? null,
    },
    update: { userId, p256dh: sub.keys.p256dh, auth: sub.keys.auth },
  });

  const dog = await prisma.dog.findFirst({
    where: { userId, isActive: true },
    orderBy: { createdAt: 'asc' },
    select: { name: true },
  });
  const name = dog?.name ?? 'Your dog';
  const { sent } = await sendDogPush(userId, {
    dogName: name,
    message: 'This is a test. I am testing the phone. If you can read this, the phone works. See you at 7am.',
    url: '/dashboard',
  });

  return NextResponse.json({ ok: true, sent });
}

// DELETE: turn off notifications for this device.
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }
  const { endpoint } = (await req.json().catch(() => ({}))) as { endpoint?: string };
  if (endpoint) {
    await prisma.pushSubscription.deleteMany({ where: { endpoint, userId: session.user.id } });
  }
  return NextResponse.json({ ok: true });
}
