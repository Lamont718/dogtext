
import { Suspense } from 'react';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { PawPrint } from 'lucide-react';
import { authOptions } from '../../lib/auth-config';
import { prisma } from '../../lib/db';
import ChatPageContent from './chat-content';
import { PawChatIllustration } from '../../components/illustrations/empty-state';

interface ChatPageProps {
  searchParams: { dog?: string };
}

export default async function ChatPage({ searchParams }: ChatPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/auth/login');
  }

  const dogs = await prisma.dog.findMany({
    where: {
      userId: session.user.id,
      isActive: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  if (dogs.length === 0) {
    return (
      <div className="container max-w-2xl mx-auto px-4 py-16 text-center">
        <PawChatIllustration size={220} className="mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
          Add your first dog to start chatting
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-lg mx-auto">
          The AI shapes how your dog "talks" around their breed and personality. Spend
          a minute filling out a profile and you'll get messages that feel like them.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 bg-[#FF8C42] hover:bg-[#FF6B1A] text-white font-semibold px-6 py-3 rounded-full transition-colors"
        >
          <PawPrint className="w-4 h-4" />
          Add a dog
        </Link>
      </div>
    );
  }

  const selectedDogId = searchParams.dog || dogs[0].id;
  const selectedDog = dogs.find((dog: any) => dog.id === selectedDogId) || dogs[0];

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      <Suspense fallback={<div className="animate-pulse">Loading chat...</div>}>
        <ChatPageContent dogs={dogs} selectedDog={selectedDog} />
      </Suspense>
    </div>
  );
}
