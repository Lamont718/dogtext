import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, Utensils } from 'lucide-react';

export const metadata = {
  title: 'Calculators & tools | DogText',
  description:
    'Simple, accurate calculators for dog age and daily food. More tools added as we build them.',
};

const tools = [
  {
    title: 'Dog Age Calculator',
    slug: 'age-calculator',
    description: "Convert your dog's age to human years using the AVMA-cited logarithmic formula.",
    icon: Calculator,
  },
  {
    title: 'Daily Food Calculator',
    slug: 'food-calculator',
    description: "Estimate daily calories and cups based on your dog's weight (RER × activity).",
    icon: Utensils,
  },
];

export default function ToolsPage() {
  return (
    <div className="container max-w-6xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Calculators & tools</h1>
        <p className="text-xl text-gray-600 max-w-2xl">
          Two calculators we use ourselves. We add more only when we're confident the math
          is right and the answer is actually useful.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link key={tool.slug} href={`/tools/${tool.slug}`} className="group">
              <Card className="h-full border-0 shadow-md hover:shadow-xl transition-all hover:-translate-y-1">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-[#FFF8F0] flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-[#FF8C42]" />
                  </div>
                  <CardTitle className="group-hover:text-[#FF8C42] transition-colors">
                    {tool.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed">{tool.description}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
