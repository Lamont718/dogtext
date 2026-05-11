import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateDailyBark, todayUtc } from '@/lib/daily-bark';
import { sendDailyBarkEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

const SAMPLE_USER_EMAIL = 'samples@dogtext.local';

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get('authorization') || '';
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  if (process.env.EMAIL_DELIVERY_ENABLED !== '1') {
    return NextResponse.json({
      skipped: true,
      reason: 'EMAIL_DELIVERY_ENABLED is not 1',
    });
  }

  const today = todayUtc();

  const eligible = await prisma.user.findMany({
    where: {
      email: { not: SAMPLE_USER_EMAIL, contains: '@' },
      settings: { emailNotifications: true },
      dogs: { some: { isActive: true } },
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      dogs: {
        where: { isActive: true },
        take: 1,
        orderBy: { createdAt: 'asc' },
        select: {
          id: true,
          name: true,
          breed: true,
          age: true,
          ageUnit: true,
          gender: true,
          personalityTraits: true,
          healthConditions: true,
        },
      },
    },
  });

  const stats = { eligible: eligible.length, sent: 0, skipped: 0, failed: 0 };
  const errors: string[] = [];

  for (const user of eligible) {
    const dog = user.dogs[0];
    if (!dog) {
      stats.skipped++;
      continue;
    }

    let bark = await prisma.dailyBark.findUnique({
      where: { dogId_generatedFor: { dogId: dog.id, generatedFor: today } },
    });

    if (bark?.emailedAt) {
      stats.skipped++;
      continue;
    }

    if (!bark) {
      const [breedProfile, recentUserMessage] = await Promise.all([
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
        ownerFirstName: user.firstName,
        breedProfile,
        recentUserMessage,
        date: today,
      });

      if (!messageText) {
        stats.failed++;
        errors.push(`gen-failed:${user.id}`);
        continue;
      }

      bark = await prisma.dailyBark.create({
        data: {
          userId: user.id,
          dogId: dog.id,
          generatedFor: today,
          messageText,
        },
      });
    }

    const result = await sendDailyBarkEmail({
      to: user.email,
      userId: user.id,
      dogName: dog.name,
      dogBreed: dog.breed,
      messageText: bark.messageText,
      barkId: bark.id,
    });

    if (result.ok) {
      await prisma.dailyBark.update({
        where: { id: bark.id },
        data: { emailedAt: new Date() },
      });
      stats.sent++;
    } else {
      stats.failed++;
      errors.push(`send-failed:${user.id}:${result.error.slice(0, 80)}`);
    }
  }

  return NextResponse.json({ stats, errors });
}
