// Morning texts as phone notifications (Web Push). Free, no phone numbers:
// works in Chrome/Edge/Firefox/Android, and on iPhone once DogText is added
// to the Home Screen (iOS 16.4+). Keys: NEXT_PUBLIC_VAPID_PUBLIC_KEY,
// VAPID_PRIVATE_KEY.

import webpush from 'web-push';
import { prisma } from './db';
import { SITE_URL } from './bark-card';

let configured: boolean | null = null;

function configure(): boolean {
  if (configured !== null) return configured;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  configured = Boolean(publicKey && privateKey);
  // The subject tells push services who to contact about misuse: the site itself.
  if (configured) webpush.setVapidDetails(SITE_URL, publicKey!, privateKey!);
  return configured;
}

export function pushConfigured(): boolean {
  return configure();
}

export interface DogPush {
  dogName: string;
  message: string;
  /** Where tapping the notification goes. */
  url: string;
}

/** Sends to every device the member has turned on. Returns how many got it. */
export async function sendDogPush(userId: string, push: DogPush): Promise<{ sent: number; removed: number }> {
  if (!configure()) return { sent: 0, removed: 0 };

  const subs = await prisma.pushSubscription.findMany({ where: { userId } });
  const payload = JSON.stringify({
    title: push.dogName,
    body: push.message.length > 180 ? push.message.slice(0, 177) + '…' : push.message,
    url: push.url,
  });

  let sent = 0;
  let removed = 0;
  await Promise.all(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          payload,
          { TTL: 60 * 60 * 12, urgency: 'normal' },
        );
        sent++;
      } catch (err) {
        const status = (err as { statusCode?: number }).statusCode;
        // 404/410: the browser dropped this subscription (app removed, permission revoked).
        if (status === 404 || status === 410) {
          console.warn('Push subscription gone, removing', status, s.endpoint.slice(0, 60));
          await prisma.pushSubscription.delete({ where: { id: s.id } }).catch(() => {});
          removed++;
        } else {
          console.error('Push failed', status, (err as Error).message);
        }
      }
    }),
  );
  return { sent, removed };
}
