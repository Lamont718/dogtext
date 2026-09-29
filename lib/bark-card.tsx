// The picture people post: one bark drawn as a text on a phone. Used for the
// Instagram/TikTok story image (1080x1920) and the link preview (1200x630),
// so a shared bark looks the same wherever it lands.

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://dogtext-tau.vercel.app').replace(/\/$/, '');
export const SITE_HOST = SITE_URL.replace(/^https?:\/\//, '');

export const STORY_SIZE = { width: 1080, height: 1920 };

// The site's own fonts: Poppins for headings, Inter for the text itself.
// Fetched once per server instance; if the font CDN is down the card still
// renders in the built-in font rather than failing.
const FONT_BASE = 'https://cdn.jsdelivr.net/fontsource/fonts';
let fontsPromise: Promise<CardFont[]> | null = null;

type CardFont = { name: string; data: ArrayBuffer; weight: 400 | 700; style: 'normal' };

export function loadCardFonts(): Promise<CardFont[]> {
  fontsPromise ??= Promise.all(
    [
      ['Poppins', 'poppins@latest/latin-700-normal.woff', 700],
      ['Inter', 'inter@latest/latin-400-normal.woff', 400],
    ].map(async ([name, path, weight]) => {
      const res = await fetch(`${FONT_BASE}/${path}`);
      if (!res.ok) throw new Error(`font ${res.status}`);
      return { name, data: await res.arrayBuffer(), weight, style: 'normal' } as CardFont;
    }),
  ).catch(() => {
    fontsPromise = null; // try again on the next request
    return [];
  });
  return fontsPromise;
}
export const WIDE_SIZE = { width: 1200, height: 630 };

interface BarkCardProps {
  dogName: string;
  dogBreed: string;
  message: string;
  format: 'story' | 'wide';
  /** data: URI of the dog's photo, if they've added one. */
  photo?: string | null;
}

/** Load a dog's stored photo as a data: URI for the card, or null. */
export async function loadDogPhotoDataUri(dogId: string): Promise<string | null> {
  const { prisma } = await import('./db');
  const p = await prisma.dogPhoto
    .findUnique({ where: { dogId }, select: { data: true, contentType: true } })
    .catch(() => null);
  return p ? `data:${p.contentType};base64,${Buffer.from(p.data).toString('base64')}` : null;
}

export function BarkCard({ dogName, dogBreed, message, format, photo }: BarkCardProps) {
  const story = format === 'story';
  const text = message.length > 280 ? message.slice(0, 277) + '…' : message;
  // Long barks get a smaller type size so they never run off the card.
  const fontSize = story ? (text.length > 180 ? 50 : 58) : text.length > 160 ? 30 : 36;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'linear-gradient(160deg, #FF8C42 0%, #FFB380 55%, #FFB6C1 100%)',
        padding: story ? '120px 72px 110px' : '40px 64px',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, color: 'white' }}>
        <div style={{ fontFamily: 'Poppins', fontSize: story ? 48 : 30, fontWeight: 700 }}>DogText</div>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          background: 'white',
          borderRadius: story ? 56 : 32,
          padding: story ? '48px 48px 56px' : '24px 32px 28px',
          boxShadow: '0 30px 60px rgba(0,0,0,0.15)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: story ? 24 : 16,
            paddingBottom: story ? 32 : 16,
            borderBottom: '2px solid #F0F0F0',
          }}
        >
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photo}
              width={story ? 104 : 60}
              height={story ? 104 : 60}
              style={{ borderRadius: 999, objectFit: 'cover' }}
            />
          ) : (
          <div
            style={{
              width: story ? 104 : 60,
              height: story ? 104 : 60,
              borderRadius: 999,
              background: 'linear-gradient(135deg, #FF8C42, #FFB380)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: story ? 52 : 30,
              fontFamily: 'Poppins',
              fontWeight: 700,
            }}
          >
            {dogName.charAt(0).toUpperCase()}
          </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontFamily: 'Poppins', fontSize: story ? 48 : 30, fontWeight: 700, color: '#2C2C2C' }}>{dogName}</div>
            <div style={{ fontSize: story ? 30 : 20, color: '#888' }}>
              {dogBreed ? `your dog · ${dogBreed}` : 'your dog'}
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            fontSize: story ? 28 : 18,
            color: '#AAA',
            marginTop: story ? 36 : 16,
            marginBottom: story ? 24 : 12,
          }}
        >
          Today 7:47 AM
        </div>

        <div
          style={{
            display: 'flex',
            alignSelf: 'flex-start',
            maxWidth: '92%',
            background: '#F2F2F2',
            borderRadius: story ? 44 : 28,
            borderTopLeftRadius: story ? 12 : 8,
            padding: story ? '36px 44px' : '20px 28px',
            fontSize,
            lineHeight: 1.35,
            color: '#2C2C2C',
            whiteSpace: 'pre-line',
          }}
        >
          {text}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: story ? 'column' : 'row',
          alignItems: 'center',
          gap: story ? 6 : 14,
          background: 'white',
          borderRadius: 999,
          padding: story ? '28px 64px' : '12px 32px',
          boxShadow: '0 12px 30px rgba(0,0,0,0.12)',
        }}
      >
        <div style={{ fontFamily: 'Poppins', fontSize: story ? 44 : 24, fontWeight: 700, color: '#FF8C42' }}>
          Get texts from your dog
        </div>
        <div style={{ fontSize: story ? 32 : 20, color: '#6B6B6B' }}>{SITE_HOST}</div>
      </div>
    </div>
  );
}
