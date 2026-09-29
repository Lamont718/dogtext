import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../lib/auth-config';
import { prisma } from '../../../../../lib/db';
import { loadThread } from '../../../../../lib/dog-chat';

export const dynamic = 'force-dynamic';

// GET /api/chat/history/[dogId] - the newest 50 messages, morning texts included.
export async function GET(_request: NextRequest, { params }: { params: { dogId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const dog = await prisma.dog.findFirst({
      where: { id: params.dogId, userId: session.user.id },
      select: { id: true },
    });
    if (!dog) return NextResponse.json({ error: 'Dog not found' }, { status: 404 });

    return NextResponse.json(await loadThread(session.user.id, dog.id, 50));
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return NextResponse.json({ error: 'Failed to fetch chat history' }, { status: 500 });
  }
}
