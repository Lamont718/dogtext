import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, BookOpen, MessageCircle, Sparkles } from 'lucide-react';

export const metadata = {
  title: 'Puppy Training 101 (in development) | DogText',
  description:
    'Honest plain-language puppy training, in development. While we build it, here\'s what to read and do today.',
};

const learnNow = [
  {
    title: 'House training, week by week',
    href: '/learn/articles?category=puppy-care',
    body: "Plain-language guides on the first month, crate training, and accident recovery — already published in our learning hub.",
  },
  {
    title: 'Pick the right breed for your home',
    href: '/learn/breeds',
    body: 'Detailed breed profiles with energy level, exercise needs, and what to expect during the puppy phase.',
  },
  {
    title: 'Talk it out with your dog',
    href: '/chat',
    body: "Once you've added your puppy, the AI can help you reason through specific behavior questions in plain language.",
  },
];

export default function PuppyTrainingCoursePage() {
  return (
    <div className="container max-w-5xl mx-auto px-4 py-12">
      <div className="mb-10">
        <Badge className="bg-[#FF8C42] text-white mb-4">IN DEVELOPMENT</Badge>
        <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
          Puppy Training 101 — coming, but not faked
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl leading-relaxed">
          We won't run a "free intro" with stock-photo trainers and a fake review count.
          Here's what we promise on this course, what's available today, and how you'll
          know when it's ready.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-12">
        <Card className="border-0 shadow-md">
          <CardContent className="p-8">
            <BookOpen className="w-8 h-8 text-[#FF8C42] mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">Plain language</h3>
            <p className="text-gray-600 leading-relaxed">
              Written like a friend who's done this before — not corporate copy.
              Every step has a "what to do today" action.
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-8">
            <CheckCircle className="w-8 h-8 text-[#FF8C42] mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">Honest credentials</h3>
            <p className="text-gray-600 leading-relaxed">
              When we ship, contributors will be named with real bios you can verify.
              No invented "Dr. Rachel" types.
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-8">
            <Sparkles className="w-8 h-8 text-[#FF8C42] mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">Free for founders</h3>
            <p className="text-gray-600 leading-relaxed">
              Anyone with an account today gets the course for free when it ships.
              No upsell, no surprise paywall.
            </p>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-6">What's already useful today</h2>
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        {learnNow.map((item) => (
          <Link key={item.href} href={item.href} className="group">
            <Card className="h-full border-0 shadow-md hover:shadow-xl transition-all hover:-translate-y-1">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#FF8C42] transition-colors">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">{item.body}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="bg-[#FFF8F0] rounded-2xl p-8 text-center">
        <MessageCircle className="w-10 h-10 text-[#FF8C42] mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          Want to be notified when it ships?
        </h2>
        <p className="text-gray-700 max-w-xl mx-auto mb-6">
          Create a free account. We'll email you the day Puppy Training 101 is live —
          and you'll have it on the house for staying with us early.
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
