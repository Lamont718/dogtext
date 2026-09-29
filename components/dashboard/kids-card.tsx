'use client';

import { useEffect, useState } from 'react';
import { X, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';

interface Kid {
  id: string;
  firstName: string;
  age: number | null;
}

// Who the family dog writes to. First names (and an optional age, for
// reading level) entered by the parent. Changing the kids rewrites today's
// letter, so onChange reloads it.
export default function KidsCard({ dogName, onChange }: { dogName: string; onChange?: () => void }) {
  const [kids, setKids] = useState<Kid[] | null>(null);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/kids')
      .then((r) => r.json())
      .then((j) => setKids(j.kids ?? []))
      .catch(() => setKids([]));
  }, []);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      const r = await fetch('/api/kids', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName: name, age: age ? Number(age) : null }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error);
      setKids((k) => [...(k ?? []), j.kid]);
      setName('');
      setAge('');
      onChange?.();
    } catch (err) {
      toast.error(err instanceof Error && err.message ? err.message : 'Could not add. Try again.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (kidId: string) => {
    setKids((k) => (k ?? []).filter((x) => x.id !== kidId));
    await fetch('/api/kids', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kidId }),
    }).catch(() => {});
    onChange?.();
  };

  if (kids === null) return null;

  return (
    <Card className="border-[#FFB88C] bg-white">
      <CardContent className="p-5">
        <p className="font-semibold text-gray-900 mb-1">Who does {dogName} write to?</p>
        <p className="text-sm text-gray-600 mb-3">
          {kids.length
            ? `${dogName} writes to them every day. Add an age for easier words.`
            : `Add your kids and ${dogName}'s daily letter is written to them. First names only.`}
        </p>
        {kids.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {kids.map((k) => (
              <span key={k.id} className="inline-flex items-center gap-1 rounded-full bg-[#FFF8F0] px-3 py-1 text-sm text-[#2C2C2C]">
                <span>
                  {k.firstName}
                  {k.age != null && <span className="text-gray-500">{`, ${k.age}`}</span>}
                </span>
                <button type="button" onClick={() => remove(k.id)} aria-label={`Remove ${k.firstName}`} className="ml-1 text-gray-400 hover:text-gray-700">
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        )}
        <form onSubmit={add} className="flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="First name"
            maxLength={30}
            className="flex-1 min-w-0 h-10 rounded-full border border-gray-200 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8C42]/40"
          />
          <input
            value={age}
            onChange={(e) => setAge(e.target.value.replace(/[^0-9]/g, '').slice(0, 2))}
            placeholder="Age"
            inputMode="numeric"
            className="w-16 h-10 rounded-full border border-gray-200 px-3 text-sm text-center focus:outline-none focus:ring-2 focus:ring-[#FF8C42]/40"
          />
          <Button type="submit" disabled={saving || !name.trim()} className="h-10 rounded-full bg-[#FF8C42] hover:bg-[#FF6B1A] text-white">
            <Plus className="w-4 h-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
