import { ImageResponse } from 'next/og';
import { prisma } from '@/lib/db';
import { BarkCard, WIDE_SIZE, loadCardFonts } from '@/lib/bark-card';

export const runtime = 'nodejs';
export const contentType = 'image/png';
export const size = WIDE_SIZE;
export const alt = 'A text from a DogText dog';

export default async function OgImage({ params }: { params: { id: string } }) {
  const bark = await prisma.dailyBark
    .findUnique({
      where: { id: params.id },
      include: { dog: { select: { name: true, breed: true } } },
    })
    .catch(() => null);

  const fonts = await loadCardFonts();
  return new ImageResponse(
    (
      <BarkCard
        format="wide"
        dogName={bark?.dog.name ?? 'Your dog'}
        dogBreed={bark?.dog.breed ?? ''}
        message={bark?.messageText ?? "I'd text you, but nobody has signed me up yet."}
      />
    ),
    { ...size, emoji: 'twemoji', ...(fonts.length ? { fonts } : {}) }
  );
}
