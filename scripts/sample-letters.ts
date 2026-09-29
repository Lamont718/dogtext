// Rewrites the six homepage sample texts as letters to kids (run once, 2026-09-29).
// Run: npx tsx --require dotenv/config scripts/sample-letters.ts
import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
// Hand-written letters to kids, one per sample dog (the homepage strip).
const LETTERS: Record<string, string> = {
  Coco: "Maya. You left your drawing on the floor. I sat on it so it would not blow away. It did not blow away. You're welcome. It is a little flat now.",
  Bear: 'LEO. AVA. ONE SNOWFLAKE FELL TODAY. I SAW IT. I am waiting by the window for the others. I will tell you everything after school.',
  Mochi: 'Jalen. I took a nap on your pillow. It was the best nap of my life. I left you some fur as a thank-you. You do not have to thank me back.',
  Rocky: 'Sofia. Bath report: you had one. I did not. This is how it should be. The bathtub and I have an understanding.',
  Sadie: 'Noah and Zoe! I found your soccer ball. I kept it safe in my mouth all afternoon. It is a little wet. It is still a great ball.',
  Pixel: 'Amara. The mail carrier came to our door today. I said a lot of things to him. He left. I think he got the message. I love you.',
};
(async () => {
  const barks = await p.dailyBark.findMany({ where: { user: { email: 'samples@dogtext.local' } }, select: { id: true, dog: { select: { name: true } } } });
  for (const b of barks) {
    const text = LETTERS[b.dog.name];
    if (!text) { console.log('no letter for', b.dog.name); continue; }
    await p.dailyBark.update({ where: { id: b.id }, data: { messageText: text } });
    console.log('updated', b.dog.name);
  }
  await p.$disconnect();
})();
