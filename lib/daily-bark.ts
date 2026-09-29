import type { Dog, BreedProfile, AiChatMessage } from '@prisma/client';
import { VOICE_GUIDE, VOICE_SYSTEM, breedForPrompt, kidTopicFor, kidVoiceGuide } from './dog-voice';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

const SEASONS: { name: string; months: number[] }[] = [
  { name: 'winter', months: [11, 0, 1] },
  { name: 'spring', months: [2, 3, 4] },
  { name: 'summer', months: [5, 6, 7] },
  { name: 'autumn', months: [8, 9, 10] },
];

function getSeason(d: Date): string {
  const m = d.getUTCMonth();
  return SEASONS.find((s) => s.months.includes(m))?.name ?? 'spring';
}

export interface BarkInputs {
  dog: Pick<Dog, 'name' | 'breed' | 'age' | 'ageUnit' | 'gender' | 'personalityTraits' | 'healthConditions'>;
  ownerFirstName: string | null;
  /** The children the dog writes to. When present, the text is a letter to them. */
  kids?: { firstName: string; age: number | null }[];
  breedProfile: Pick<BreedProfile, 'temperament' | 'energyLevel'> | null;
  recentUserMessage: Pick<AiChatMessage, 'messageText'> | null;
  date: Date;
}

export function buildBarkPrompt(inputs: BarkInputs): string {
  const { dog, ownerFirstName, breedProfile, recentUserMessage, date, kids } = inputs;
  const dayName = date.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' });
  const monthDay = date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
  const season = getSeason(date);
  const ageStr = dog.age && dog.ageUnit ? `${dog.age} ${dog.ageUnit} old` : 'a';
  const genderStr = dog.gender ?? '';
  const ownerLabel = ownerFirstName?.trim() || 'my human';
  const traits = dog.personalityTraits?.length
    ? dog.personalityTraits.join(', ')
    : 'a regular dog';
  const breedTone = breedProfile?.temperament
    ? `Breed temperament: ${breedProfile.temperament.slice(0, 200)}`
    : '';
  const memoryLine = recentUserMessage?.messageText
    ? `Last time we chatted, ${ownerLabel} said: "${recentUserMessage.messageText.slice(0, 200)}". Reference it ONLY if it fits naturally — don't force it.`
    : '';

  if (kids && kids.length) {
    const names = kids.map((k) => (k.age ? `${k.firstName} (age ${k.age})` : k.firstName)).join(', ');
    return `You are ${dog.name}, ${ageStr} ${genderStr} ${breedForPrompt(dog.breed)}, writing today's letter to the children in your family: ${names}.

Personality: ${traits}.
${breedTone}

Today is ${dayName}, ${monthDay}. Season: ${season}. Let the day or season shape what you noticed, if it fits.

Write ONE short letter. Just the letter itself, no title, no quotes, no sign-off line with your name.

${kidVoiceGuide(kids.map((k) => k.firstName), kidTopicFor(dog.name, date))}`;
  }

  return `You are ${dog.name}, ${ageStr} ${genderStr} ${breedForPrompt(dog.breed)}, writing this morning's text to ${ownerLabel}.

Personality: ${traits}.
${breedTone}
${memoryLine}

Today is ${dayName}, ${monthDay}. Season: ${season}. Let the day or season shape what you noticed, if it fits.

Write ONE text about ONE specific small thing that happened this morning or that you're worried about. Just the message itself, no quotes, no preamble.

${VOICE_GUIDE}`;
}

export async function generateDailyBark(inputs: BarkInputs): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const prompt = buildBarkPrompt(inputs);

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
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
        temperature: 0.85,
        max_tokens: 180,
      }),
    });

    if (!response.ok) {
      console.error('Daily bark LLM call failed', response.status);
      return null;
    }

    const data = await response.json();
    const text: string = data?.choices?.[0]?.message?.content?.trim() ?? '';
    if (!text) return null;

    return text.replace(/^["']|["']$/g, '').slice(0, 400);
  } catch (error) {
    console.error('Daily bark generation error:', error);
    return null;
  }
}

export const DEFAULT_TIMEZONE = 'America/New_York';

/**
 * Today's calendar date where the member lives, as UTC midnight of that date
 * (the shape DailyBark.generatedFor stores). Using the UTC date instead made
 * "this morning's" text roll over at 8pm in New York.
 */
export function todayFor(timeZone: string | null | undefined, now = new Date()): Date {
  let ymd: string;
  try {
    ymd = new Intl.DateTimeFormat('en-CA', { timeZone: timeZone || DEFAULT_TIMEZONE }).format(now);
  } catch {
    ymd = new Intl.DateTimeFormat('en-CA', { timeZone: DEFAULT_TIMEZONE }).format(now);
  }
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}
