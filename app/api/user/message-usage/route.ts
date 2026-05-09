
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth-config';
import { prisma } from '../../../../lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let messageCount = 0;
    let limit = user.subscriptionTier === 'FREE' ? 5 : 999999;

    if (user.subscriptionTier === 'FREE') {
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      const messageUsage = await prisma.messageUsage.findFirst({
        where: {
          userId: session.user.id,
          weekStartDate: startOfWeek,
        },
      });

      messageCount = messageUsage?.messageCount || 0;
    }

    return NextResponse.json({
      subscriptionTier: user.subscriptionTier,
      messageCount,
      limit,
      remaining: Math.max(0, limit - messageCount),
    });
  } catch (error) {
    console.error('Error fetching message usage:', error);
    return NextResponse.json(
      { error: 'Failed to fetch message usage' },
      { status: 500 }
    );
  }
}
