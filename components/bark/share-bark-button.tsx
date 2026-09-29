'use client';

import { useEffect, useState } from 'react';
import { Share2, Link2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../ui/button';

interface ShareBarkButtonProps {
  barkId: string;
  dogName: string;
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

// Shares the bark as a story-sized picture: on phones it opens the share sheet
// (Instagram, TikTok, Messages...), on computers it downloads the image.
export default function ShareBarkButton({ barkId, dogName, size = 'sm', className }: ShareBarkButtonProps) {
  const [file, setFile] = useState<File | null>(null);
  const fileName = `${dogName.replace(/[^a-z0-9]+/gi, '-').toLowerCase() || 'dog'}-text.png`;

  // Fetch the picture before the tap: iPhones only open the share sheet when
  // it happens right on the tap, not after waiting for a download.
  useEffect(() => {
    let cancelled = false;
    fetch(`/bark/${barkId}/story`)
      .then((r) => (r.ok ? r.blob() : null))
      .then((blob) => {
        if (!cancelled && blob) setFile(new File([blob], fileName, { type: 'image/png' }));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [barkId, fileName]);

  const download = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const onShare = async () => {
    const image = file ?? (await fetch(`/bark/${barkId}/story`).then((r) => (r.ok ? r.blob() : null)).catch(() => null));
    if (!image) {
      toast.error("Couldn't make the picture. Try again.");
      return;
    }
    const shareFile = image instanceof File ? image : new File([image], fileName, { type: 'image/png' });
    if (navigator.canShare?.({ files: [shareFile] })) {
      try {
        await navigator.share({ files: [shareFile], title: `${dogName} sent a text` });
        return;
      } catch (err) {
        if ((err as Error)?.name === 'AbortError') return; // they closed the sheet
      }
    }
    download(shareFile);
    toast.success('Picture saved. Post it to your story!');
  };

  const onCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/bark/${barkId}`);
      toast.success('Link copied. Paste it anywhere.');
    } catch {
      toast.error('Could not copy the link. Try again.');
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className ?? ''}`}>
      <Button size={size} onClick={onShare} className="bg-[#FF8C42] hover:bg-[#FF6B1A] text-white">
        <Share2 className="w-4 h-4 mr-2" />
        Share to story
      </Button>
      <Button size={size} variant="outline" onClick={onCopyLink} aria-label="Copy link">
        <Link2 className="w-4 h-4" />
      </Button>
    </div>
  );
}
