// Print-ready files for the book, to upload to Mixam: an 8x8 in softcover,
// saddle-stitched. Two PDFs, both 8.25 x 8.25 in pages (8 in trim + 0.125 in
// bleed on every edge):
//   interior: title page, one letter per page, padded to a multiple of 4
//             ("Draw Coco here" pages), since stapled books fold in fours
//   cover:    4 pages (outside front, inside front, inside back, outside back)

import { PDFDocument, PDFFont, PDFPage, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { BOOK_BLEED_IN, BOOK_TRIM_IN } from './book';
import { SITE_HOST } from './bark-card';

const PT = 72;
const PAGE = (BOOK_TRIM_IN + 2 * BOOK_BLEED_IN) * PT; // 594 pt
const BLEED = BOOK_BLEED_IN * PT;
const SAFE = BLEED + 0.6 * PT; // keep text 0.6 in inside the trim

const ORANGE = rgb(1, 0.549, 0.259); // #FF8C42
const INK = rgb(0.173, 0.173, 0.173); // #2C2C2C
const GRAY = rgb(0.55, 0.55, 0.55);
const LIGHT = rgb(0.85, 0.85, 0.85);
const WHITE = rgb(1, 1, 1);

const FONT_BASE = 'https://cdn.jsdelivr.net/fontsource/fonts';
const FONT_FILES = {
  serif: 'lora@latest/latin-400-normal.ttf',
  serifBold: 'lora@latest/latin-700-normal.ttf',
  serifItalic: 'lora@latest/latin-400-italic.ttf',
} as const;
type Fonts = Record<keyof typeof FONT_FILES, PDFFont>;

let fontBytes: Promise<Record<keyof typeof FONT_FILES, ArrayBuffer>> | null = null;
function loadFontBytes() {
  fontBytes ??= Promise.all(
    Object.entries(FONT_FILES).map(async ([k, path]) => {
      const r = await fetch(`${FONT_BASE}/${path}`);
      if (!r.ok) throw new Error(`font ${path} ${r.status}`);
      return [k, await r.arrayBuffer()] as const;
    }),
  )
    .then((pairs) => Object.fromEntries(pairs) as Record<keyof typeof FONT_FILES, ArrayBuffer>)
    .catch((e) => {
      fontBytes = null;
      throw e;
    });
  return fontBytes;
}

async function embedFonts(doc: PDFDocument): Promise<Fonts> {
  doc.registerFontkit(fontkit);
  const bytes = await loadFontBytes();
  const out = {} as Fonts;
  for (const k of Object.keys(FONT_FILES) as (keyof typeof FONT_FILES)[]) {
    out[k] = await doc.embedFont(bytes[k], { subset: true });
  }
  return out;
}

/** Drops characters the font can't draw (emoji, mostly) so the PDF never fails. */
function printable(text: string, font: PDFFont): string {
  const ok = new Set(font.getCharacterSet());
  return [...text]
    .filter((ch) => ch === '\n' || ok.has(ch.codePointAt(0)!))
    .join('')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

function wrap(text: string, font: PDFFont, size: number, width: number): string[] {
  const lines: string[] = [];
  for (const para of text.split('\n')) {
    if (!para.trim()) {
      lines.push('');
      continue;
    }
    let line = '';
    for (const word of para.split(/\s+/)) {
      const next = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(next, size) <= width || !line) line = next;
      else {
        lines.push(line);
        line = word;
      }
    }
    if (line) lines.push(line);
  }
  return lines;
}

function centered(page: PDFPage, text: string, font: PDFFont, size: number, y: number, color = INK) {
  const w = font.widthOfTextAtSize(text, size);
  page.drawText(text, { x: (PAGE - w) / 2, y, size, font, color });
}

/** Wrapped, centered block; shrinks the type until it fits the box. */
function centeredBlock(
  page: PDFPage, text: string, font: PDFFont, maxSize: number, minSize: number, width: number, top: number, maxHeight: number, color = INK,
): number {
  let size = maxSize;
  let lines = wrap(text, font, size, width);
  while (size > minSize && lines.length * size * 1.3 > maxHeight) {
    size -= 1;
    lines = wrap(text, font, size, width);
  }
  let y = top - size;
  for (const l of lines) {
    centered(page, l, font, size, y, color);
    y -= size * 1.3;
  }
  return y;
}

function joinNames(names: string[]): string {
  if (names.length <= 1) return names[0] ?? '';
  return names.slice(0, -1).join(', ') + ' and ' + names[names.length - 1];
}

export interface BookInput {
  dogName: string;
  dogBreed: string;
  kidNames: string[];
  /** JPEG bytes of the dog's photo, if there is one. */
  photoJpeg?: Uint8Array | null;
  letters: { date: Date; text: string }[];
}

export function bookTitle(input: BookInput): string {
  const kids = joinNames(input.kidNames);
  return kids ? `${input.dogName}'s Letters to ${kids}` : `${input.dogName}'s Letters`;
}

const fmtDay = (d: Date) =>
  d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });

