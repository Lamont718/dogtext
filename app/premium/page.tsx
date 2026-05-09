import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Crown, Zap } from 'lucide-react';

export const metadata = {
  title: 'Pricing | DogText',
  description:
    'Free forever for casual users. Premium for unlimited AI chats. Family for multi-dog households. Founder pricing locked while in beta.',
};

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Try us out. No credit card.',
    features: [
      '5 AI conversations per week',
      '1 dog profile',
      'Browse the breed library',
      'Read all expert articles',
      'Use the age + food calculators',
    ],
    cta: { label: 'Start Free', href: '/auth/signup' },
    popular: false,
    icon: Star,
  },
  {
    name: 'Premium',
    price: '$7.99',
    period: 'month',
    description: 'For serious dog parents.',
    features: [
      'Unlimited AI conversations',
      'Up to 3 dog profiles',
      'Everything in Free',
      'Priority support over email',
    ],
    cta: { label: 'Reserve founder pricing', href: '/auth/signup?plan=premium' },
    popular: true,
    icon: Crown,
  },
  {
    name: 'Family',
    price: '$14.99',
    period: 'month',
    description: 'For multi-dog households.',
    features: [
      'Everything in Premium',
      'Up to 5 dog profiles',
      'One bill for the whole pack',
    ],
    cta: { label: 'Reserve founder pricing', href: '/auth/signup?plan=family' },
    popular: false,
    icon: Zap,
  },
];

export default function PremiumPage() {
  return (
    <div className="container max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <Badge className="bg-[#FF8C42] text-white mb-4">FOUNDING MEMBERS</Badge>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">Choose your plan</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          We're in beta. Sign up for any paid tier now and you keep your launch rate
          forever — even when prices go up.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-12">
        {plans.map((plan) => {
          const Icon = plan.icon;
          return (
            <Card
              key={plan.name}
              className={`relative flex flex-col ${
                plan.popular ? 'border-2 border-[#FF8C42] shadow-xl md:scale-105' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-[#FF8C42] text-white">Most Popular</Badge>
                </div>
              )}

              <CardHeader className="text-center pb-2">
                <div className="flex items-center justify-center mb-2">
                  <Icon
                    className={`w-8 h-8 ${plan.popular ? 'text-[#FF8C42]' : 'text-gray-600 dark:text-gray-400'}`}
                  />
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900 dark:text-gray-100">{plan.price}</span>
                  <span className="text-gray-500">/{plan.period}</span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mt-2">{plan.description}</p>
              </CardHeader>

              <CardContent className="flex flex-col flex-1">
                <ul className="space-y-3 mb-6 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-3 shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.cta.href}
                  className={`block w-full text-center py-3 rounded-full font-semibold transition-colors ${
                    plan.popular
                      ? 'bg-[#FF8C42] hover:bg-[#FF6B1A] text-white'
                      : 'border-2 border-gray-300 hover:border-[#FF8C42] hover:text-[#FF8C42] text-gray-700'
                  }`}
                >
                  {plan.cta.label}
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="bg-gray-50 dark:bg-card rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">
          Frequently Asked Questions
        </h2>

        <div className="space-y-6 max-w-3xl mx-auto">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">When does paid billing start?</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Premium and Family billing isn't open yet. Sign up now and you'll be the first
              to know when we turn it on — at the price you see today.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Can I change plans later?</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Yes. Upgrade or downgrade any time once paid plans go live. Changes take
              effect immediately.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">What happens to my data if I cancel?</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Your dog profiles and chat history stay saved on your account. Reactivate any
              time to pick up where you left off.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Is there a free trial?</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Free tier is forever-free with 5 AI chats per week. That's a real trial —
              use the product, then upgrade if it earns it.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
