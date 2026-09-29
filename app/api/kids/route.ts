import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/db';
import { todayFor } from '@/lib/daily-bark';

export const dynamic = 'force-dynamic';

const MAX_KIDS = 6;
const NewKid = z.object({
  firstName: z.string().trim().min(1).max(30),
  age: z.coerce.number().int().min(0).max(17).nullable().optional(),
});

// When the kids change, today's letter is rewritten for them, unless it has
// already gone out or been shared.
async function refreshTodaysLetter(uid: string) {
  const settings = await prisma.userSettings.findUnique({ where: { userId: uid }, select: { timezone: true } });
  await prisma.dailyBark
    .deleteMany({
      where: { userId: uid, generatedFor: todayFor(settings?.timezone), pushedAt: null, emailedAt: null, shareCount: 0 },
    })
    .catch(() => {});
}

async function userId() {
  const session = await getServerSession(authOptions);
  return session?.user?.id ?? null;
}

// The children the family dog writes to (first names only, entered by the parent).
export async function GET() {
  const id = await userId();
  if (!id) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  const kids = await prisma.kid.findMany({
    where: { userId: id },
    orderBy: { createdAt: 'asc' },
    select: { id: true, firstName: true, age: true },
  });
  return NextResponse.json({ kids });
}

export async function POST(req: NextRequest) {
  const id = await userId();
  if (!id) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  let body;
  try {
    body = NewKid.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Add your child's first name." }, { status: 400 });
  }
  if ((await prisma.kid.count({ where: { userId: id } })) >= MAX_KIDS) {
    return NextResponse.json({ error: `Up to ${MAX_KIDS} kids per family.` }, { status: 400 });
  }
  const kid = await prisma.kid.create({
    data: { userId: id, firstName: body.firstName, age: body.age ?? null },
    select: { id: true, firstName: true, age: true },
  });
  await refreshTodaysLetter(id);
  return NextResponse.json({ kid }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const id = await userId();
  if (!id) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  const { kidId } = (await req.json().catch(() => ({}))) as { kidId?: string };
  if (kidId) {
    await prisma.kid.deleteMany({ where: { id: kidId, userId: id } });
    await refreshTodaysLetter(id);
  }
  return NextResponse.json({ ok: true });
}
