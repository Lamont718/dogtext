'use client';

import Link from 'next/link';
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Calculator } from 'lucide-react';

type Size = 'small' | 'medium' | 'large';

const SIZE_OPTIONS: { value: Size; label: string; range: string }[] = [
  { value: 'small', label: 'Small', range: 'under 20 lb' },
  { value: 'medium', label: 'Medium', range: '20–50 lb' },
  { value: 'large', label: 'Large', range: 'over 50 lb' },
];

function dogYearsToHuman(dogYears: number, size: Size): number | null {
  if (!Number.isFinite(dogYears) || dogYears <= 0) return null;
  if (dogYears < 1) {
    return Math.round(15 * dogYears);
  }
  if (dogYears < 2) {
    return Math.round(15 + (dogYears - 1) * 9);
  }
  const ratePerYearAfter2: Record<Size, number> = {
    small: 4.32,
    medium: 5,
    large: 6.5,
  };
  return Math.round(24 + (dogYears - 2) * ratePerYearAfter2[size]);
}

export default function AgeCalculatorPage() {
  const [age, setAge] = useState('');
  const [size, setSize] = useState<Size>('medium');

  const result = useMemo(() => {
    const n = parseFloat(age);
    return dogYearsToHuman(n, size);
  }, [age, size]);

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
          <Calculator className="w-6 h-6 text-[#FF8C42]" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900">Dog Age Calculator</h1>
      </div>
      <p className="text-lg text-gray-600 mb-8 max-w-2xl">
        Year-one of a dog's life is roughly 15 human years. Year two adds another 9. After
        that, the rate depends on size — larger dogs age faster.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Your dog</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="age" className="mb-2 block">
              Age in dog years
            </Label>
            <Input
              id="age"
              type="number"
              min="0"
              step="0.5"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="e.g. 4"
            />
          </div>

          <div>
            <Label className="mb-2 block">Adult size</Label>
            <div className="grid grid-cols-3 gap-2">
              {SIZE_OPTIONS.map((opt) => (
                <Button
                  key={opt.value}
                  type="button"
                  variant={size === opt.value ? 'default' : 'outline'}
                  className={
                    size === opt.value
                      ? 'bg-[#FF8C42] hover:bg-[#FF6B1A] text-white'
                      : ''
                  }
                  onClick={() => setSize(opt.value)}
                >
                  <div className="flex flex-col items-center text-xs">
                    <span className="font-semibold">{opt.label}</span>
                    <span className="opacity-80">{opt.range}</span>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          <div
            className={`rounded-xl p-6 text-center ${
              result !== null
                ? 'bg-[#FFF8F0] border-2 border-[#FFB88C]'
                : 'bg-gray-50 border-2 border-dashed border-gray-200'
            }`}
          >
            {result !== null ? (
              <>
                <p className="text-sm font-semibold text-[#FF8C42] tracking-wider mb-2">
                  HUMAN-YEAR EQUIVALENT
                </p>
                <p className="text-5xl font-bold text-gray-900 mb-1">~{result}</p>
                <p className="text-gray-600">human years old</p>
              </>
            ) : (
              <p className="text-gray-600">Enter an age above to see the equivalent.</p>
            )}
          </div>

          <p className="text-xs text-gray-500">
            Method: 15 + (year_two × 9) + size-specific rate after age 2 (small 4.32 / medium 5 /
            large 6.5 human years per dog year). This is a working approximation, not a vet
            diagnosis — talk to your vet about life-stage care decisions.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
