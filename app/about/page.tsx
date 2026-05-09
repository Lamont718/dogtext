import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Lock, Sparkles, MessageCircle } from 'lucide-react';

export const metadata = {
  title: 'About DogText',
  description:
    'Built by Lamont — a dog dad in Brooklyn — after his daughter asked, "Did Coco text you?" Honest about being early.',
};

const values = [
  {
    icon: Heart,
    title: 'Built by an actual owner',
    body: "I built DogText for myself first. Every feature started as something I wanted for my own dog, Coco — then opened up to other owners.",
  },
  {
    icon: Sparkles,
    title: 'Honest about being early',
    body: "We won't fake testimonials, invent ratings, or pretend a partnership exists when it doesn't. If something is in development, we say so.",
  },
  {
    icon: Lock,
    title: 'Your data stays yours',
    body: "Your dog's chats are private to you and never used to train the AI. We don't sell anything to anyone.",
  },
  {
    icon: MessageCircle,
    title: 'A real human reads support',
    body: "Email me directly at lamont1879@gmail.com. There's no support queue, no tier-1 outsourced agent. Just me until we grow into having more.",
  },
];

export default function AboutPage() {
  return (
    <div className="container max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-14">
        <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">About DogText</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
          The honest version: it's a small thing built by one person, on purpose, for
          people who actually love their dogs.
        </p>
      </div>

      <div className="grid lg:grid-cols-5 gap-10 items-start mb-16">
        <div className="lg:col-span-2">
          <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-xl bg-gray-100">
            <Image
              src="/images/founder_with_coco.jpg"
              alt="Founder with Coco"
              fill
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover"
              priority
            />
          </div>
        </div>

        <div className="lg:col-span-3 space-y-5 text-lg text-gray-800 leading-relaxed">
          <p className="text-sm font-bold text-[#FF8C42] tracking-wider">OUR STORY</p>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
            It started with a question from my daughter
          </h2>
          <p>
            One morning, my daughter asked, "Dad, did Coco text you?" When I said yes,
            her face lit up with the biggest smile. That moment — that pure joy — is
            why DogText exists.
          </p>
          <p>
            I'm Lamont. I'm a Brooklyn-based dog dad with two kids and one Coco. I've
            spent years building software, and I kept noticing the gap between
            generic-internet pet advice and what actually helped me raise a healthy,
            happy dog.
          </p>
          <p>
            DogText is what I wish existed when I got Coco. AI that captures her
            personality. Plain-language guides on her breed. Real calculators for
            things like food intake. No fake "Dr. Rachel Martinez" instructors. No
            fabricated reviews. Just a tool I'd use myself.
          </p>
          <p className="font-semibold">
            We're early. We're honest about it. And we'd rather earn one founding
            member's trust than buy a thousand fake stars.
          </p>
          <p className="font-handwriting text-2xl text-gray-600 dark:text-gray-400 mt-6">
            — Lamont
            <br />
            <span className="text-base">Founder & Dog Dad, Brooklyn</span>
          </p>
        </div>
      </div>

      <div className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8 text-center">What we believe</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {values.map((v) => {
            const Icon = v.icon;
            return (
              <Card key={v.title} className="border-0 shadow-md">
                <CardContent className="p-7">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 shrink-0 rounded-lg bg-[#FFF8F0] flex items-center justify-center">
                      <Icon className="w-5 h-5 text-[#FF8C42]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">{v.title}</h3>
                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{v.body}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <div className="text-center bg-[#FFF8F0] rounded-2xl p-10">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">Join the pack early</h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-xl mx-auto">
          Founding members lock today's pricing for life and get every feature we ship.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/auth/signup"
            className="bg-[#FF8C42] hover:bg-[#FF6B1A] text-white px-8 py-3 rounded-full font-semibold transition-colors shadow-md"
          >
            Start free
          </Link>
          <Link
            href="/contact"
            className="border border-gray-300 text-gray-700 px-8 py-3 rounded-full font-semibold hover:bg-gray-50 transition-colors"
          >
            Email Lamont
          </Link>
        </div>
      </div>
    </div>
  );
}
