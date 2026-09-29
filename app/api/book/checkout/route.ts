import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/db';
import { BOOK_PRICE_USD, BOOK_SHIPPING_USD, FIRST_BOOK_LETTERS, bookOrdersOpen, cents } from '@/lib/book';
import { bookTitle } from '@/lib/book-pdf';
import { DOGTEXT_BRAND, stripe } from '@/lib/stripe';
import { SITE_URL } from '@/lib/bark-card';

export const dynamic = 'force-dynamic';

// POST /api/book/checkout -> { url } of a Stripe Checkout page for the book.
export async function POST() {
  if (!bookOrdersOpen()) {
    return NextResponse.json({ error: 'Book orders open soon. Reserve yours for now.' }, { status: 403 });
  }
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      kids: { select: { firstName: true }, orderBy: { createdAt: 'asc' } },
      dogs: { where: { isActive: true }, orderBy: { createdAt: 'asc' }, take: 1, select: { id: true, name: true, breed: true } },
    },
  });
  const dog = user?.dogs[0];
  if (!user || !dog) return NextResponse.json({ error: 'Add your dog first.' }, { status: 400 });

  const letterCount = await prisma.dailyBark.count({ where: { dogId: dog.id } });
  if (letterCount < FIRST_BOOK_LETTERS) {
    return NextResponse.json(
      { error: `The book needs ${FIRST_BOOK_LETTERS} letters. ${dog.name} has written ${letterCount} so far.` },
      { status: 400 },
    );
  }

  const title = bookTitle({ dogName: dog.name, dogBreed: dog.breed, kidNames: user.kids.map((k) => k.firstName), letters: [] });
  const meta = { brand: DOGTEXT_BRAND, dogtextUserId: user.id, letters: String(letterCount) };

  const checkout = await stripe<{ url: string }>('POST', '/checkout/sessions', {
    mode: 'payment',
    customer_email: user.email,
    'line_items[0][quantity]': 1,
    'line_items[0][price_data][currency]': 'usd',
    'line_items[0][price_data][unit_amount]': cents(BOOK_PRICE_USD),
    'line_items[0][price_data][product_data][name]': `${title} (softcover book)`,
    'line_items[0][price_data][product_data][description]': `${letterCount} letters, 8x8 in softcover, printed and mailed to you.`,
    'shipping_address_collection[allowed_countries][0]': 'US',
    'shipping_options[0][shipping_rate_data][type]': 'fixed_amount',
    'shipping_options[0][shipping_rate_data][display_name]': 'Standard shipping',
    'shipping_options[0][shipping_rate_data][fixed_amount][amount]': cents(BOOK_SHIPPING_USD),
    'shipping_options[0][shipping_rate_data][fixed_amount][currency]': 'usd',
    // Tag both the session and its payment: this Stripe account is shared.
    'metadata[brand]': meta.brand,
    'metadata[dogtextUserId]': meta.dogtextUserId,
    'metadata[letters]': meta.letters,
    'payment_intent_data[metadata][brand]': meta.brand,
    'payment_intent_data[description]': `DogText book: ${title}`,
    success_url: `${SITE_URL}/dashboard/book?ordered=1`,
    cancel_url: `${SITE_URL}/dashboard/book`,
  });

  return NextResponse.json({ url: checkout.url });
}
