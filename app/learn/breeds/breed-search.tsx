'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export default function BreedSearch({ defaultValue }: { defaultValue: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const [value, setValue] = useState(defaultValue);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next = new URLSearchParams(params.toString());
    if (value.trim()) next.set('q', value.trim());
    else next.delete('q');
    router.push(`/learn/breeds${next.toString() ? `?${next.toString()}` : ''}`);
  };

  return (
    <form onSubmit={submit} className="relative max-w-md">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search breeds by name, temperament…"
        className="pl-10"
        aria-label="Search breeds"
      />
    </form>
  );
}
