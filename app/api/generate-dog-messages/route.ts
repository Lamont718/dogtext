import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getClientIp, rateLimit } from '../../../lib/rate-limit';

const ABACUS_API_URL = 'https://api.abacus.ai/v1/chat/completions';

const ALLOWED_BREEDS = [
  'golden-retriever', 'labrador', 'german-shepherd', 'french-bulldog',
  'beagle', 'poodle', 'bulldog', 'rottweiler', 'yorkshire-terrier',
  'boxer', 'dachshund', 'husky', 'corgi', 'chihuahua', 'mixed', 'other',
] as const;

const ALLOWED_TRAITS = [
  'playful', 'calm', 'energetic', 'goofy', 'protective',
  'silly', 'loyal', 'smart', 'cuddly',
] as const;

const Body = z.object({
  ownerName: z.string().trim().min(1).max(30),
  dogName: z.string().trim().min(1).max(30),
  breed: z.enum(ALLOWED_BREEDS),
  traits: z.array(z.enum(ALLOWED_TRAITS)).length(3),
});

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const rl = rateLimit({ key: `gen-dog:${ip}`, limit: 5, windowMs: 60 * 60 * 1000 });
  if (!rl.ok) {
    return NextResponse.json(
      { error: 'Too many requests. Try again later.' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfterSec) } }
    );
  }

  if (!process.env.ABACUSAI_API_KEY) {
    return NextResponse.json({ error: 'AI service not configured' }, { status: 503 });
  }

  let body;
  try {
    body = Body.parse(await request.json());
  } catch {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  const breedName = body.breed.replace('-', ' ');
  const traitsStr = body.traits.join(', ');

  const prompt = `Generate 3 short, heartwarming, playful messages that a ${breedName} dog named ${body.dogName} would send to their owner ${body.ownerName}. The dog's personality is: ${traitsStr}.

Messages should be:
- Personal and loving
- Slightly humorous but genuine
- Written in first-person from the dog
- 1-3 sentences each
- Include emojis occasionally (paw prints, hearts)
- Feel like they're really from the dog

Format: Return ONLY the 3 messages, one per line, without numbering or labels.`;

  try {
    const response = await fetch(ABACUS_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.ABACUSAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a creative AI that writes heartwarming, playful messages from dogs to their owners. Keep messages brief, genuine, and emotionally engaging.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.9,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      console.error('LLM API request failed', response.status);
      return NextResponse.json({ error: 'Failed to generate messages' }, { status: 502 });
    }

    const data = await response.json();
    const generatedText: string = data?.choices?.[0]?.message?.content?.trim() ?? '';

    const messages = generatedText
      .split('\n')
      .map((line: string) => line.trim())
      .filter((line: string) => line.length > 0)
      .slice(0, 3);

    if (messages.length === 0) {
      return NextResponse.json({ error: 'No messages generated' }, { status: 502 });
    }

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Error generating dog messages:', error);
    return NextResponse.json({ error: 'Failed to generate messages' }, { status: 500 });
  }
}
