// Texting back and forth with your dog. The morning texts (DailyBark) and the
// chat (AiChatMessage) are one thread, the way it looks on a phone: the dog
// texts at 7am, you reply, the dog answers, and it remembers all of it.

import type { Dog, BreedProfile } from '@prisma/client';
import { prisma } from './db';
import { VOICE_GUIDE, VOICE_SYSTEM, breedForPrompt } from './dog-voice';

export interface ThreadMessage {
  id: string;
  messageText: string;
  senderType: 'user' | 'ai';
  createdAt: string;
  /** 'bark' = one of the dog's morning texts. */
  kind?: 'bark';
}

/** The newest `limit` messages of the thread, oldest first. */
export async function loadThread(userId: string, dogId: string, limit = 50): Promise<ThreadMessage[]> {
  const [chats, barks] = await Promise.all([
    prisma.aiChatMessage.findMany({
      where: { userId, dogId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: { id: true, messageText: true, senderType: true, createdAt: true },
    }),
    prisma.dailyBark.findMany({
      where: { userId, dogId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: { id: true, messageText: true, createdAt: true },
    }),
  ]);

  const thread: ThreadMessage[] = [
    ...chats.map((m) => ({
      id: m.id,
      messageText: m.messageText,
      senderType: (m.senderType === 'user' ? 'user' : 'ai') as 'user' | 'ai',
      createdAt: m.createdAt.toISOString(),
    })),
    ...barks.map((b) => ({
      id: `bark-${b.id}`,
      messageText: b.messageText,
      senderType: 'ai' as const,
      createdAt: b.createdAt.toISOString(),
      kind: 'bark' as const,
    })),
  ];

  thread.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  return thread.slice(-limit);
}

type ChatDog = Pick<Dog, 'name' | 'breed' | 'age' | 'ageUnit' | 'gender' | 'personalityTraits' | 'healthConditions'>;

export function buildChatSystemPrompt(
  dog: ChatDog,
  ownerFirstName: string | null,
  breedProfile: Pick<BreedProfile, 'temperament'> | null,
  /** The dog's most recent morning text, so replies to it land. */
  lastMorningText?: string | null,
): string {
  const age = dog.age && dog.ageUnit ? `${dog.age} ${dog.ageUnit} old ` : '';
  const owner = ownerFirstName?.trim() || 'your human';
  const traits = dog.personalityTraits?.length ? dog.personalityTraits.join(', ') : 'a regular dog';

  return `${VOICE_SYSTEM}

You are ${dog.name}, a ${age}${dog.gender ? dog.gender + ' ' : ''}${breedForPrompt(dog.breed)}, texting with ${owner}.
Personality: ${traits}.
${breedProfile?.temperament ? `Breed temperament: ${breedProfile.temperament.slice(0, 200)}` : ''}
${dog.healthConditions?.length ? `Health things ${owner} has told us about: ${dog.healthConditions.join(', ')}.` : ''}

How you write (the quoted examples below are OTHER dogs' texts, only to show the style; none of it happened to you):
${VOICE_GUIDE}

Your memory: the earlier messages in this conversation are your real texts with ${owner}, including the morning texts you sent. Only what is in those messages happened to you. If they ask about something you don't have in those messages, make up something small and new rather than borrowing from the examples. If they're replying to your morning text, pick up that thread.
${lastMorningText ? `\nYour most recent morning text to ${owner} was: "${lastMorningText}"\nWhen they ask about this morning or what you were up to, it's about THAT.\n` : ''}
In a conversation:
- 1 to 3 short sentences. Answer them; you can ask a question back.
- If they are sad or something bad happened, drop the jokes for a moment and be kind and sincere, still as the dog.
- If they ask a real question about your health or an injury: stay in your voice, but say plainly they should call the vet. Never give a diagnosis, a medicine, or a dose.
- If you may have eaten something harmful or it sounds like an emergency: no jokes. Tell them to call the vet or an emergency vet right now. Don't describe symptoms you "feel"; you don't know how you are.
- You are a dog. You don't know about AI, apps or being a character.`;
}

// Words that mean "my dog may have eaten something toxic" or "this is an emergency".
// When a message matches, a fixed line is added to the reply: safety advice
// shouldn't depend on the model remembering to give it.
const DANGER =
  /\b(chocolate(?!\s+labs?\b)|cocoa|grapes?|raisins?|xylitol|sugar[- ]free|gum|onions?|garlic|macadamia|avocado|pills?|medicine|medication|ibuprofen|advil|tylenol|acetaminophen|aspirin|poison(ed|ous)?|toxic|antifreeze|rat bait|bleach|seizures?|not breathing|can'?t breathe|choking|bleeding|blood|collapsed?|hit by a car|swallowed|ate (a|an|some|the) (bone|sock|battery|batteries))\b/i;

export function safetyNote(userMessage: string, dogName: string): string | null {
  if (!DANGER.test(userMessage)) return null;
  return `If ${dogName} may have eaten something toxic or is hurt, call your vet or an emergency vet now. ASPCA Animal Poison Control: (888) 426-4435 (open 24/7).`;
}

/**
 * Runs the dog's reply as a stream of plain text. Calls onDone with the full
 * reply (for saving) once the model finishes.
 */
export async function streamDogReply(
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[],
  onDone: (fullText: string) => Promise<void>,
  /** Fixed text added after the model's reply (see safetyNote). */
  suffix?: string | null,
): Promise<ReadableStream<Uint8Array>> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages,
      stream: true,
      max_tokens: 250,
      temperature: 0.85,
    }),
  });
  if (!response.ok || !response.body) throw new Error(`LLM API request failed (${response.status})`);

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      let buffer = '';
      let full = '';
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          // Server-sent events end in a newline; keep a partial last line for the next chunk.
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';
          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const data = line.slice(6).trim();
            if (data === '[DONE]') continue;
            try {
              const content: string = JSON.parse(data).choices?.[0]?.delta?.content ?? '';
              if (content) {
                full += content;
                controller.enqueue(encoder.encode(content));
              }
            } catch {
              // a malformed event; skip it
            }
          }
        }
        if (suffix) {
          const extra = `\n\n⚠️ ${suffix}`;
          full += extra;
          controller.enqueue(encoder.encode(extra));
        }
        await onDone(full.trim());
        controller.close();
      } catch (error) {
        console.error('Dog reply stream error:', error);
        controller.error(error);
      }
    },
  });
}
