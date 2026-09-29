import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { getClientIp, rateLimit } from '@/lib/rate-limit';
import { DEMO_BREEDS, type DemoBreedSlug } from '@/lib/dog-voice';
import { verifyText } from '@/lib/text-signature';

export const dynamic = 'force-dynamic';

const Body = z.object({
  dogName: z.string().trim().min(1).max(30),
  breed: z.string().refine((b): b is DemoBreedSlug => b in DEMO_BREEDS),
  message: z.string().min(1).max(400),
  signature: z.string().length(32),
});

// POST /api/share-text - a visitor shares one of their demo texts.
// Returns the id of its public page (/t/[id]).
export async function POST(req: NextRequest) {
  const rl = rateLimit({ key: `share-text:${getClientIp(req)}`, limit: 20, windowMs: 60 * 60 * 1000 });
  if (!rl.ok) {
    return NextResponse.json({ error: 'Too many shares. Try again later.' }, { status: 429 });
  }

  let body;
  try {
    body = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }
  if (!verifyText(body.dogName, body.breed, body.message, body.signature)) {
    return NextResponse.json({ error: 'Only texts DogText wrote can be shared.' }, { status: 403 });
  }

  const shared = await prisma.sharedText.create({
    data: {
      dogName: body.dogName,
      breed: DEMO_BREEDS[body.breed as DemoBreedSlug],
      message: body.message,
    },
    select: { id: true },
  });
  return NextResponse.json({ id: shared.id });
}
