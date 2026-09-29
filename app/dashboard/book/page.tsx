import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { ArrowLeft } from 'lucide-react';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/db';
import ReserveBookButton from '@/components/book/reserve-book-button';
import { BOOK_PRICE_USD, BOOK_SHIPPING_USD, FIRST_BOOK_LETTERS, bookOrdersOpen } from '@/lib/book';
import OrderBookButton from '@/components/book/order-book-button';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Your book | DogText', robots: { index: false } };

const FIRST_BOOK = FIRST_BOOK_LETTERS;

function joinNames(names: string[]): string {
  if (names.length <= 1) return names[0] ?? '';
  return names.slice(0, -1).join(', ') + ' and ' + names[names.length - 1];
}

// A preview of the printed book: a cover, then every letter the dog has
// written, one per page, in order. Printing isn't open yet; parents reserve.
export default async function BookPage({ searchParams }: { searchParams: { ordered?: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/auth/login?callbackUrl=/dashboard/book');

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      bookReservedAt: true,
      bookOrders: { orderBy: { createdAt: 'desc' }, select: { id: true, status: true, letterCount: true, createdAt: true } },
      kids: { select: { firstName: true }, orderBy: { createdAt: 'asc' } },
      dogs: {
        where: { isActive: true },
        orderBy: { createdAt: 'asc' },
        take: 1,
        select: { id: true, name: true, breed: true, photoUrl: true },
      },
    },
  });
  const dog = user?.dogs[0];
  if (!user || !dog) redirect('/dashboard');

  const letters = await prisma.dailyBark.findMany({
    where: { dogId: dog.id },
    orderBy: { generatedFor: 'asc' },
    select: { id: true, messageText: true, generatedFor: true },
  });

  const kidNames = joinNames(user.kids.map((k) => k.firstName));
  const title = kidNames ? `${dog.name}'s Letters to ${kidNames}` : `${dog.name}'s Letters`;
  const progress = Math.min(100, Math.round((letters.length / FIRST_BOOK) * 100));
  const toGo = Math.max(0, FIRST_BOOK - letters.length);
  const canOrder = bookOrdersOpen() && letters.length >= FIRST_BOOK;
  const STATUS: Record<string, string> = {
    paid: 'Paid. Going to the printer.',
    sent_to_mixam: 'At the printer.',
    shipped: 'Shipped. On its way to you.',
  };

  return (
    <div className="min-h-screen bg-[#FFF8F0] py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Link href="/dashboard" className="inline-flex items-center text-sm text-gray-600 hover:text-[#FF8C42] mb-6">
          <ArrowLeft className="w-4 h-4 mr-1" /> Dashboard
        </Link>

        {searchParams.ordered && (
          <div className="rounded-2xl bg-[#FF8C42] text-white p-5 mb-6">
            <p className="font-semibold">Thank you! Your book is ordered.</p>
            <p className="text-white/90 text-sm mt-1">We send it to the printer and it ships to the address you gave. Stripe emailed your receipt.</p>
          </div>
        )}
        {user.bookOrders.length > 0 && (
          <div className="rounded-2xl bg-white border border-gray-200 p-5 mb-6">
            <p className="font-semibold text-gray-900 mb-2">Your orders</p>
            <ul className="text-sm text-gray-700 space-y-1">
              {user.bookOrders.map((o) => (
                <li key={o.id} className="flex justify-between gap-3">
                  <span>{o.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'America/New_York' })} · {o.letterCount} letters</span>
                  <span className="text-gray-500">{STATUS[o.status] ?? o.status}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="rounded-2xl bg-white border border-[#FFB88C] p-5 mb-8">
          <p className="font-semibold text-gray-900">
            {letters.length} of {FIRST_BOOK} letters for the first book
          </p>
          <div className="h-2 rounded-full bg-[#FFF8F0] mt-2 overflow-hidden">
            <div className="h-full bg-[#FF8C42]" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {toGo
              ? `${toGo} more days of letters and it's a month-long book. Here's how it's looking.`
              : "That's a full month of letters: enough for the first book."}
          </p>
        </div>

        {/* Cover */}
        <div className="aspect-[3/4] max-w-sm mx-auto rounded-r-2xl rounded-l-md shadow-2xl bg-gradient-to-br from-[#FF8C42] to-[#FFB6C1] p-8 flex flex-col items-center justify-center text-center text-white mb-10">
          {dog.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={dog.photoUrl} alt={dog.name} className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg mb-6" />
          ) : (
            <div className="w-32 h-32 rounded-full bg-white/25 border-4 border-white flex items-center justify-center text-5xl font-bold mb-6">
              {dog.name.charAt(0)}
            </div>
          )}
          <h1 className="font-serif text-3xl font-bold leading-tight">{title}</h1>
          <p className="mt-3 text-white/90">Letters from the family {dog.breed === 'Mixed Breed' || dog.breed === 'Other' ? 'dog' : dog.breed}</p>
        </div>

        {/* Pages */}
        <div className="space-y-6 mb-10">
          {letters.length === 0 && (
            <p className="text-center text-gray-600">The first letter is on your dashboard. It becomes page one.</p>
          )}
          {letters.map((l, i) => (
            <div key={l.id} className="bg-white rounded-md shadow-md px-8 py-10 border border-gray-100">
              <p className="text-xs uppercase tracking-widest text-gray-400 mb-4">
                {new Date(l.generatedFor).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'UTC' })}
              </p>
              <p className="font-serif text-xl leading-relaxed text-[#2C2C2C] whitespace-pre-line">{l.messageText}</p>
              <p className="font-serif text-right text-[#2C2C2C] mt-6">— {dog.name}</p>
              <p className="text-center text-xs text-gray-300 mt-8">{i + 1}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl bg-white border border-gray-200 p-6 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">A real book for your kids</h2>
          <p className="text-gray-600 mb-5">
            ${BOOK_PRICE_USD} plus shipping, an 8x8 softcover mailed to you: {dog.name}&apos;s photo on the cover, one letter per page.{' '}
            {canOrder
              ? `It holds the ${letters.length} letters written so far.`
              : bookOrdersOpen()
                ? `Ordering opens once ${dog.name} has written ${FIRST_BOOK} letters. Reserve a copy now.`
                : "Printing isn't open yet. Reserve a copy and we'll email you when it is. You'll see the price before you pay anything."}
          </p>
          {canOrder ? (
            <OrderBookButton label={`Order the book: $${BOOK_PRICE_USD} + $${BOOK_SHIPPING_USD.toFixed(2)} shipping`} />
          ) : (
            <ReserveBookButton reserved={Boolean(user.bookReservedAt)} />
          )}
        </div>
      </div>
    </div>
  );
}
