
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/db';
import { isAdminEmail } from '@/lib/admin';

// PATCH /api/celebrations/[id]/approve - Approve or reject a celebration (admin only)
export async function PATCH(
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

    if (!isAdminEmail(session.user.email)) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
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
    const body = await req.json();
    const { action, rejectionReason } = body; // action: 'approve' or 'reject'

    // Validate action
    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "approve" or "reject"' },
        { status: 400 }
      );
    }

    if (action === 'reject' && !rejectionReason) {
      return NextResponse.json(
        { error: 'Rejection reason is required when rejecting' },
        { status: 400 }
      );
    }

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

    // Update celebration status
    const updatedCelebration = await prisma.celebration.update({
      where: { id: celebrationId },
      data: {
        status: action === 'approve' ? 'approved' : 'rejected',
        reviewedAt: new Date(),
        reviewedBy: user.id,
        rejectionReason: action === 'reject' ? rejectionReason : null,
      },
    });

    return NextResponse.json({
      success: true,
      celebration: updatedCelebration,
      message: `Celebration ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
    });
  } catch (error) {
    console.error('Error updating celebration:', error);
    return NextResponse.json(
      { error: 'Failed to update celebration' },
      { status: 500 }
    );
  }
}
