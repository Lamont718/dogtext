import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateDailyBark, todayFor } from '@/lib/daily-bark';
import { sendDailyBarkEmail } from '@/lib/email';
import { pushConfigured, sendDogPush } from '@/lib/push';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

const SAMPLE_USER_EMAIL = 'samples@dogtext.local';

// Every morning (vercel.json, 11:00 UTC = 7am New York): write each member's
// text, send it to the phones that turned on notifications, and email it when
// email delivery is enabled. Safe to re-run: each channel is marked when sent.
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get('authorization') || '';
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const emailOn = process.env.EMAIL_DELIVERY_ENABLED === '1';
  const pushOn = pushConfigured();
  if (!emailOn && !pushOn) {
    return NextResponse.json({ skipped: true, reason: 'no delivery channel is set up' });
  }

  const channels = [
    ...(pushOn ? [{ pushSubscriptions: { some: {} } }] : []),
    ...(emailOn ? [{ settings: { emailNotifications: true } }] : []),
  ];

  const eligible = await prisma.user.findMany({
    where: {
      email: { not: SAMPLE_USER_EMAIL, contains: '@' },
      dogs: { some: { isActive: true } },
      OR: channels,
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      settings: { select: { timezone: true, emailNotifications: true } },
      kids: { select: { firstName: true, age: true }, orderBy: { createdAt: 'asc' } },
      _count: { select: { pushSubscriptions: true } },
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

  const stats = { eligible: eligible.length, pushed: 0, emailed: 0, skipped: 0, failed: 0 };
  const errors: string[] = [];

  for (const user of eligible) {
    const today = todayFor(user.settings?.timezone);
    const dog = user.dogs[0];
    if (!dog) {
      stats.skipped++;
      continue;
    }

    let bark = await prisma.dailyBark.findUnique({
      where: { dogId_generatedFor: { dogId: dog.id, generatedFor: today } },
    });

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
        kids: user.kids,
      });

      if (!messageText) {
        stats.failed++;
        errors.push(`gen-failed:${user.id}`);
        continue;
      }

      bark = await prisma.dailyBark.create({
        data: { userId: user.id, dogId: dog.id, generatedFor: today, messageText },
      });
    }

    const wantsPush = pushOn && user._count.pushSubscriptions > 0 && !bark.pushedAt;
    const wantsEmail = emailOn && user.settings?.emailNotifications && !bark.emailedAt;
    if (!wantsPush && !wantsEmail) {
      stats.skipped++;
      continue;
    }

    if (wantsPush) {
      const { sent } = await sendDogPush(user.id, {
        dogName: dog.name,
        message: bark.messageText,
        url: '/dashboard',
      });
      if (sent > 0) {
        await prisma.dailyBark.update({ where: { id: bark.id }, data: { pushedAt: new Date() } });
        stats.pushed++;
      }
    }

    if (wantsEmail) {
      const result = await sendDailyBarkEmail({
        to: user.email,
        userId: user.id,
        dogName: dog.name,
        dogBreed: dog.breed,
        messageText: bark.messageText,
        barkId: bark.id,
      });
      if (result.ok) {
        await prisma.dailyBark.update({ where: { id: bark.id }, data: { emailedAt: new Date() } });
        stats.emailed++;
      } else {
        stats.failed++;
        errors.push(`send-failed:${user.id}:${result.error.slice(0, 80)}`);
      }
    }
  }

  return NextResponse.json({ stats, errors });
}
