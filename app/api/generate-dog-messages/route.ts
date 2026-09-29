import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getClientIp, rateLimit } from '../../../lib/rate-limit';
import { prisma } from '../../../lib/db';
import { signText } from '../../../lib/text-signature';
import {
  DEMO_BREEDS,
  DEMO_TRAITS,
  VOICE_GUIDE,
  VOICE_SYSTEM,
  KID_TOPICS,
  kidVoiceGuide,
  breedForPrompt,
  type DemoBreedSlug,
} from '../../../lib/dog-voice';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

const ALLOWED_BREEDS = Object.keys(DEMO_BREEDS) as [DemoBreedSlug, ...DemoBreedSlug[]];

const Body = z.object({
  ownerName: z.string().trim().max(30).optional(),
  // Children the dog writes to: first names, entered by the parent.
  kids: z.array(z.string().trim().min(1).max(30)).max(6).optional(),
  dogName: z.string().trim().min(1).max(30),
  breed: z.enum(ALLOWED_BREEDS),
  traits: z.array(z.enum(DEMO_TRAITS)).length(3),
  // Arrived from a breed guide's 'Try it with your dog' (for /admin counts).
  fromBreedPage: z.boolean().optional(),
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

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: 'AI service not configured' }, { status: 503 });
  }

  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await request.json());
  } catch {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  const breedName = breedForPrompt(DEMO_BREEDS[body.breed]);
  const traitsStr = body.traits.join(', ');

  const kids = body.kids?.filter(Boolean) ?? [];
  const owner = body.ownerName || 'your human';
  const topics = [...KID_TOPICS].sort(() => Math.random() - 0.5).slice(0, 3);

  const prompt = kids.length
    ? `You are ${body.dogName}, a ${breedName}. Your personality: ${traitsStr}.

Write 3 separate letters to the children in your family (${kids.join(', ')}), for 3 different days. Make each one sound different: different openings and endings. Only ONE of the three may say "I love you".

${kidVoiceGuide(kids, topics)}

Return JSON: {"messages": ["...", "...", "..."]}`
    : `You are ${body.dogName}, a ${breedName}. Your personality: ${traitsStr}. Your human is ${owner}.

Write 3 separate text messages you'd send ${owner} on 3 different mornings. Each one is about ONE specific small thing that happened or that you're worried about.

The 3 messages are about 3 different things. Use ${owner}'s name once in a while, not every message.

${VOICE_GUIDE}

Return JSON: {"messages": ["...", "...", "..."]}`;

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: VOICE_SYSTEM,
          },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.9,
        max_tokens: 400,
      }),
    });

    if (!response.ok) {
      console.error('LLM API request failed', response.status);
      return NextResponse.json({ error: 'Failed to generate messages' }, { status: 502 });
    }

    const data = await response.json();
    const generatedText: string = data?.choices?.[0]?.message?.content?.trim() ?? '';

    let parsed: unknown;
    try {
      parsed = JSON.parse(generatedText)?.messages;
    } catch {
      parsed = null;
    }
    const messages = (Array.isArray(parsed) ? parsed : [])
      .filter((m): m is string => typeof m === 'string')
      .map((m) => m.trim())
      .filter((m) => m.length > 0)
      .slice(0, 3);

    if (messages.length === 0) {
      return NextResponse.json({ error: 'No messages generated' }, { status: 502 });
    }

    await prisma.demoRun
      .create({ data: { breed: body.breed, fromBreedPage: body.fromBreedPage ?? false } })
      .catch(() => {});

    // Each text is signed so the visitor can share it later (/api/share-text).
    const signatures = messages.map((m) => signText(body.dogName, body.breed, m));
    return NextResponse.json({ messages, signatures });
  } catch (error) {
    console.error('Error generating dog messages:', error);
    return NextResponse.json({ error: 'Failed to generate messages' }, { status: 500 });
  }
}
