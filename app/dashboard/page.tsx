
import { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '../../lib/auth-config';
import { prisma } from '../../lib/db';
import DashboardContent from './dashboard-content';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    redirect('/auth/login');
  }

  // Get user's dogs
  const dogs = await prisma.dog.findMany({
    where: {
      userId: session.user.id,
      isActive: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  // Get user info
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  // Get message usage for the current week
  let messageUsage = null;
  if (user?.subscriptionTier === 'FREE') {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    messageUsage = await prisma.messageUsage.findFirst({
      where: {
        userId: session.user.id,
        weekStartDate: startOfWeek,
      },
    });
  }

  return (
    <Suspense fallback={<div className="animate-pulse">Loading dashboard...</div>}>
      <DashboardContent 
        dogs={dogs} 
        user={user}
        messageUsage={messageUsage}
      />
    </Suspense>
  );
}
