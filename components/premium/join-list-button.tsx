'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Check } from 'lucide-react';
import { toast } from 'sonner';

const JOINED_EVENT = 'dogtext:waitlist-joined';

interface JoinListButtonProps {
  plan: 'PREMIUM' | 'FAMILY';
  highlighted?: boolean;
}

// Paid plans aren't open yet: this puts the person on that plan's list
// (User.interestedPlan). Signed out, it goes through signup with ?plan=.
export default function JoinListButton({ plan, highlighted }: JoinListButtonProps) {
  const { data: session, status } = useSession();
  const [joined, setJoined] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status !== 'authenticated') return;
    fetch('/api/user/waitlist')
      .then((r) => r.json())
      .then((d) => setJoined(d.plan))
      .catch(() => {});
  }, [status]);

  // Someone is on one list at a time: when another card's button switches it,
  // this card hears about it.
  useEffect(() => {
    const onJoin = (e: Event) => setJoined((e as CustomEvent<string>).detail);
    window.addEventListener(JOINED_EVENT, onJoin);
    return () => window.removeEventListener(JOINED_EVENT, onJoin);
  }, []);

  const className = `block w-full text-center py-3 rounded-full font-semibold transition-colors ${
    highlighted
      ? 'bg-[#FF8C42] hover:bg-[#FF6B1A] text-white'
      : 'border-2 border-gray-300 hover:border-[#FF8C42] hover:text-[#FF8C42] text-gray-700 dark:text-gray-200'
  }`;

  if (joined === plan) {
    return (
      <div className="flex items-center justify-center gap-2 py-3 rounded-full bg-[#FFF8F0] text-[#FF8C42] font-semibold">
        <Check className="w-4 h-4" /> You&apos;re on the list
      </div>
    );
  }

  if (!session) {
    return (
      <Link href={`/auth/signup?plan=${plan.toLowerCase()}`} className={className}>
        Join the list
      </Link>
    );
  }

  const join = async () => {
    setSaving(true);
    try {
      const r = await fetch('/api/user/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      if (!r.ok) throw new Error();
      window.dispatchEvent(new CustomEvent(JOINED_EVENT, { detail: plan }));
      toast.success("You're on the list. We'll email you when it opens, at today's price.");
    } catch {
      toast.error('Something went wrong. Try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <button type="button" onClick={join} disabled={saving} className={className}>
      {saving ? 'Joining…' : 'Join the list'}
    </button>
  );
}
