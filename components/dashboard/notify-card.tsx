'use client';

import { useEffect, useState } from 'react';
import { Bell, BellOff, Share, PlusSquare } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';

// Turn the morning text into a real phone notification (Web Push).
type State =
  | 'loading'
  | 'ios-add-to-home' // iPhone Safari: only Home Screen apps can get notifications
  | 'unsupported'
  | 'blocked'
  | 'off'
  | 'on';

const VAPID_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';

function keyToBytes(base64: string): Uint8Array {
  const padded = (base64 + '='.repeat((4 - (base64.length % 4)) % 4)).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(padded);
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

function isIos(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

function isStandalone(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches || (navigator as unknown as { standalone?: boolean }).standalone === true;
}

export default function NotifyCard({ dogName }: { dogName: string }) {
  const [state, setState] = useState<State>('loading');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window && VAPID_KEY;
      if (!supported) {
        setState(isIos() && !isStandalone() ? 'ios-add-to-home' : 'unsupported');
        return;
      }
      if (Notification.permission === 'denied') {
        setState('blocked');
        return;
      }
      const reg = await navigator.serviceWorker.register('/sw.js');
      const sub = await reg.pushManager.getSubscription();
      setState(sub ? 'on' : 'off');
    })().catch(() => setState('unsupported'));
  }, []);

  const turnOn = async () => {
    setBusy(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setState(permission === 'denied' ? 'blocked' : 'off');
        return;
      }
      const reg = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;
      const sub =
        (await reg.pushManager.getSubscription()) ||
        (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyToBytes(VAPID_KEY) }));
      const res = await fetch('/api/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub.toJSON()),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'failed');
      setState('on');
      toast.success(`${dogName} just sent a test. Check your notifications.`);
    } catch (err) {
      toast.error(err instanceof Error && err.message !== 'failed' ? err.message : "Couldn't turn on notifications. Try again.");
    } finally {
      setBusy(false);
    }
  };

  const turnOff = async () => {
    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.getRegistration('/sw.js');
      const sub = await reg?.pushManager.getSubscription();
      if (sub) {
        await fetch('/api/push', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setState('off');
    } finally {
      setBusy(false);
    }
  };

  if (state === 'loading' || state === 'unsupported') return null;

  return (
    <Card className="border-[#FFB88C] bg-white">
      <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="w-11 h-11 rounded-full bg-[#FFF8F0] flex items-center justify-center shrink-0">
          {state === 'on' ? <Bell className="w-5 h-5 text-[#FF8C42]" /> : <BellOff className="w-5 h-5 text-[#FF8C42]" />}
        </div>

        {state === 'ios-add-to-home' && (
          <div className="flex-1 text-sm text-gray-700">
            <p className="font-semibold text-gray-900 mb-1">Get {dogName}&apos;s texts as notifications on your iPhone</p>
            <p>
              Tap <Share className="inline w-4 h-4 -mt-1" /> <strong>Share</strong>, then{' '}
              <PlusSquare className="inline w-4 h-4 -mt-1" /> <strong>Add to Home Screen</strong>. Open DogText from
              your Home Screen and turn them on here.
            </p>
          </div>
        )}

        {state === 'blocked' && (
          <div className="flex-1 text-sm text-gray-700">
            <p className="font-semibold text-gray-900 mb-1">Notifications are blocked for DogText</p>
            <p>Allow them in your browser&apos;s site settings, then come back here.</p>
          </div>
        )}

        {state === 'off' && (
          <>
            <div className="flex-1 text-sm text-gray-700">
              <p className="font-semibold text-gray-900 mb-1">Get {dogName}&apos;s morning text on this phone</p>
              <p>A notification at 7am, like a real text. Free.</p>
            </div>
            <Button onClick={turnOn} disabled={busy} className="rounded-full bg-[#FF8C42] hover:bg-[#FF6B1A] text-white">
              {busy ? 'Turning on…' : 'Turn on'}
            </Button>
          </>
        )}

        {state === 'on' && (
          <>
            <div className="flex-1 text-sm text-gray-700">
              <p className="font-semibold text-gray-900 mb-1">{dogName} texts this phone at 7am</p>
              <p>Notifications are on for this device.</p>
            </div>
            <Button onClick={turnOff} disabled={busy} variant="outline" className="rounded-full">
              Turn off
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
