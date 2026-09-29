'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { MessageCircle, Sparkles, RefreshCcw, Send } from 'lucide-react';
import { toast } from 'sonner';
import ShareBarkButton from '../bark/share-bark-button';
import { sendToDog } from '../../lib/send-to-dog';

interface BarkResponse {
  id: string | null;
  dogId: string;
  messageText: string;
  generatedFor: string;
  ephemeral?: boolean;
}

interface DailyBarkCardProps {
  dogId: string;
  dogName: string;
  dogBreed: string;
  dogPhotoUrl?: string | null;
}

export default function DailyBarkCard({
  dogId,
  dogName,
  dogBreed,
  dogPhotoUrl,
}: DailyBarkCardProps) {
  const [bark, setBark] = useState<BarkResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  // Texting back, right under the morning text.
  const [draft, setDraft] = useState('');
  const [sent, setSent] = useState<string | null>(null);
  const [reply, setReply] = useState('');
  const [replying, setReplying] = useState(false);

  const onReply = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text || replying) return;
    setDraft('');
    setSent(text);
    setReply('');
    setReplying(true);
    try {
      setReply(await sendToDog(dogId, text, setReply));
    } catch (err) {
      setSent(null);
      setDraft(text);
      toast.error(err instanceof Error ? err.message : 'Failed to send');
    } finally {
      setReplying(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(`/api/daily-bark/${dogId}`)
      .then(async (r) => {
        if (!r.ok) {
          const data = await r.json().catch(() => ({}));
          throw new Error(data.error || `Couldn't load today's bark`);
        }
        return r.json();
      })
      .then((data: BarkResponse) => {
        if (!cancelled) setBark(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [dogId]);

  return (
    <Card className="border-0 shadow-lg overflow-hidden bg-gradient-to-br from-[#FFF8F0] to-white">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="w-12 h-12 ring-2 ring-[#FF8C42] ring-offset-2">
            {dogPhotoUrl ? (
              <AvatarImage src={dogPhotoUrl} alt={dogName} />
            ) : (
              <AvatarFallback className="bg-[#FFF8F0] text-[#FF8C42] font-bold">
                {dogName.charAt(0)}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-semibold text-gray-900">{dogName}</span>
              <span className="text-xs text-gray-500">· {dogBreed}</span>
              <span className="ml-auto text-xs font-medium text-[#FF8C42] inline-flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Daily Bark
              </span>
            </div>

            {loading && (
              <div className="space-y-2 mt-3">
                <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" />
                <div className="h-4 bg-gray-100 rounded animate-pulse w-1/2" />
              </div>
            )}

            {!loading && error && (
              <div className="mt-3">
                <p className="text-sm text-gray-600 mb-2">
                  Couldn't fetch this morning's bark. {error}
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setLoading(true);
                    setError(null);
                    fetch(`/api/daily-bark/${dogId}`)
                      .then(async (r) => {
                        if (!r.ok) throw new Error((await r.json()).error || 'retry failed');
                        return r.json();
                      })
                      .then(setBark)
                      .catch((e) => setError(e.message))
                      .finally(() => setLoading(false));
                  }}
                >
                  <RefreshCcw className="w-3 h-3 mr-2" /> Try again
                </Button>
              </div>
            )}

            {!loading && bark && (
              <>
                <div className="mt-2 bg-white border border-gray-100 rounded-2xl rounded-tl-sm p-4 shadow-sm">
                  <p className="text-base text-gray-900 leading-relaxed whitespace-pre-line">
                    {bark.messageText}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 mt-3">
                  {bark.id && !bark.ephemeral && (
                    <ShareBarkButton barkId={bark.id} dogName={dogName} />
                  )}
                  <span className="ml-auto text-xs text-gray-400">
                    {/* generatedFor is a date-only UTC day; read it as UTC or it shows yesterday in the US. */}
                    {new Date(bark.generatedFor).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      timeZone: 'UTC',
                    })}
                  </span>
                </div>

                {sent && (
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-end">
                      <div className="max-w-[85%] bg-[#FF8C42] text-white rounded-2xl rounded-br-md px-4 py-2 text-[15px]">
                        {sent}
                      </div>
                    </div>
                    <div className="max-w-[85%] bg-white border border-gray-100 rounded-2xl rounded-bl-md px-4 py-2 text-[15px] text-gray-900 whitespace-pre-line shadow-sm">
                      {reply || <span className="text-gray-400 italic">{dogName} is typing…</span>}
                    </div>
                  </div>
                )}

                {bark.id && !bark.ephemeral && (
                  sent && !replying ? (
                    <Link
                      href={`/chat?dog=${dogId}`}
                      className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-[#FF8C42] hover:text-[#FF6B1A]"
                    >
                      <MessageCircle className="w-4 h-4" /> Keep texting {dogName}
                    </Link>
                  ) : (
                    <form onSubmit={onReply} className="mt-4 flex gap-2">
                      <input
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        placeholder={`Text ${dogName} back…`}
                        maxLength={1000}
                        disabled={replying}
                        className="flex-1 h-10 rounded-full border border-gray-200 bg-white px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8C42]/40"
                      />
                      <Button
                        type="submit"
                        size="sm"
                        disabled={replying || !draft.trim()}
                        className="h-10 w-10 p-0 rounded-full bg-[#FF8C42] hover:bg-[#FF6B1A] text-white"
                        aria-label="Send"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </form>
                  )
                )}
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
