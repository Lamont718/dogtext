import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../../../lib/db';
import { getClientIp, rateLimit } from '../../../lib/rate-limit';

export const dynamic = 'force-dynamic';

const Body = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(8).max(128),
  firstName: z.string().trim().min(1).max(50),
  lastName: z.string().trim().max(50).optional(),
});

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const rl = rateLimit({ key: `signup:${ip}`, limit: 5, windowMs: 60 * 60 * 1000 });
  if (!rl.ok) {
    return NextResponse.json(
      { error: 'Too many signups from this network. Try again later.' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfterSec) } }
    );
  }

  let parsed;
  try {
    parsed = Body.parse(await request.json());
  } catch {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: parsed.email },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(parsed.password, 10);

    const user = await prisma.user.create({
      data: {
        email: parsed.email,
        password: hashedPassword,
        firstName: parsed.firstName,
        lastName: parsed.lastName,
        subscriptionTier: 'FREE',
        settings: { create: {} },
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
  }
}
