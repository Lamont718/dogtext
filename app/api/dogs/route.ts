
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/db';
import { z } from 'zod';

// GET /api/dogs - Fetch user's dogs
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Fetch user's dogs
    const dogs = await prisma.dog.findMany({
      where: {
        userId: user.id,
        isActive: true,
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        breed: true,
        age: true,
        ageUnit: true,
        weight: true,
        weightUnit: true,
        gender: true,
        personalityTraits: true,
        photoUrl: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      dogs,
    });
  } catch (error) {
    console.error('Error fetching dogs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dogs' },
      { status: 500 }
    );
  }
}

// Everyone gets the same: Premium was dropped (2026-09-29).
const MAX_DOGS = 3;

const NewDog = z.object({
  name: z.string().trim().min(1).max(30),
  breed: z.string().trim().min(1).max(60),
  age: z.coerce.number().int().min(0).max(40).optional().nullable(),
  ageUnit: z.enum(['months', 'years']).optional().nullable(),
  weight: z.coerce.number().min(0).max(400).optional().nullable(),
  weightUnit: z.enum(['lbs', 'kg']).optional().nullable(),
  gender: z.enum(['male', 'female']).optional().nullable(),
  personalityTraits: z.array(z.string().trim().min(1).max(20)).max(3).default([]),
  healthConditions: z.array(z.string().trim().min(1).max(60)).max(10).default([]),
});

// POST /api/dogs - Add a dog (the dashboard's "Add a dog" form)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  let data;
  try {
    data = NewDog.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Check the dog's name and breed and try again." }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { subscriptionTier: true, _count: { select: { dogs: { where: { isActive: true } } } } },
    });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user._count.dogs >= MAX_DOGS) {
      return NextResponse.json(
        { error: `Up to ${MAX_DOGS} dogs per family.` },
        { status: 403 }
      );
    }

    const dog = await prisma.dog.create({
      data: { ...data, userId: session.user.id },
    });
    return NextResponse.json({ dog }, { status: 201 });
  } catch (error) {
    console.error('Error creating dog:', error);
    return NextResponse.json({ error: 'Failed to add dog' }, { status: 500 });
  }
}
