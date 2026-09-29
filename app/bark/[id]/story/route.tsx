import { ImageResponse } from 'next/og';
import { prisma } from '@/lib/db';
import { BarkCard, STORY_SIZE } from '@/lib/bark-card';

export const runtime = 'nodejs';

// The Instagram/TikTok story version of a bark: a 1080x1920 PNG the share
// button hands to the phone's share sheet (or downloads on a computer).
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const bark = await prisma.dailyBark
    .findUnique({
      where: { id: params.id },
      include: { dog: { select: { name: true, breed: true } } },
    })
    .catch(() => null);

  if (!bark) return new Response('Not found', { status: 404 });

  const image = new ImageResponse(
    (
      <BarkCard
        format="story"
        dogName={bark.dog.name}
        dogBreed={bark.dog.breed}
        message={bark.messageText}
      />
    ),
    { ...STORY_SIZE, emoji: 'twemoji' }
  );

  const fileName = `${bark.dog.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase() || 'dog'}-text.png`;
  image.headers.set('Content-Disposition', `inline; filename="${fileName}"`);
  // A bark's text never changes; a day's cache still picks up a renamed dog.
  image.headers.set('Cache-Control', 'public, max-age=86400');
  return image;
}
