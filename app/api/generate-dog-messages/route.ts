import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getClientIp, rateLimit } from '../../../lib/rate-limit';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

const ALLOWED_BREEDS = [
  'golden-retriever', 'labrador', 'german-shepherd', 'french-bulldog',
  'beagle', 'poodle', 'bulldog', 'rottweiler', 'yorkshire-terrier',
  'boxer', 'dachshund', 'husky', 'corgi', 'chihuahua', 'mixed', 'other',
] as const;

const BREED_NAMES: Record<(typeof ALLOWED_BREEDS)[number], string> = {
  'golden-retriever': 'Golden Retriever',
  labrador: 'Labrador Retriever',
  'german-shepherd': 'German Shepherd',
  'french-bulldog': 'French Bulldog',
  beagle: 'Beagle',
  poodle: 'Poodle',
  bulldog: 'Bulldog',
  rottweiler: 'Rottweiler',
  'yorkshire-terrier': 'Yorkshire Terrier',
  boxer: 'Boxer',
  dachshund: 'Dachshund',
  husky: 'Siberian Husky',
  corgi: 'Corgi',
  chihuahua: 'Chihuahua',
  mixed: 'mixed-breed dog',
  other: 'dog',
};

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

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: 'AI service not configured' }, { status: 503 });
  }

  let body;
  try {
    body = Body.parse(await request.json());
  } catch {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  const breedName = BREED_NAMES[body.breed];
  const traitsStr = body.traits.join(', ');

  const prompt = `You are ${body.dogName}, a ${breedName}. Your personality: ${traitsStr}. Your human is ${body.ownerName}.

Write 3 separate text messages you'd send ${body.ownerName} on 3 different mornings. Each one is about ONE specific small thing that happened or that you're worried about.

This is the voice. Match it exactly:
- "Mom. I rotated. Three times. The blanket is angry. The blanket is winning. Please come fix the blanket."
- "WALK. WALK. WALK NOW. I have been good for nine entire minutes. Nine. That is a record. A record demands a walk."
- "FYI the mailman returned today. I successfully alerted him. He left immediately. You're welcome. I will accept payment in the form of cheese."
- "There is a single yellow leaf in the yard that was not there yesterday. Should we be concerned? I will bark at it. I am barking at it now."

What makes these work:
- A concrete, specific detail (the blanket, the mailman, nine minutes, one yellow leaf), never general love.
- Dog logic stated with total seriousness. The dog doesn't know it's funny.
- Short sentences. Texting rhythm. 1 to 3 sentences, under 200 characters.
- The 3 messages are about 3 different things.

Your traits must change HOW you talk, not just what about:
- energetic: ALL CAPS bursts, repetition, can't wait ("WALK. WALK. WALK NOW.")
- goofy / silly: gets a simple thing confidently wrong
- calm: few words, unbothered, dry
- protective: reports like a security guard ("FYI", "situation handled")
- smart: overthinks, makes plans, uses big words slightly wrong
- cuddly / loyal: misses them, counts the minutes, needy in a funny way
- playful: invents games and rules, wants you to join
Your breed shapes what you care about (a Beagle thinks about food and smells, a Husky about running and complaining, a Chihuahua about being bigger than it is).
Call your human by name or "Mom"/"Dad" once in a while, not every message.

Never:
- Puns ("paw-some", "paws-itively", "fur-ever", "ruff").
- Greeting-card lines ("you're the best human ever", "my tail is always wagging for you").
- Starting with "Hey ${body.ownerName}!" or explaining the joke.
- More than one emoji in a message. Most messages need none.

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
            content: 'You write text messages in the voice of a specific dog. Deadpan, specific, and short, like a real text. Never cute-on-purpose.',
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

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Error generating dog messages:', error);
    return NextResponse.json({ error: 'Failed to generate messages' }, { status: 500 });
  }
}
