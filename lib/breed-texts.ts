// One hand-written morning text per breed guide, in the DogText voice
// (lib/dog-voice.ts). Shown near the top of /learn/breeds/[slug] so someone
// reading about their breed sees what the product is before they scroll.
// Keys are BreedProfile slugs.

import type { DemoBreedSlug } from './dog-voice';

export interface BreedText {
  dogName: string;
  message: string;
  /** Which demo breed to preselect when they try it with their own dog. */
  demoBreed: DemoBreedSlug;
}

export const BREED_TEXTS: Record<string, BreedText> = {
  beagle: {
    dogName: 'Waffles',
    message:
      'I have located a smell. It is under the couch. It is either a cracker or treasure. I will not rest until I know. Please move the couch.',
    demoBreed: 'beagle',
  },
  'border-collie': {
    dogName: 'Scout',
    message:
      'The children will not stay in a group. I have tried everything. They keep leaving. Please come home and help me organize them.',
    demoBreed: 'border-collie',
  },
  boxer: {
    dogName: 'Tank',
    message:
      'I did a zoomie in the kitchen and the rug came with me. The rug and I are fine. The vase is fine. Mostly the vase is fine.',
    demoBreed: 'boxer',
  },
  bulldog: {
    dogName: 'Winston',
    message: 'Walk update: I went to the corner. I have decided the corner was enough. Please come carry me home.',
    demoBreed: 'bulldog',
  },
  'cavalier-king-charles-spaniel': {
    dogName: 'Rosie',
    message:
      'You left the room for four minutes. I sat by the door for all four. I am not saying I was worried. I was worried.',
    demoBreed: 'cavalier',
  },
  chihuahua: {
    dogName: 'Peanut',
    message:
      'A very large dog walked past our window. I told him to leave. He left. I would like everyone to know I did that.',
    demoBreed: 'chihuahua',
  },
  dachshund: {
    dogName: 'Frank',
    message:
      'I have tunneled into the blanket fort. Do not look for me. I am not coming out until there is cheese.',
    demoBreed: 'dachshund',
  },
  'french-bulldog': {
    dogName: 'Mochi',
    message: 'I snored so loud I woke myself up. I barked at the noise. It was me. We will not discuss this.',
    demoBreed: 'french-bulldog',
  },
  'german-shepherd': {
    dogName: 'Duke',
    message:
      'Perimeter check complete. Mailman: handled. Squirrel: still at large. I have eyes on the fence. You may come home now.',
    demoBreed: 'german-shepherd',
  },
  'golden-retriever': {
    dogName: 'Sunny',
    message:
      'I brought you a sock as a gift. You were not home. I have been holding the sock for an hour. It is still a gift.',
    demoBreed: 'golden-retriever',
  },
  'labrador-retriever': {
    dogName: 'Moose',
    message:
      'Breakfast was eleven minutes ago. I have forgotten what it tasted like. I think I need a second breakfast to remember.',
    demoBreed: 'labrador',
  },
  poodle: {
    dogName: 'Juliette',
    message: 'I have been groomed. I look magnificent. The cat has not said anything. I believe the cat is jealous.',
    demoBreed: 'poodle',
  },
  rottweiler: {
    dogName: 'Bruno',
    message:
      'Someone rang the doorbell. I used my big voice. Then I remembered the doorbell was on the TV. Still. Better safe.',
    demoBreed: 'rottweiler',
  },
  'siberian-husky': {
    dogName: 'Bear',
    message:
      'IT IS 58 DEGREES. THIS IS UNACCEPTABLE. I am lying on the kitchen tile in protest. I have filed a complaint with the fridge.',
    demoBreed: 'husky',
  },
  'yorkshire-terrier': {
    dogName: 'Pixie',
    message:
      'The vacuum came out today. I stood my ground. Then I stood my ground from under the bed. Final report: the vacuum lost.',
    demoBreed: 'yorkshire-terrier',
  },
};
