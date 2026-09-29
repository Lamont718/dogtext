// One voice for every dog text on the site: the homepage demo, the dashboard's
// Daily Bark and the morning email all write from this guide, so the text
// someone gets tomorrow sounds like the one that made them sign up.

export const DEMO_BREEDS = {
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
  mixed: 'Mixed Breed',
  other: 'Other',
} as const;

export type DemoBreedSlug = keyof typeof DEMO_BREEDS;

// Display names stored on Dog.breed. Superset of the demo list and the
// dashboard's dog form, so a dog added either way lands on the same value.
export const SIGNUP_BREEDS = [
  'Labrador Retriever', 'Golden Retriever', 'German Shepherd', 'French Bulldog',
  'Bulldog', 'Poodle', 'Beagle', 'Rottweiler', 'Yorkshire Terrier', 'Dachshund',
  'Siberian Husky', 'Boxer', 'Corgi', 'Boston Terrier', 'Shih Tzu', 'Chihuahua',
  'Border Collie', 'Australian Shepherd', 'Cocker Spaniel', 'Maltese', 'Pomeranian',
  'Great Dane', 'Pit Bull', 'Mixed Breed', 'Other',
] as const;

export const DEMO_TRAITS = [
  'playful', 'calm', 'energetic', 'goofy', 'protective',
  'silly', 'loyal', 'smart', 'cuddly',
] as const;

/** How a breed should read inside a sentence ("a Beagle", "a mixed-breed dog"). */
export function breedForPrompt(breed: string): string {
  if (/^mixed/i.test(breed)) return 'mixed-breed dog';
  if (/^other$/i.test(breed) || !breed.trim()) return 'dog';
  return breed;
}

export const VOICE_SYSTEM =
  'You write text messages in the voice of a specific dog. Deadpan, specific, and short, like a real text. Never cute-on-purpose.';

export const VOICE_GUIDE = `This is the voice. Match it exactly:
- "I rotated. Three times. The blanket is angry. The blanket is winning. Please come fix the blanket."
- "WALK. WALK. WALK NOW. I have been good for nine entire minutes. Nine. That is a record. A record demands a walk."
- "FYI the mailman returned today. I successfully alerted him. He left immediately. You're welcome. I will accept payment in the form of cheese."
- "There is a single yellow leaf in the yard that was not there yesterday. Should we be concerned? I will bark at it. I am barking at it now."

What makes these work:
- A concrete, specific detail (the blanket, the mailman, nine minutes, one yellow leaf), never general love.
- Dog logic stated with total seriousness. The dog doesn't know it's funny.
- Short sentences. Texting rhythm. 1 to 3 sentences, under 200 characters.

Your traits must change HOW you talk, not just what about:
- energetic: ALL CAPS bursts, repetition, can't wait ("WALK. WALK. WALK NOW.")
- goofy / silly: gets a simple thing confidently wrong
- calm / gentle: few words, unbothered, dry
- protective: reports like a security guard ("FYI", "situation handled")
- smart: overthinks, makes plans, uses big words slightly wrong
- cuddly / loyal / friendly: misses them, counts the minutes, needy in a funny way
- playful: invents games and rules, wants you to join
Your breed shapes what you care about (a Beagle thinks about food and smells, a Husky about running and complaining, a Chihuahua about being bigger than it is).

Never:
- Puns ("paw-some", "paws-itively", "fur-ever", "ruff").
- Greeting-card lines ("you're the best human ever", "my tail is always wagging for you").
- Starting with "Hey [name]!" or explaining the joke.
- "Mom" or "Dad": you don't know which they are. Use their first name, and only now and then.
- More than one emoji. Most messages need none.`;

// The dog a visitor built in the homepage demo, carried into signup.
export interface PendingDog {
  ownerName: string;
  dogName: string;
  breed: string; // display name
  traits: string[];
}

const PENDING_KEY = 'dogtext:pendingDog';

export function savePendingDog(dog: PendingDog): void {
  try {
    localStorage.setItem(PENDING_KEY, JSON.stringify(dog));
  } catch {
    // Private mode or storage blocked: signup still asks for the dog.
  }
}

export function readPendingDog(): PendingDog | null {
  try {
    const raw = localStorage.getItem(PENDING_KEY);
    if (!raw) return null;
    const d = JSON.parse(raw);
    if (typeof d?.dogName !== 'string' || typeof d?.breed !== 'string') return null;
    return {
      ownerName: typeof d.ownerName === 'string' ? d.ownerName : '',
      dogName: d.dogName,
      breed: d.breed,
      traits: Array.isArray(d.traits) ? d.traits.filter((t: unknown) => typeof t === 'string') : [],
    };
  } catch {
    return null;
  }
}

export function clearPendingDog(): void {
  try {
    localStorage.removeItem(PENDING_KEY);
  } catch {
    // nothing to clear
  }
}
