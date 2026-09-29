'use client';

import { useState } from 'react';

const NEXT: Record<string, { status: string; label: string } | undefined> = {
  paid: { status: 'sent_to_mixam', label: 'Mark sent to Mixam' },
  sent_to_mixam: { status: 'shipped', label: 'Mark shipped' },
};
const LABEL: Record<string, string> = { paid: 'Paid, not sent to Mixam yet', sent_to_mixam: 'At Mixam', shipped: 'Shipped' };

export default function OrderStatusButtons({ id, status }: { id: string; status: string }) {
  const [current, setCurrent] = useState(status);
  const [saving, setSaving] = useState(false);
  const next = NEXT[current];
  const advance = async () => {
    if (!next) return;
    setSaving(true);
    const r = await fetch('/api/admin/book-orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: next.status }),
    }).catch(() => null);
    if (r?.ok) setCurrent(next.status);
    setSaving(false);
  };
  return (
    <span className="inline-flex items-center gap-2">
      <span className={current === 'paid' ? 'font-semibold text-red-600' : 'text-gray-500'}>{LABEL[current] ?? current}</span>
      {next && (
        <button onClick={advance} disabled={saving} className="rounded-full border border-[#FF8C42] px-3 py-0.5 text-[#FF8C42] hover:bg-[#FFF8F0]">
          {saving ? '…' : next.label}
        </button>
      )}
    </span>
  );
}
