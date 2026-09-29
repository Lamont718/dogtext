import { redirect } from 'next/navigation';

// Premium was dropped (2026-09-29): the letters are free and the book is what we sell.
export default function PremiumPage() {
  redirect('/book');
}
