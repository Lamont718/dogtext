'use client';

import Link from 'next/link';
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Utensils } from 'lucide-react';

type Activity = 'low' | 'moderate' | 'high';
type Unit = 'lb' | 'kg';

const ACTIVITY_OPTIONS: { value: Activity; label: string; multiplier: number; hint: string }[] = [
  { value: 'low', label: 'Low', multiplier: 1.2, hint: 'mostly indoor, short walks' },
  { value: 'moderate', label: 'Moderate', multiplier: 1.6, hint: '1–2 hr active daily' },
  { value: 'high', label: 'High', multiplier: 2.0, hint: 'working dog, heavy play' },
];

const KCAL_PER_CUP = 350;

export default function FoodCalculatorPage() {
  const [weight, setWeight] = useState('');
  const [unit, setUnit] = useState<Unit>('lb');
  const [activity, setActivity] = useState<Activity>('moderate');

  const result = useMemo(() => {
    const w = parseFloat(weight);
    if (!Number.isFinite(w) || w <= 0) return null;
    const weightKg = unit === 'lb' ? w * 0.453592 : w;
    const rer = 70 * Math.pow(weightKg, 0.75);
    const multiplier = ACTIVITY_OPTIONS.find((a) => a.value === activity)!.multiplier;
    const dailyKcal = rer * multiplier;
    return {
      kcal: Math.round(dailyKcal),
      cups: (dailyKcal / KCAL_PER_CUP).toFixed(1),
    };
  }, [weight, unit, activity]);

  return (
    <div className="container max-w-3xl mx-auto px-4 py-10">
      <Link
        href="/tools"
        className="inline-flex items-center text-sm text-gray-600 hover:text-[#FF8C42] mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> All tools
      </Link>

      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 rounded-lg bg-[#FFF8F0] flex items-center justify-center">
          <Utensils className="w-6 h-6 text-[#FF8C42]" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900">Daily Food Calculator</h1>
      </div>
      <p className="text-lg text-gray-600 mb-8 max-w-2xl">
        Resting Energy Requirement × an activity multiplier. The cup count assumes ~350 kcal
        per cup of typical adult kibble — check your bag for the exact number.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Your dog</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="weight" className="mb-2 block">
              Weight
            </Label>
            <div className="flex gap-2">
              <Input
                id="weight"
                type="number"
                min="0"
                step="0.5"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="e.g. 45"
                className="flex-1"
              />
              <div className="grid grid-cols-2 gap-1 w-32">
                <Button
                  type="button"
                  variant={unit === 'lb' ? 'default' : 'outline'}
                  className={unit === 'lb' ? 'bg-[#FF8C42] hover:bg-[#FF6B1A] text-white' : ''}
                  onClick={() => setUnit('lb')}
                >
                  lb
                </Button>
                <Button
                  type="button"
                  variant={unit === 'kg' ? 'default' : 'outline'}
                  className={unit === 'kg' ? 'bg-[#FF8C42] hover:bg-[#FF6B1A] text-white' : ''}
                  onClick={() => setUnit('kg')}
                >
                  kg
                </Button>
              </div>
            </div>
          </div>

          <div>
            <Label className="mb-2 block">Activity level</Label>
            <div className="grid grid-cols-3 gap-2">
              {ACTIVITY_OPTIONS.map((opt) => (
                <Button
                  key={opt.value}
                  type="button"
                  variant={activity === opt.value ? 'default' : 'outline'}
                  className={
                    activity === opt.value
                      ? 'bg-[#FF8C42] hover:bg-[#FF6B1A] text-white'
                      : ''
                  }
                  onClick={() => setActivity(opt.value)}
                >
                  <div className="flex flex-col items-center text-xs">
                    <span className="font-semibold">{opt.label}</span>
                    <span className="opacity-80">{opt.hint}</span>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          <div
            className={`rounded-xl p-6 text-center ${
              result
                ? 'bg-[#FFF8F0] border-2 border-[#FFB88C]'
                : 'bg-gray-50 border-2 border-dashed border-gray-200'
            }`}
          >
            {result ? (
              <>
                <p className="text-sm font-semibold text-[#FF8C42] tracking-wider mb-2">
                  ESTIMATED DAILY INTAKE
                </p>
                <p className="text-5xl font-bold text-gray-900 mb-1">{result.kcal} kcal</p>
                <p className="text-gray-600">≈ {result.cups} cups (at 350 kcal/cup)</p>
              </>
            ) : (
              <p className="text-gray-600">Enter a weight above to see the estimate.</p>
            )}
          </div>

          <p className="text-xs text-gray-500">
            Method: RER = 70 × weight(kg)^0.75. Activity multipliers: low 1.2, moderate 1.6,
            high 2.0. Puppies, pregnant/nursing dogs, and dogs with health conditions need a
            different calculation — talk to your vet.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
