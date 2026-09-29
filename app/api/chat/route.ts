import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '../../../lib/auth-config';
import { prisma } from '../../../lib/db';
import { buildChatSystemPrompt, loadThread, safetyNote, streamDogReply } from '../../../lib/dog-chat';

export const dynamic = 'force-dynamic';

const FREE_WEEKLY_LIMIT = 5;
// How much of the thread the dog "remembers" when replying.
const MEMORY_MESSAGES = 16;

const Body = z.object({
  dogId: z.string().min(1),
  message: z.string().trim().min(1).max(1000),
});

function startOfWeek(): Date {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - now.getDay());
  start.setHours(0, 0, 0, 0);
  return start;
}

// POST /api/chat - text your dog. Streams the reply back as plain text.
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  let body;
  try {
    body = Body.parse(await request.json());
  } catch {
    return NextResponse.json({ error: 'Write a message first.' }, { status: 400 });
  }

  try {
    const [user, dog] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { subscriptionTier: true, firstName: true },
      }),
      prisma.dog.findFirst({ where: { id: body.dogId, userId, isActive: true } }),
    ]);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    if (!dog) return NextResponse.json({ error: 'Dog not found' }, { status: 404 });

    const isFree = user.subscriptionTier === 'FREE';
    const weekStartDate = startOfWeek();
    if (isFree) {
      const usage = await prisma.messageUsage.findFirst({ where: { userId, weekStartDate } });
      if ((usage?.messageCount ?? 0) >= FREE_WEEKLY_LIMIT) {
        return NextResponse.json(
          { error: `That's your ${FREE_WEEKLY_LIMIT} chats for this week. ${dog.name}'s daily letters keep coming, and chats reset Sunday.` },
          { status: 403 }
        );
      }
    }

    const [breedProfile, thread, lastBark] = await Promise.all([
      prisma.breedProfile.findFirst({
        where: { breedName: { contains: dog.breed, mode: 'insensitive' } },
        select: { temperament: true },
      }),
      loadThread(userId, dog.id, MEMORY_MESSAGES),
      // Fetched on its own: after a long chat it falls out of the thread above.
      prisma.dailyBark.findFirst({
        where: { dogId: dog.id },
        orderBy: { createdAt: 'desc' },
        select: { messageText: true },
      }),
    ]);

    await prisma.aiChatMessage.create({
      data: { userId, dogId: dog.id, messageText: body.message, senderType: 'user' },
    });

    const messages = [
      {
        role: 'system' as const,
        content: buildChatSystemPrompt(
          dog,
          user.firstName,
          breedProfile,
          lastBark?.messageText,
        ),
      },
      ...thread.map((m) => ({
        role: m.senderType === 'user' ? ('user' as const) : ('assistant' as const),
        content: m.messageText,
      })),
      { role: 'user' as const, content: body.message },
    ];

    const stream = await streamDogReply(messages, async (reply) => {
      if (!reply) return;
      await prisma.aiChatMessage.create({
        data: {
          userId,
          dogId: dog.id,
          messageText: reply,
          senderType: 'ai',
          metadata: { breed: dog.breed, personality: dog.personalityTraits },
        },
      });
      // Only a finished reply counts against the free week.
      if (isFree) {
        await prisma.messageUsage.upsert({
          where: { userId_weekStartDate: { userId, weekStartDate } },
          update: { messageCount: { increment: 1 } },
          create: { userId, weekStartDate, messageCount: 1 },
        });
      }
    }, safetyNote(body.message, dog.name));

    return new Response(stream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-cache' },
    });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json({ error: "Your dog couldn't reply just now. Try again." }, { status: 500 });
  }
}
