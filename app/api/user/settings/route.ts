import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

const TIMEZONES = [
  'America/Los_Angeles',
  'America/Denver',
  'America/Chicago',
  'America/New_York',
  'UTC',
  'Europe/London',
  'Europe/Paris',
  'Asia/Tokyo',
] as const;

const UpdateBody = z.object({
  firstName: z.string().trim().min(1).max(50).optional(),
  lastName: z.string().trim().max(50).optional(),
  emailNotifications: z.boolean().optional(),
  weeklyDigest: z.boolean().optional(),
  marketingEmails: z.boolean().optional(),
  timezone: z.enum(TIMEZONES).optional(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      firstName: true,
      lastName: true,
      email: true,
      subscriptionTier: true,
      settings: {
        select: {
          emailNotifications: true,
          weeklyDigest: true,
          marketingEmails: true,
          timezone: true,
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const settings = user.settings ?? {
    emailNotifications: true,
    weeklyDigest: true,
    marketingEmails: false,
    timezone: 'America/New_York',
  };

  return NextResponse.json({
    firstName: user.firstName ?? '',
    lastName: user.lastName ?? '',
    email: user.email,
    subscriptionTier: user.subscriptionTier,
    ...settings,
  });
}

export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let parsed;
  try {
    parsed = UpdateBody.parse(await request.json());
  } catch {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  const userUpdate: Record<string, unknown> = {};
  if (parsed.firstName !== undefined) userUpdate.firstName = parsed.firstName;
  if (parsed.lastName !== undefined) userUpdate.lastName = parsed.lastName;

  const settingsUpdate: Record<string, unknown> = {};
  if (parsed.emailNotifications !== undefined) settingsUpdate.emailNotifications = parsed.emailNotifications;
  if (parsed.weeklyDigest !== undefined) settingsUpdate.weeklyDigest = parsed.weeklyDigest;
  if (parsed.marketingEmails !== undefined) settingsUpdate.marketingEmails = parsed.marketingEmails;
  if (parsed.timezone !== undefined) settingsUpdate.timezone = parsed.timezone;

  if (Object.keys(userUpdate).length > 0) {
    await prisma.user.update({ where: { id: session.user.id }, data: userUpdate });
  }
  if (Object.keys(settingsUpdate).length > 0) {
    await prisma.userSettings.upsert({
      where: { userId: session.user.id },
      create: { userId: session.user.id, ...settingsUpdate },
      update: settingsUpdate,
    });
  }

  return NextResponse.json({ success: true });
}
