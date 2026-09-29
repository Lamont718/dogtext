'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../ui/button';

export default function ReserveBookButton({ reserved }: { reserved: boolean }) {
  const [done, setDone] = useState(reserved);
  const [saving, setSaving] = useState(false);

  if (done) {
    return (
      <div className="inline-flex items-center gap-2 rounded-full bg-[#FFF8F0] px-5 py-3 font-semibold text-[#FF8C42]">
        <Check className="w-4 h-4" /> Reserved. We&apos;ll email you when printing opens.
      </div>
    );
  }

  const reserve = async () => {
    setSaving(true);
    try {
      const r = await fetch('/api/book', { method: 'POST' });
      if (!r.ok) throw new Error();
      setDone(true);
      toast.success("Reserved. You'll see the price before paying anything.");
    } catch {
      toast.error('Something went wrong. Try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Button onClick={reserve} disabled={saving} className="rounded-full bg-[#FF8C42] hover:bg-[#FF6B1A] text-white px-6 py-6 text-base">
      {saving ? 'Reserving…' : 'Reserve a printed copy'}
    </Button>
  );
}
