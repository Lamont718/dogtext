
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../lib/auth-config';
import { prisma } from '../../../../../lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { dogId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const messages = await prisma.aiChatMessage.findMany({
      where: {
        userId: session.user.id,
        dogId: params.dogId,
      },
      orderBy: { createdAt: 'asc' },
      take: 50, // Limit to last 50 messages
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chat history' },
      { status: 500 }
    );
  }
}
