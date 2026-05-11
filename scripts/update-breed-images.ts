import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const breedMap: Record<string, string> = {
  'labrador-retriever': 'labrador',
  'golden-retriever': 'retriever/golden',
  'german-shepherd': 'german/shepherd',
  'french-bulldog': 'bulldog/french',
  'poodle': 'poodle/standard',
  'bulldog': 'bulldog/english',
  'beagle': 'beagle',
  'rottweiler': 'rottweiler',
  'yorkshire-terrier': 'terrier/yorkshire',
  'dachshund': 'dachshund',
  'boxer': 'boxer',
  'siberian-husky': 'husky',
  'border-collie': 'collie/border',
  'chihuahua': 'chihuahua',
  'cavalier-king-charles-spaniel': 'spaniel/cocker',
};

async function fetchImage(dogCeoBreed: string): Promise<string | null> {
  try {
    const res = await fetch(`https://dog.ceo/api/breed/${dogCeoBreed}/images/random`);
    if (!res.ok) return null;
    const data = (await res.json()) as { message: string; status: string };
    return data.status === 'success' ? data.message : null;
  } catch {
    return null;
  }
}

async function main() {
  let ok = 0;
  let miss = 0;
  for (const [slug, dogCeoBreed] of Object.entries(breedMap)) {
    const url = await fetchImage(dogCeoBreed);
    if (!url) {
      console.log(`✗ ${slug} (dog.ceo ${dogCeoBreed} failed)`);
      miss++;
      continue;
    }
    await prisma.breedProfile.update({
      where: { slug },
      data: { imageUrl: url },
    });
    console.log(`✓ ${slug} → ${url}`);
    ok++;
  }
  console.log(`\nDone: ${ok} updated, ${miss} missed.`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
