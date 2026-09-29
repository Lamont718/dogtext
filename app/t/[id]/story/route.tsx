import { ImageResponse } from 'next/og';
import { prisma } from '@/lib/db';
import { BarkCard, STORY_SIZE, loadCardFonts } from '@/lib/bark-card';

export const runtime = 'nodejs';

// Story picture (1080x1920) of a shared demo text; same card as members' texts.
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const text = await prisma.sharedText.findUnique({ where: { id: params.id } }).catch(() => null);
  if (!text) return new Response('Not found', { status: 404 });

  const fonts = await loadCardFonts();
  const image = new ImageResponse(
    <BarkCard format="story" dogName={text.dogName} dogBreed={text.breed} message={text.message} />,
    { ...STORY_SIZE, emoji: 'twemoji', ...(fonts.length ? { fonts } : {}) }
  );
  const fileName = `${text.dogName.replace(/[^a-z0-9]+/gi, '-').toLowerCase() || 'dog'}-text.png`;
  image.headers.set('Content-Disposition', `inline; filename="${fileName}"`);
  image.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  return image;
}
