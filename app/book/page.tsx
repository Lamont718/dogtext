import Link from 'next/link';
import { BookOpen, Heart, Printer, Gift } from 'lucide-react';
import { BOOK_PRICE_USD, FIRST_BOOK_LETTERS } from '@/lib/book';

export const metadata = {
  title: "The Book | DogText",
  description: `Your dog's letters to your kids, printed and bound: the dog's photo on the cover, one letter per page. ${BOOK_PRICE_USD} plus shipping. The daily letters are free.`,
};

// What DogText sells: the printed book of the dog's letters. Everything else is free.
export default function BookInfoPage() {
  return (
    <div className="container max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <p className="text-sm font-bold tracking-wider text-[#FF8C42] mb-3">THE BOOK</p>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          A month of letters from your dog, bound into a real book
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          The daily letters are free, forever. The only thing we sell is the book.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-10">
        {[
          { icon: BookOpen, title: 'One letter per page', body: `Every letter your dog wrote to your kids, dated and signed. The first book is ${FIRST_BOOK_LETTERS} letters: a month.` },
          { icon: Heart, title: "Your dog's photo on the cover", body: "\"Coco's Letters to Maya and Leo.\" Their names, your dog, your year." },
          { icon: Printer, title: 'Printed and mailed to you', body: 'An 8x8 softcover, printed by Mixam and shipped to your door.' },
          { icon: Gift, title: 'A keepsake, or a gift', body: 'For the kids, for grandparents, for the day the dog is old and gray.' },
        ].map(({ icon: Icon, title, body }) => (
          <div key={title} className="rounded-2xl border border-gray-200 bg-white p-5">
            <Icon className="w-6 h-6 text-[#FF8C42] mb-2" />
            <p className="font-semibold text-gray-900">{title}</p>
            <p className="text-sm text-gray-600 mt-1">{body}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-[#FFF8F0] p-8 text-center">
        <p className="text-5xl font-bold text-gray-900">${BOOK_PRICE_USD}</p>
        <p className="text-gray-500 mt-1">plus shipping</p>
        <p className="text-gray-600 mt-2 mb-6">
          Printing opens soon. Start the free letters now, and reserve your book from the dashboard once your
          dog has written a few. You&apos;ll see the final price before you pay anything.
        </p>
        <Link
          href="/#try"
          className="inline-block bg-[#FF8C42] hover:bg-[#FF6B1A] text-white font-semibold px-8 py-4 rounded-full shadow-md"
        >
          Start the free letters
        </Link>
      </div>
    </div>
  );
}
