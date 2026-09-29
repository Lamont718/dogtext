'use client';

import { useState } from 'react';
import { Share2 } from 'lucide-react';
import { toast } from 'sonner';
import ShareBarkButton from '../bark/share-bark-button';

interface ShareDemoTextProps {
  dogName: string;
  breed: string; // demo slug
  message: string;
  signature?: string;
}

// Under a homepage-demo text: first tap saves it as a public page (/t/[id]);
// then the usual Share to story button appears with the picture ready. Two
// taps because iPhones only open the share sheet with the image already loaded.
export default function ShareDemoText({ dogName, breed, message, signature }: ShareDemoTextProps) {
  const [id, setId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  if (!signature) return null;

  if (id) {
    return <ShareBarkButton barkId={id} basePath={`/t/${id}`} dogName={dogName} className="mt-2" />;
  }

  const create = async () => {
    setSaving(true);
    try {
      const r = await fetch('/api/share-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dogName, breed, message, signature }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error);
      setId(j.id);
    } catch (err) {
      toast.error(err instanceof Error && err.message ? err.message : "Couldn't make the picture. Try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <button
      type="button"
      onClick={create}
      disabled={saving}
      className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-[#FF8C42] hover:text-[#FF6B1A] disabled:opacity-60"
    >
      <Share2 className="w-4 h-4" />
      {saving ? 'Making the picture…' : 'Share this one'}
    </button>
  );
}
