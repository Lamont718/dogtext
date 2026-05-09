import { ImageResponse } from 'next/og';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';
export const contentType = 'image/png';
export const size = { width: 1200, height: 630 };
export const alt = 'A daily bark from a DogText dog';

export default async function OgImage({ params }: { params: { id: string } }) {
  let bark;
  try {
    bark = await prisma.dailyBark.findUnique({
      where: { id: params.id },
      include: { dog: { select: { name: true, breed: true } } },
    });
  } catch {
    bark = null;
  }

  const dogName = bark?.dog.name ?? 'A DogText dog';
  const dogBreed = bark?.dog.breed ?? '';
  const message = bark?.messageText ?? "I'd send you a message but I haven't been set up yet 🐾";

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(135deg, #FFF8F0 0%, #FFE4D1 100%)',
          padding: 64,
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              background: '#FF8C42',
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 36,
            }}
          >
            🐾
          </div>
          <div
            style={{
              fontSize: 36,
              fontWeight: 800,
              color: '#2C2C2C',
            }}
          >
            DogText
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            flex: 1,
            marginTop: 32,
          }}
        >
          <div
            style={{
              fontSize: 24,
              color: '#FF8C42',
              fontWeight: 700,
              marginBottom: 16,
              letterSpacing: 2,
            }}
          >
            {dogName.toUpperCase()} SENT A TEXT{dogBreed ? ` · ${dogBreed.toUpperCase()}` : ''}
          </div>
          <div
            style={{
              background: 'linear-gradient(135deg, #FFB88C 0%, #FFB6C1 100%)',
              color: 'white',
              padding: '40px 48px',
              borderRadius: 40,
              borderTopLeftRadius: 8,
              fontSize: 48,
              fontWeight: 600,
              lineHeight: 1.3,
              maxWidth: 1000,
              boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
            }}
          >
            {message.length > 200 ? message.slice(0, 197) + '…' : message}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 32,
            color: '#6B6B6B',
            fontSize: 22,
          }}
        >
          <div style={{ display: 'flex' }}>Get yours at dogtext.com</div>
          <div style={{ display: 'flex', color: '#FF8C42', fontWeight: 700 }}>
            ✨ Daily Bark
          </div>
        </div>
      </div>
    ),
    size
  );
}
