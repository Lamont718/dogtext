import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Clock, User, Calendar } from 'lucide-react';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

const CATEGORY_LABEL: Record<string, string> = {
  training: 'Training',
  health: 'Health',
  nutrition: 'Nutrition',
  'puppy-care': 'Puppy care',
  'senior-care': 'Senior care',
};

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const article = await prisma.article.findUnique({
    where: { slug: params.slug },
    select: { title: true, excerpt: true, isPublished: true, imageUrl: true },
  });
  if (!article || !article.isPublished) return { title: 'Article not found | DogText' };
  return {
    title: `${article.title} | DogText`,
    description: article.excerpt?.slice(0, 160) ?? undefined,
    openGraph: article.imageUrl ? { images: [article.imageUrl] } : undefined,
  };
}

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const article = await prisma.article.findUnique({
    where: { slug: params.slug },
  });

  if (!article || !article.isPublished) notFound();

  prisma.article
    .update({ where: { id: article.id }, data: { viewCount: { increment: 1 } } })
    .catch(() => {});

  const paragraphs = article.content.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

  return (
    <div className="container max-w-3xl mx-auto px-4 py-10">
      <Link
        href="/learn/articles"
        className="inline-flex items-center text-sm text-gray-600 hover:text-[#FF8C42] mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> All articles
      </Link>

      <article>
        <header className="mb-8">
          <Badge variant="secondary" className="mb-4">
            {CATEGORY_LABEL[article.category] ?? article.category}
          </Badge>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            {article.title}
          </h1>
          {article.excerpt && (
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">{article.excerpt}</p>
          )}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
            <span className="inline-flex items-center gap-1">
              <User className="w-4 h-4" /> {article.author}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="w-4 h-4" /> {article.readTime} min read
            </span>
            <span className="inline-flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date(article.publishedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
        </header>

        {article.imageUrl && (
          <div className="relative aspect-[16/9] mb-10 rounded-2xl overflow-hidden bg-gray-100 shadow-md">
            <Image
              src={article.imageUrl}
              alt={article.imageAlt || article.title}
              fill
              sizes="(min-width: 768px) 768px, 100vw"
              className="object-cover"
              priority
            />
          </div>
        )}

        <div className="space-y-5 text-lg text-gray-800 leading-relaxed">
          {paragraphs.map((p, i) => (
            <p key={i} className="whitespace-pre-line">
              {p}
            </p>
          ))}
        </div>

        {article.tags && article.tags.length > 0 && (
          <div className="mt-10 pt-6 border-t border-gray-200 flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </article>

      <div className="mt-12 p-8 rounded-2xl bg-[#FFF8F0] text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          Want answers tailored to your dog?
        </h2>
        <p className="text-gray-700 mb-6">
          Sign up free and chat with your own dog's AI persona — built around their breed
          and personality.
        </p>
        <Link
          href="/auth/signup"
          className="inline-block bg-[#FF8C42] hover:bg-[#FF6B1A] text-white font-semibold px-6 py-3 rounded-full transition-colors"
        >
          Create your free account
        </Link>
      </div>
    </div>
  );
}
