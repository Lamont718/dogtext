import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { DOGTEXT_BRAND, verifyStripeSignature } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

interface Address {
  line1?: string | null; line2?: string | null; city?: string | null; state?: string | null; postal_code?: string | null; country?: string | null;
}
interface Session {
  id: string;
  payment_status?: string;
  amount_total?: number;
  metadata?: Record<string, string> | null;
  customer_details?: { email?: string | null; name?: string | null } | null;
  shipping_details?: { name?: string | null; address?: Address | null } | null;
  collected_information?: { shipping_details?: { name?: string | null; address?: Address | null } | null } | null;
}

// POST /api/stripe/webhook: a paid book. The Our Rose Stripe account is shared
// by seven other sites and every sale is sent to every endpoint, so anything
// not tagged brand = dogtext is someone else's and is ignored.
export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const raw = await req.text();
  if (!secret || !verifyStripeSignature(raw, req.headers.get('stripe-signature'), secret)) {
    return NextResponse.json({ error: 'bad signature' }, { status: 400 });
  }

  const event = JSON.parse(raw) as { type: string; data: { object: Session } };
  if (event.type !== 'checkout.session.completed') return NextResponse.json({ received: true });

  const s = event.data.object;
  if (s.metadata?.brand !== DOGTEXT_BRAND) {
    return NextResponse.json({ received: true, ignored: 'another brand on this Stripe account' });
  }
  if (s.payment_status !== 'paid') return NextResponse.json({ received: true, ignored: 'not paid' });

  const userId = s.metadata?.dogtextUserId;
  if (!userId || !(await prisma.user.findUnique({ where: { id: userId }, select: { id: true } }))) {
    console.error('DogText book paid but user not found', s.id, userId);
    return NextResponse.json({ received: true, ignored: 'unknown user' });
  }

  const ship = s.collected_information?.shipping_details ?? s.shipping_details ?? null;
  await prisma.bookOrder.upsert({
    where: { stripeSessionId: s.id },
    create: {
      userId,
      stripeSessionId: s.id,
      amountTotal: s.amount_total ?? 0,
      letterCount: Number(s.metadata?.letters) || 0,
      shipName: ship?.name ?? s.customer_details?.name ?? null,
      shipAddress: (ship?.address ?? null) as object | null ?? undefined,
      email: s.customer_details?.email ?? null,
    },
    update: {},
  });
  return NextResponse.json({ received: true, recorded: s.id });
}
