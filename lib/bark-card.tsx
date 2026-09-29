// The picture people post: one bark drawn as a text on a phone. Used for the
// Instagram/TikTok story image (1080x1920) and the link preview (1200x630),
// so a shared bark looks the same wherever it lands.

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://dogtext-tau.vercel.app').replace(/\/$/, '');
export const SITE_HOST = SITE_URL.replace(/^https?:\/\//, '');

export const STORY_SIZE = { width: 1080, height: 1920 };
export const WIDE_SIZE = { width: 1200, height: 630 };

interface BarkCardProps {
  dogName: string;
  dogBreed: string;
  message: string;
  format: 'story' | 'wide';
}

export function BarkCard({ dogName, dogBreed, message, format }: BarkCardProps) {
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
        fontFamily: 'sans-serif',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, color: 'white' }}>
        <div style={{ fontSize: story ? 44 : 28, fontWeight: 800, letterSpacing: 1 }}>DogText</div>
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
              fontWeight: 800,
            }}
          >
            {dogName.charAt(0).toUpperCase()}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: story ? 48 : 30, fontWeight: 700, color: '#2C2C2C' }}>{dogName}</div>
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
          gap: story ? 12 : 16,
          color: 'white',
        }}
      >
        <div style={{ fontSize: story ? 46 : 26, fontWeight: 800 }}>Get texts from your dog</div>
        <div style={{ fontSize: story ? 34 : 22, opacity: 0.95 }}>{SITE_HOST}</div>
      </div>
    </div>
  );
}
