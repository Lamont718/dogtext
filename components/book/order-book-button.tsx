'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '../ui/button';

// Sends the family to Stripe Checkout for the book.
export default function OrderBookButton({ label }: { label: string }) {
  const [going, setGoing] = useState(false);
  const order = async () => {
    setGoing(true);
    try {
      const r = await fetch('/api/book/checkout', { method: 'POST' });
      const j = await r.json();
      if (!r.ok || !j.url) throw new Error(j.error);
      window.location.href = j.url;
    } catch (err) {
      toast.error(err instanceof Error && err.message ? err.message : "Couldn't start checkout. Try again.");
      setGoing(false);
    }
  };
  return (
    <Button onClick={order} disabled={going} className="rounded-full bg-[#FF8C42] hover:bg-[#FF6B1A] text-white px-6 py-6 text-base">
      {going ? 'Opening checkout…' : label}
    </Button>
  );
}