export async function buildInteriorPdf(input: BookInput): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle(`${bookTitle(input)} (interior)`);
  const f = await embedFonts(doc);
  const textWidth = PAGE - 2 * SAFE;

  // 1. Title page
  const title = doc.addPage([PAGE, PAGE]);
  const afterTitle = centeredBlock(title, printable(bookTitle(input), f.serifBold), f.serifBold, 34, 22, textWidth, PAGE * 0.62, 150);
  const breed = /^(mixed|other)/i.test(input.dogBreed) ? 'dog' : input.dogBreed;
  centered(title, printable(`Letters from the family ${breed}`, f.serifItalic), f.serifItalic, 14, afterTitle - 12, GRAY);
  if (input.letters.length) {
    const range = `${fmtDay(input.letters[0].date)} to ${fmtDay(input.letters[input.letters.length - 1].date)}`;
    centeredBlock(title, range, f.serif, 10, 8, textWidth, afterTitle - 40, 40, GRAY);
  }

  // 2. One letter per page
  input.letters.forEach((letter, i) => {
    const page = doc.addPage([PAGE, PAGE]);
    const top = PAGE - SAFE;
    const date = fmtDay(letter.date).toUpperCase();
    page.drawText(date, { x: SAFE, y: top - 9, size: 9, font: f.serif, color: GRAY });

    const body = printable(letter.text, f.serif);
    // Big enough to read aloud to a kid; shrinks only for long letters.
    let size = 26;
    let lines = wrap(body, f.serif, size, textWidth);
    const room = PAGE - 2 * SAFE - 120;
    while (size > 14 && (lines.length + 1.6) * size * 1.45 > room) {
      size -= 1;
      lines = wrap(body, f.serif, size, textWidth);
    }
    // Center the letter (and its signature) in the space under the date.
    const blockHeight = (lines.length + 1.6) * size * 1.45;
    const areaTop = top - 40;
    const areaBottom = SAFE + 10;
    let y = areaTop - (areaTop - areaBottom - blockHeight) / 2 - size;
    page.drawLine({ start: { x: SAFE, y: top - 20 }, end: { x: SAFE + 36, y: top - 20 }, thickness: 2, color: ORANGE });
    for (const l of lines) {
      page.drawText(l, { x: SAFE, y, size, font: f.serif, color: INK });
      y -= size * 1.45;
    }
    const sig = printable(`— ${input.dogName}`, f.serifItalic);
    const sw = f.serifItalic.widthOfTextAtSize(sig, size);
    page.drawText(sig, { x: PAGE - SAFE - sw, y: y - size * 0.6, size, font: f.serifItalic, color: INK });
    centered(page, String(i + 2), f.serif, 9, SAFE - 18, GRAY);
  });

  // 3. Pad to a multiple of 4 (stapled books fold in fours) with drawing pages
  while (doc.getPageCount() % 4 !== 0) {
    const page = doc.addPage([PAGE, PAGE]);
    centered(page, printable(`Draw ${input.dogName} here`, f.serifItalic), f.serifItalic, 16, PAGE - SAFE - 16, GRAY);
    page.drawRectangle({
      x: SAFE, y: SAFE, width: textWidth, height: PAGE - 2 * SAFE - 40,
      borderColor: LIGHT, borderWidth: 1.5, borderDashArray: [6, 6],
    });
  }

  return doc.save();
}

