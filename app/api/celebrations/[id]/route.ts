
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/db';
import { deleteFile } from '@/lib/s3';
import { isAdminEmail } from '@/lib/admin';

// DELETE /api/celebrations/[id] - Delete a celebration (admin or owner)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const celebrationId = params.id;

    // Get celebration
    const celebration = await prisma.celebration.findUnique({
      where: { id: celebrationId },
    });

    if (!celebration) {
      return NextResponse.json(
        { error: 'Celebration not found' },
        { status: 404 }
      );
    }

    const isOwner = celebration.userId === user.id;

    if (!isAdminEmail(session.user.email) && !isOwner) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this celebration' },
        { status: 403 }
      );
    }

    // Delete photo from S3
    try {
      await deleteFile(celebration.cloudStoragePath);
    } catch (error) {
      console.error('Error deleting photo from S3:', error);
      // Continue with deletion even if S3 delete fails
    }

    // Delete celebration from database
    await prisma.celebration.delete({
      where: { id: celebrationId },
    });

    return NextResponse.json({
      success: true,
      message: 'Celebration deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting celebration:', error);
    return NextResponse.json(
      { error: 'Failed to delete celebration' },
      { status: 500 }
    );
  }
}
