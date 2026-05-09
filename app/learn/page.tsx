import Link from 'next/link';
import { Card, CardContent } from '../../components/ui/card';
import { Award, Heart, Calculator, GraduationCap, ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'Learn | DogText',
  description:
    'Plain-language guides on breeds, training, health, and nutrition — plus working calculators we use ourselves.',
};

const cards = [
  {
    href: '/learn/breeds',
    icon: Award,
    title: 'Breed Library',
    body: 'Detailed breed profiles — temperament, exercise needs, grooming, health watch-outs, and training tips.',
    cta: 'Explore breeds',
  },
  {
    href: '/learn/articles',
    icon: Heart,
    title: 'Expert Articles',
    body: 'Plain-language guides on training, health, nutrition, puppy care, and senior care.',
    cta: 'Read articles',
  },
  {
    href: '/tools',
    icon: Calculator,
    title: 'Calculators',
    body: 'Two working tools today — dog age (with size adjustment) and daily food (RER × activity). More to come.',
    cta: 'Open calculators',
  },
  {
    href: '/courses/puppy-training',
    icon: GraduationCap,
    title: 'Puppy Training 101',
    body: "In development — coming, but not faked. While we build it, we'll point you to what's already useful.",
    cta: 'See progress',
  },
];

export default function LearnPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF8F0] to-white">
      <div className="container max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-14">
          <h1 className="text-5xl font-bold text-[#2C2C2C] mb-4">
            Everything we know, organized
          </h1>
          <p className="text-xl text-[#6B6B6B] max-w-2xl mx-auto">
            Plain-language guides on breeds, training, health, and nutrition — plus a
            small set of working tools. We add more only when we're confident it's right.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <Link key={card.href} href={card.href} className="group">
                <Card className="h-full border-0 shadow-md hover:shadow-xl transition-all hover:-translate-y-1">
                  <CardContent className="p-8">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FF8C42] to-[#FFB88C] flex items-center justify-center mb-5">
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-[#2C2C2C] mb-3 group-hover:text-[#FF8C42] transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-[#6B6B6B] leading-relaxed mb-4">{card.body}</p>
                    <span className="inline-flex items-center gap-1 text-[#FF8C42] font-semibold">
                      {card.cta}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        <div className="bg-gradient-to-br from-[#FF8C42] to-[#FFB88C] rounded-3xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-3">Want answers tailored to your dog?</h2>
          <p className="text-lg mb-8 opacity-95 max-w-2xl mx-auto">
            Sign up free and chat with your own dog's AI persona — built around their
            breed, age, and the three traits you pick.
          </p>
          <Link
            href="/auth/signup"
            className="inline-block bg-white text-[#FF8C42] hover:bg-white/90 px-12 py-5 rounded-full text-lg font-semibold"
          >
            Create your free account
          </Link>
        </div>
      </div>
    </div>
  );
}
