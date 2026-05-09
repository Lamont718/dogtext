import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Microscope, ShieldCheck, Wallet, Mail } from 'lucide-react';

export const metadata = {
  title: 'Shop (coming soon) | DogText',
  description:
    'A small, honest list of dog products we actually use and recommend. Launching after we ship a few more, not before.',
};

const principles = [
  {
    icon: Microscope,
    title: 'We test before we recommend',
    body:
      "We only feature products we've used with our own dogs for at least a month. No press-kit picks.",
  },
  {
    icon: ShieldCheck,
    title: 'Affiliate links are disclosed',
    body:
      'When a link earns us a commission, you\'ll see a label on the card. It never affects what makes the list.',
  },
  {
    icon: Wallet,
    title: 'Every price tier represented',
    body:
      "If a $20 chew toy is the right pick, we won't push you to a $90 one because the margin is better.",
  },
];

export default function ShopPage() {
  return (
    <div className="container max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <Badge className="bg-[#FF8C42] text-white mb-4">COMING SOON</Badge>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">A shop, but only when it earns it</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          We'd rather launch with five products we'd stake our name on than fifty we
          haven't touched. Here's what to expect when we open it.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-12">
        {principles.map((p) => {
          const Icon = p.icon;
          return (
            <Card key={p.title} className="border-0 shadow-md">
              <CardContent className="p-8">
                <div className="w-12 h-12 rounded-lg bg-[#FFF8F0] flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-[#FF8C42]" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{p.title}</h3>
                <p className="text-gray-600 leading-relaxed">{p.body}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="bg-[#FFF8F0] rounded-2xl p-8 text-center">
        <Mail className="w-10 h-10 text-[#FF8C42] mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Want first dibs when it opens?</h2>
        <p className="text-gray-700 max-w-xl mx-auto mb-6">
          Create a free DogText account and we'll email you the day the shop launches —
          no waitlist form, no extra step.
        </p>
        <Link
          href="/auth/signup"
          className="inline-block bg-[#FF8C42] hover:bg-[#FF6B1A] text-white font-semibold px-6 py-3 rounded-full transition-colors"
        >
          Create your free account
        </Link>
      </div>
    </div>
  );
}
