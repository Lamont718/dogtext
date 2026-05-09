import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/db';
import { generateDailyBark, todayUtc } from '@/lib/daily-bark';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: { dogId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const dog = await prisma.dog.findFirst({
    where: { id: params.dogId, userId: session.user.id, isActive: true },
  });
  if (!dog) {
    return NextResponse.json({ error: 'Dog not found' }, { status: 404 });
  }

  const today = todayUtc();

  let bark;
  try {
    bark = await prisma.dailyBark.findUnique({
      where: { dogId_generatedFor: { dogId: dog.id, generatedFor: today } },
    });
  } catch (error) {
    console.error('Daily bark lookup failed (table missing?):', error);
    return NextResponse.json(
      { error: 'Daily Bark is not yet enabled on this database' },
      { status: 503 }
    );
  }

  if (!bark) {
    const [user, breedProfile, recentUserMessage] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { firstName: true },
      }),
      prisma.breedProfile.findFirst({
        where: { breedName: { contains: dog.breed, mode: 'insensitive' } },
        select: { temperament: true, energyLevel: true },
      }),
      prisma.aiChatMessage.findFirst({
        where: { dogId: dog.id, senderType: 'user' },
        orderBy: { createdAt: 'desc' },
        select: { messageText: true },
      }),
    ]);

    const messageText = await generateDailyBark({
      dog,
      ownerFirstName: user?.firstName ?? null,
      breedProfile,
      recentUserMessage,
      date: today,
    });

    if (!messageText) {
      return NextResponse.json(
        { error: 'Could not generate daily bark right now. Try again later.' },
        { status: 502 }
      );
    }

    try {
      bark = await prisma.dailyBark.upsert({
        where: { dogId_generatedFor: { dogId: dog.id, generatedFor: today } },
        create: {
          userId: session.user.id,
          dogId: dog.id,
          generatedFor: today,
          messageText,
        },
        update: {},
      });
    } catch (error) {
      console.error('Failed to persist daily bark:', error);
      return NextResponse.json({
        id: null,
        dogId: dog.id,
        messageText,
        generatedFor: today.toISOString(),
        ephemeral: true,
      });
    }
  }

  if (!bark.viewedAt) {
    prisma.dailyBark
      .update({ where: { id: bark.id }, data: { viewedAt: new Date() } })
      .catch(() => {});
  }

  return NextResponse.json({
    id: bark.id,
    dogId: bark.dogId,
    messageText: bark.messageText,
    generatedFor: bark.generatedFor.toISOString(),
  });
}