export async function buildCoverPdf(input: BookInput): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle(`${bookTitle(input)} (cover)`);
  const f = await embedFonts(doc);
  const textWidth = PAGE - 2 * SAFE;

  // Outside front
  const front = doc.addPage([PAGE, PAGE]);
  front.drawRectangle({ x: 0, y: 0, width: PAGE, height: PAGE, color: ORANGE });
  const r = 1.3 * PT; // photo circle radius
  const cy = PAGE * 0.63;
  if (input.photoJpeg?.length) {
    // A photo print with a white border (pdf-lib can't crop to a circle).
    const img = await doc.embedJpg(input.photoJpeg);
    const side = r * 2;
    const border = 10;
    front.drawRectangle({
      x: PAGE / 2 - side / 2 - border, y: cy - side / 2 - border, width: side + 2 * border, height: side + 2 * border,
      color: WHITE,
    });
    front.drawImage(img, { x: PAGE / 2 - side / 2, y: cy - side / 2, width: side, height: side });
  } else {
    front.drawCircle({ x: PAGE / 2, y: cy, size: r + 5, color: WHITE });
    front.drawCircle({ x: PAGE / 2, y: cy, size: r, color: rgb(1, 0.72, 0.55) });
    const initial = input.dogName.charAt(0).toUpperCase();
    const iw = f.serifBold.widthOfTextAtSize(initial, 64);
    front.drawText(initial, { x: PAGE / 2 - iw / 2, y: cy - 22, size: 64, font: f.serifBold, color: WHITE });
  }
  const after = centeredBlock(front, printable(bookTitle(input), f.serifBold), f.serifBold, 30, 20, textWidth, cy - r - 30, 110, WHITE);
  const breed = /^(mixed|other)/i.test(input.dogBreed) ? 'dog' : input.dogBreed;
  centered(front, printable(`Letters from the family ${breed}`, f.serifItalic), f.serifItalic, 13, after - 8, WHITE);

  // Inside front and inside back: blank
  doc.addPage([PAGE, PAGE]);
  doc.addPage([PAGE, PAGE]);

  // Outside back
  const back = doc.addPage([PAGE, PAGE]);
  back.drawRectangle({ x: 0, y: 0, width: PAGE, height: PAGE, color: ORANGE });
  const kids = joinNames(input.kidNames) || 'the family';
  centeredBlock(
    back,
    printable(`${input.dogName} wrote ${kids} a letter every day. These are ${input.letters.length} of them.`, f.serifItalic),
    f.serifItalic, 16, 12, textWidth * 0.8, PAGE * 0.58, 120, WHITE,
  );
  centered(back, `DogText  ·  ${SITE_HOST}`, f.serif, 10, SAFE + 10, WHITE);

  return doc.save();
}

/** Loads a family's book from the database (their first dog, all its letters). */
export async function loadBookInput(userId: string): Promise<BookInput | null> {
  const { prisma } = await import('./db');
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      kids: { select: { firstName: true }, orderBy: { createdAt: 'asc' } },
      dogs: {
        where: { isActive: true },
        orderBy: { createdAt: 'asc' },
        take: 1,
        select: { id: true, name: true, breed: true, photo: { select: { data: true } } },
      },
    },
  });
  const dog = user?.dogs[0];
  if (!user || !dog) return null;
  const letters = await prisma.dailyBark.findMany({
    where: { dogId: dog.id },
    orderBy: { generatedFor: 'asc' },
    select: { generatedFor: true, messageText: true },
  });
  return {
    dogName: dog.name,
    dogBreed: dog.breed,
    kidNames: user.kids.map((k) => k.firstName),
    photoJpeg: dog.photo?.data ? new Uint8Array(dog.photo.data) : null,
    letters: letters.map((l) => ({ date: l.generatedFor, text: l.messageText })),
  };
}
