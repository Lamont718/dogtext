import type { Dog, BreedProfile, AiChatMessage } from '@prisma/client';
import { VOICE_GUIDE, VOICE_SYSTEM, breedForPrompt } from './dog-voice';

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
  breedProfile: Pick<BreedProfile, 'temperament' | 'energyLevel'> | null;
  recentUserMessage: Pick<AiChatMessage, 'messageText'> | null;
  date: Date;
}

export function buildBarkPrompt(inputs: BarkInputs): string {
  const { dog, ownerFirstName, breedProfile, recentUserMessage, date } = inputs;
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
        max_tokens: 120,
      }),
    });

    if (!response.ok) {
      console.error('Daily bark LLM call failed', response.status);
      return null;
    }

    const data = await response.json();
    const text: string = data?.choices?.[0]?.message?.content?.trim() ?? '';
    if (!text) return null;

    return text.replace(/^["']|["']$/g, '').slice(0, 280);
  } catch (error) {
    console.error('Daily bark generation error:', error);
    return null;
  }
}

export function todayUtc(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}
