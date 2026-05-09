
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth-config';
import { prisma } from '../../../../lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dog = await prisma.dog.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
        isActive: true,
      },
    });

    if (!dog) {
      return NextResponse.json({ error: 'Dog not found' }, { status: 404 });
    }

    return NextResponse.json(dog);
  } catch (error) {
    console.error('Error fetching dog:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dog' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const {
      name,
      breed,
      age,
      ageUnit,
      weight,
      weightUnit,
      gender,
      personalityTraits,
      healthConditions,
    } = data;

    const dog = await prisma.dog.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
        isActive: true,
      },
    });

    if (!dog) {
      return NextResponse.json({ error: 'Dog not found' }, { status: 404 });
    }

    const updatedDog = await prisma.dog.update({
      where: { id: params.id },
      data: {
        name,
        breed,
        age: age ? parseInt(age) : null,
        ageUnit,
        weight: weight ? parseFloat(weight) : null,
        weightUnit,
        gender,
        personalityTraits: personalityTraits || [],
        healthConditions: healthConditions || [],
      },
    });

    return NextResponse.json(updatedDog);
  } catch (error) {
    console.error('Error updating dog:', error);
    return NextResponse.json(
      { error: 'Failed to update dog' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dog = await prisma.dog.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
        isActive: true,
      },
    });

    if (!dog) {
      return NextResponse.json({ error: 'Dog not found' }, { status: 404 });
    }

    await prisma.dog.update({
      where: { id: params.id },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting dog:', error);
    return NextResponse.json(
      { error: 'Failed to delete dog' },
      { status: 500 }
    );
  }
}
