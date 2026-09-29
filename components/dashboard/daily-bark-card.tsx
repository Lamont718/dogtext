'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { MessageCircle, Sparkles, RefreshCcw } from 'lucide-react';
import ShareBarkButton from '../bark/share-bark-button';

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
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/chat?dog=${dogId}`}>
                      <MessageCircle className="w-3 h-3 mr-2" />
                      Reply in chat
                    </Link>
                  </Button>
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
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
