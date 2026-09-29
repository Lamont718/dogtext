// One hand-written letter to kids per breed guide, in the DogText voice
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
      'Maya. I smelled your lunchbox all morning. I did not open it. I only smelled it. It smells like a sandwich and good decisions. See you after school.',
    demoBreed: 'beagle',
  },
  'border-collie': {
    dogName: 'Scout',
    message:
      'Leo and Ava. Your toys were all over the floor. I moved them into a group. They kept not staying in the group. I will keep trying. This is my job.',
    demoBreed: 'border-collie',
  },
  boxer: {
    dogName: 'Tank',
    message:
      'Jalen. I did a zoomie in the kitchen and the rug came with me. The rug is fine. I am fine. Mostly the rug is fine.',
    demoBreed: 'boxer',
  },
  bulldog: {
    dogName: 'Winston',
    message: 'Sofia. I went for a walk to the corner. I decided the corner was enough. It was a very good corner. Tell you more later.',
    demoBreed: 'bulldog',
  },
  'cavalier-king-charles-spaniel': {
    dogName: 'Rosie',
    message:
      'Amara. You were at school for a very long time. I sat by the door the whole time. I was not worried. I was a little worried. Come home.',
    demoBreed: 'cavalier',
  },
  chihuahua: {
    dogName: 'Peanut',
    message:
      'Noah. A very large dog walked past our window. I told him to leave. He left. I would like you to know I did that.',
    demoBreed: 'chihuahua',
  },
  dachshund: {
    dogName: 'Frank',
    message:
      'Zoe. I made a tunnel in your blanket. It is my tunnel now. You can visit my tunnel. Please knock first.',
    demoBreed: 'dachshund',
  },
  'french-bulldog': {
    dogName: 'Mochi',
    message: 'Eli. I snored so loud I woke myself up. I barked at the noise. It was me. We will not talk about this.',
    demoBreed: 'french-bulldog',
  },
  'german-shepherd': {
    dogName: 'Duke',
    message:
      'Jada and Marcus. Report: the backyard is safe. The squirrel is still out there. I have my eyes on the fence. All clear until you get home.',
    demoBreed: 'german-shepherd',
  },
  'golden-retriever': {
    dogName: 'Sunny',
    message:
      'Lily! I brought you a sock as a present. You were at school. I have been holding the sock all day. It is still a present.',
    demoBreed: 'golden-retriever',
  },
  'labrador-retriever': {
    dogName: 'Moose',
    message:
      'Caleb. Breakfast was eleven minutes ago. I forgot what it tasted like. I think I need a second breakfast to remember. Asking for a friend. The friend is me.',
    demoBreed: 'labrador',
  },
  poodle: {
    dogName: 'Juliette',
    message: 'Nia. I got a haircut today. I look fantastic. The cat has not said anything. I think the cat is jealous.',
    demoBreed: 'poodle',
  },
  rottweiler: {
    dogName: 'Bruno',
    message:
      'Isaiah. The doorbell rang. I used my big voice. Then I found out the doorbell was on the TV. Still. I was ready.',
    demoBreed: 'rottweiler',
  },
  'siberian-husky': {
    dogName: 'Bear',
    message:
      'LEO. AVA. ONE SNOWFLAKE FELL TODAY. I SAW IT. I am waiting by the window for the other snowflakes. I will tell you everything.',
    demoBreed: 'husky',
  },
  'yorkshire-terrier': {
    dogName: 'Pixie',
    message:
      'Mia. The vacuum came out today. I was very brave. I was brave from under your bed. Final report: the vacuum lost.',
    demoBreed: 'yorkshire-terrier',
  },
};
