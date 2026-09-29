import { ImageResponse } from 'next/og';
import { prisma } from '@/lib/db';
import { BarkCard, WIDE_SIZE, loadCardFonts } from '@/lib/bark-card';

export const runtime = 'nodejs';
export const contentType = 'image/png';
export const size = WIDE_SIZE;
export const alt = 'A text from a DogText dog';

export default async function OgImage({ params }: { params: { id: string } }) {
  const [text, fonts] = await Promise.all([
    prisma.sharedText.findUnique({ where: { id: params.id } }).catch(() => null),
    loadCardFonts(),
  ]);
  return new ImageResponse(
    (
      <BarkCard
        format="wide"
        dogName={text?.dogName ?? 'Your dog'}
        dogBreed={text?.breed ?? ''}
        message={text?.message ?? "I'd text you, but nobody has signed me up yet."}
      />
    ),
    { ...size, emoji: 'twemoji', ...(fonts.length ? { fonts } : {}) }
  );
}
