import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { prisma } from '@/lib/db';
import BreedSearch from './breed-search';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Dog Breeds Guide | DogText',
  description:
    'Browse comprehensive breed profiles — temperament, exercise needs, grooming, health, and training tips for every breed we cover.',
};

const SIZE_LABEL: Record<string, string> = {
  toy: 'Toy',
  small: 'Small',
  medium: 'Medium',
  large: 'Large',
  giant: 'Giant',
};

export default async function BreedsPage({
  searchParams,
}: {
  searchParams: { q?: string; size?: string };
}) {
  const q = searchParams.q?.trim();
  const size = searchParams.size?.trim().toLowerCase();

  const breeds = await prisma.breedProfile.findMany({
    where: {
      ...(q && {
        OR: [
          { breedName: { contains: q, mode: 'insensitive' } },
          { temperament: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
        ],
      }),
      ...(size && SIZE_LABEL[size] && { sizeCategory: size }),
    },
    orderBy: [{ isPopular: 'desc' }, { breedName: 'asc' }],
    select: {
      id: true,
      breedName: true,
      slug: true,
      temperament: true,
      sizeCategory: true,
      energyLevel: true,
      imageUrl: true,
      imageAlt: true,
      isPopular: true,
    },
  });

  return (
    <div className="container max-w-6xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Dog Breeds Guide</h1>
        <p className="text-xl text-gray-600 mb-6 max-w-2xl">
          Plain-language profiles for every breed — temperament, exercise needs, grooming,
          health watch-outs, and training tips.
        </p>
        <BreedSearch defaultValue={q ?? ''} />
      </div>

      {breeds.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-2xl">
          <p className="text-lg text-gray-600">
            {q ? `No breeds match "${q}".` : 'No breed profiles published yet.'}
          </p>
          {q && (
            <Link href="/learn/breeds" className="text-[#FF8C42] font-semibold mt-3 inline-block">
              Clear search
            </Link>
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {breeds.map((breed) => (
            <Link key={breed.id} href={`/learn/breeds/${breed.slug}`} className="group">
              <Card className="overflow-hidden h-full border-0 shadow-md hover:shadow-xl transition-all hover:-translate-y-1">
                {breed.imageUrl && (
                  <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                    <Image
                      src={breed.imageUrl}
                      alt={breed.imageAlt || breed.breedName}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="flex items-start justify-between gap-2">
                    <span className="group-hover:text-[#FF8C42] transition-colors">
                      {breed.breedName}
                    </span>
                    {breed.sizeCategory && SIZE_LABEL[breed.sizeCategory] && (
                      <Badge variant="secondary" className="shrink-0">
                        {SIZE_LABEL[breed.sizeCategory]}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm line-clamp-3">{breed.temperament}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
