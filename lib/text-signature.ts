// Signs demo texts so only texts DogText actually wrote can be turned into a
// shareable DogText-branded page. Without this, anyone could post any words
// under our logo via /api/share-text.

import crypto from 'crypto';

function secret(): string {
  return process.env.NEXTAUTH_SECRET || 'dev-only-secret';
}

function payload(dogName: string, breed: string, message: string): string {
  return JSON.stringify([dogName.trim(), breed, message]);
}

export function signText(dogName: string, breed: string, message: string): string {
  return crypto.createHmac('sha256', secret()).update(payload(dogName, breed, message)).digest('hex').slice(0, 32);
}

export function verifyText(dogName: string, breed: string, message: string, signature: string): boolean {
  const expected = signText(dogName, breed, message);
  if (typeof signature !== 'string' || signature.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}
