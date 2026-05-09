import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Heart, Activity, Scissors, Stethoscope, Home, GraduationCap,
  Users, MapPin, ArrowLeft,
} from 'lucide-react';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

const ENERGY_LABEL: Record<string, string> = {
  low: 'Low',
  moderate: 'Moderate',
  high: 'High',
};

const SIZE_LABEL: Record<string, string> = {
  toy: 'Toy', small: 'Small', medium: 'Medium', large: 'Large', giant: 'Giant',
};

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const breed = await prisma.breedProfile.findUnique({
    where: { slug: params.slug },
    select: { breedName: true, description: true },
  });
  if (!breed) return { title: 'Breed not found | DogText' };
  return {
    title: `${breed.breedName} — Breed Guide | DogText`,
    description: breed.description.slice(0, 160),
  };
}

export default async function BreedPage({ params }: { params: { slug: string } }) {
  const breed = await prisma.breedProfile.findUnique({
    where: { slug: params.slug },
  });

  if (!breed) notFound();

  const badges = [
    breed.sizeCategory && SIZE_LABEL[breed.sizeCategory] && `${SIZE_LABEL[breed.sizeCategory]} breed`,
    breed.energyLevel && ENERGY_LABEL[breed.energyLevel] && `${ENERGY_LABEL[breed.energyLevel]} energy`,
    breed.familyFriendly && 'Family friendly',
    breed.goodWithKids && 'Good with kids',
    breed.goodWithPets && 'Good with other pets',
  ].filter(Boolean) as string[];

  return (
    <div className="container max-w-6xl mx-auto px-4 py-10">
      <Link
        href="/learn/breeds"
        className="inline-flex items-center text-sm text-gray-600 hover:text-[#FF8C42] mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> All breeds
      </Link>

      <div className="grid lg:grid-cols-2 gap-10 mb-10 items-start">
        {breed.imageUrl && (
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 shadow-lg">
            <Image
              src={breed.imageUrl}
              alt={breed.imageAlt || breed.breedName}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
              priority
            />
          </div>
        )}

        <div>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">{breed.breedName}</h1>
          <div className="flex flex-wrap gap-2 mb-6">
            {badges.map((b) => (
              <Badge key={b} variant="secondary" className="text-sm">
                {b}
              </Badge>
            ))}
          </div>
          <p className="text-lg text-gray-700 leading-relaxed">{breed.description}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-[#FF8C42]" /> Temperament
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{breed.temperament}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#FF8C42]" /> Origin
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{breed.origin}</p>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-[#FF8C42]" /> Physical characteristics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {breed.physicalCharacteristics}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#FF8C42]" /> Exercise needs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{breed.exerciseNeeds}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scissors className="w-5 h-5 text-[#FF8C42]" /> Grooming
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {breed.groomingRequirements}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-[#FF8C42]" /> Health considerations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {breed.healthConsiderations}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-[#FF8C42]" /> Training tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{breed.trainingTips}</p>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="w-5 h-5 text-[#FF8C42]" /> Ideal living conditions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {breed.idealLivingConditions}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-12 p-8 rounded-2xl bg-[#FFF8F0] text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          Curious what your {breed.breedName} would say?
        </h2>
        <p className="text-gray-700 mb-6">
          Try the AI demo on the homepage, or sign up to chat with your own dog.
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
