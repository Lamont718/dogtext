import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Heart } from 'lucide-react';
import { prisma } from '@/lib/db';
import { DEMO_BREEDS } from '@/lib/dog-voice';
import ShareBarkButton from '@/components/bark/share-bark-button';

export const dynamic = 'force-dynamic';

// A text someone got from the homepage demo and shared. The page a friend
// lands on, so it leads straight to trying it with their own dog.
async function load(id: string) {
  return prisma.sharedText.findUnique({ where: { id } }).catch(() => null);
}

export async function generateMetadata({ params }: { params: { id: string } }) {
  const text = await load(params.id);
  if (!text) return { title: 'Text not found | DogText' };
  return {
    title: `${text.dogName} sent a text | DogText`,
    description: text.message,
    robots: { index: false },
    openGraph: { title: `${text.dogName}, ${text.breed}`, description: text.message, type: 'article' },
    twitter: { card: 'summary_large_image', title: `${text.dogName} sent a text`, description: text.message },
  };
}

export default async function SharedTextPage({ params }: { params: { id: string } }) {
  const text = await load(params.id);
  if (!text) notFound();

  prisma.sharedText.update({ where: { id: text.id }, data: { views: { increment: 1 } } }).catch(() => {});

  const demoSlug = Object.entries(DEMO_BREEDS).find(([, name]) => name === text.breed)?.[0];
  const tryHref = demoSlug ? `/?breed=${demoSlug}#try` : '/#try';

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF8F0] to-white py-12 px-4">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-[#FF8C42] rounded-lg flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">DogText</span>
          </Link>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FF8C42] to-[#FFB380] flex items-center justify-center text-2xl font-bold text-white shrink-0">
              {text.dogName.charAt(0)}
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-gray-900">{text.dogName}</h1>
              <p className="text-sm text-gray-600">{text.breed}</p>
            </div>
          </div>

          <div className="bg-gray-100 rounded-3xl rounded-tl-md px-6 py-5 mb-5">
            <p className="text-xl leading-relaxed text-[#2C2C2C] whitespace-pre-line">{text.message}</p>
          </div>

          <ShareBarkButton barkId={text.id} basePath={`/t/${text.id}`} dogName={text.dogName} className="justify-center mb-8" />

          <div className="text-center border-t border-gray-100 pt-8">
            <p className="text-lg font-semibold text-gray-900 mb-1">What would your dog write to your kids?</p>
            <p className="text-sm text-gray-600 mb-5">
              Tell us their name, breed and personality. See three texts in seconds.
            </p>
            <Link
              href={tryHref}
              className="inline-block bg-[#FF8C42] hover:bg-[#FF6B1A] text-white font-semibold px-6 py-3 rounded-full transition-colors shadow-md"
            >
              Try it with your dog
            </Link>
            <p className="text-xs text-gray-400 mt-3">Free. A new letter from your dog every day.</p>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Written by AI from {text.dogName}&apos;s breed and personality. Real dog. Not a real text.
        </p>
      </div>
    </div>
  );
}
