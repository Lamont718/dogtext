import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const SAMPLE_USER_EMAIL = 'samples@dogtext.local';

const samples = [
  {
    name: 'Coco',
    breed: 'Cavalier King Charles Spaniel',
    personalityTraits: ['affectionate', 'playful'],
    message:
      "Dad, the squirrel by the window is plotting again. Send help. Or treats. Either works.\n\nAlso — when are you coming home? Walk soon? 💛",
  },
  {
    name: 'Bear',
    breed: 'Siberian Husky',
    personalityTraits: ['energetic', 'vocal'],
    message:
      "WALK. WALK. WALK NOW. I have been good for nine entire minutes. Nine.\n\nThat is a record. A record demands a walk. This is how records work.",
  },
  {
    name: 'Mochi',
    breed: 'French Bulldog',
    personalityTraits: ['affectionate', 'silly'],
    message:
      "Mom. I rotated. Three times. The blanket is angry. The blanket is winning.\n\nPlease come fix the blanket. I cannot sleep when the blanket is angry.",
  },
  {
    name: 'Rocky',
    breed: 'Boxer',
    personalityTraits: ['loyal', 'energetic'],
    message:
      "FYI the mailman returned today. I successfully alerted him. He left immediately.\n\nYou're welcome. I will accept payment in the form of cheese.",
  },
  {
    name: 'Sadie',
    breed: 'Golden Retriever',
    personalityTraits: ['friendly', 'playful'],
    message:
      "GUESS WHO MADE NEW FRIENDS AT THE DOG PARK YESTERDAY. THIS GIRL.\n\nAll of them. All of them are MY friends now. The lab. The corgi. The two pugs. The man with the tennis ball. We are a unit. 🎾",
  },
  {
    name: 'Pixel',
    breed: 'Yorkshire Terrier',
    personalityTraits: ['alert', 'curious'],
    message:
      "There is a single yellow leaf in the yard that was not there yesterday.\n\nShould we be concerned? Should I bark at it? I will bark at it. I am barking at it now.",
  },
];

async function main() {
  // upsert sample user
  const password = await bcrypt.hash(`sample-${Date.now()}`, 10);
  const user = await prisma.user.upsert({
    where: { email: SAMPLE_USER_EMAIL },
    update: {},
    create: {
      email: SAMPLE_USER_EMAIL,
      firstName: 'Sample',
      lastName: 'Pack',
      password,
      subscriptionTier: 'FREE',
    },
  });

  for (const s of samples) {
    let dog = await prisma.dog.findFirst({
      where: { userId: user.id, name: s.name },
    });
    if (!dog) {
      dog = await prisma.dog.create({
        data: {
          userId: user.id,
          name: s.name,
          breed: s.breed,
          age: 3,
          ageUnit: 'years',
          weight: 30,
          weightUnit: 'lbs',
          gender: 'unknown',
          personalityTraits: s.personalityTraits,
          healthConditions: [],
        },
      });
    }

    const generatedFor = new Date();
    generatedFor.setUTCHours(0, 0, 0, 0);

    const existing = await prisma.dailyBark.findFirst({
      where: { dogId: dog.id, generatedFor },
    });

    if (!existing) {
      await prisma.dailyBark.create({
        data: {
          userId: user.id,
          dogId: dog.id,
          generatedFor,
          messageText: s.message,
        },
      });
      console.log(`✓ Bark created: ${s.name} (${s.breed})`);
    } else {
      await prisma.dailyBark.update({
        where: { id: existing.id },
        data: { messageText: s.message },
      });
      console.log(`↻ Bark refreshed: ${s.name} (${s.breed})`);
    }
  }

  await prisma.$disconnect();
  console.log(`\nDone. ${samples.length} sample barks ready.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
