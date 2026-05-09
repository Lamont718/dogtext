import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, User } from 'lucide-react';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Expert Articles | DogText',
  description:
    'Plain-language guides on training, health, nutrition, puppy and senior care — written so you can use them today.',
};

const CATEGORY_LABEL: Record<string, string> = {
  training: 'Training',
  health: 'Health',
  nutrition: 'Nutrition',
  'puppy-care': 'Puppy care',
  'senior-care': 'Senior care',
};

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const category = searchParams.category?.trim().toLowerCase();

  const [articles, allCategories] = await Promise.all([
    prisma.article.findMany({
      where: {
        isPublished: true,
        ...(category && CATEGORY_LABEL[category] && { category }),
      },
      orderBy: [{ isFeatured: 'desc' }, { publishedAt: 'desc' }],
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        category: true,
        readTime: true,
        author: true,
        imageUrl: true,
        imageAlt: true,
        isFeatured: true,
      },
    }),
    prisma.article.groupBy({
      by: ['category'],
      where: { isPublished: true },
      _count: { _all: true },
      orderBy: { category: 'asc' },
    }),
  ]);

  return (
    <div className="container max-w-6xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Expert Articles</h1>
        <p className="text-xl text-gray-600 max-w-2xl">
          Plain-language guides on training, health, nutrition, puppy and senior care.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-10">
        <Link
          href="/learn/articles"
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            !category
              ? 'bg-[#FF8C42] text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All
        </Link>
        {allCategories.map((c) => (
          <Link
            key={c.category}
            href={`/learn/articles?category=${c.category}`}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              category === c.category
                ? 'bg-[#FF8C42] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {CATEGORY_LABEL[c.category] ?? c.category} ({c._count._all})
          </Link>
        ))}
      </div>

      {articles.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-2xl">
          <p className="text-lg text-gray-600">No articles published yet.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <Link key={article.id} href={`/learn/articles/${article.slug}`} className="group">
              <Card className="h-full overflow-hidden border-0 shadow-md hover:shadow-xl transition-all hover:-translate-y-1">
                {article.imageUrl && (
                  <div className="relative aspect-[16/9] bg-gray-100 overflow-hidden">
                    <Image
                      src={article.imageUrl}
                      alt={article.imageAlt || article.title}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary">
                      {CATEGORY_LABEL[article.category] ?? article.category}
                    </Badge>
                    <div className="flex items-center text-gray-500 text-sm">
                      <Clock className="w-4 h-4 mr-1" />
                      {article.readTime} min
                    </div>
                  </div>
                  <CardTitle className="line-clamp-2 group-hover:text-[#FF8C42] transition-colors">
                    {article.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {article.excerpt && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{article.excerpt}</p>
                  )}
                  <div className="flex items-center text-gray-500 text-sm">
                    <User className="w-4 h-4 mr-1" />
                    {article.author}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
