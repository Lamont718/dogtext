
'use client';

import { useEffect, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Eye, EyeOff } from 'lucide-react';
import AuthShell from '../../../components/auth/auth-shell';
import {
  SIGNUP_BREEDS,
  type PendingDog,
  clearPendingDog,
  readPendingDog,
  parseKidNames,
} from '../../../lib/dog-voice';

export default function SignupPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dogName, setDogName] = useState('');
  const [breed, setBreed] = useState('');
  const [traits, setTraits] = useState<string[]>([]);
  const [kidNames, setKidNames] = useState('');
  // The dog from the homepage demo, shown as a summary instead of empty fields.
  const [demoDog, setDemoDog] = useState<PendingDog | null>(null);
  // Came from 'Join the list' on the pricing page.
  const [plan, setPlan] = useState<'PREMIUM' | 'FAMILY' | null>(null);
  // Remembered even if they tap 'Change' on the demo dog.
  const [fromDemo, setFromDemo] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get('plan');
    if (p === 'premium' || p === 'family') setPlan(p === 'premium' ? 'PREMIUM' : 'FAMILY');
  }, []);

  useEffect(() => {
    const pending = readPendingDog();
    if (!pending) return;
    setDemoDog(pending);
    setFromDemo(true);
    setDogName(pending.dogName);
    setBreed((SIGNUP_BREEDS as readonly string[]).includes(pending.breed) ? pending.breed : 'Other');
    setTraits(pending.traits.slice(0, 3));
    if (pending.kids?.length) setKidNames(pending.kids.join(', '));
    setFirstName((current) => current || pending.ownerName);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      setIsLoading(false);
      return;
    }

    if (!dogName.trim() || !breed) {
      setError("Tell us your dog's name and breed so they can write to your kids.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
          dog: { name: dogName, breed, traits },
          kids: parseKidNames(kidNames),
          ...(plan ? { plan } : {}),
          source: fromDemo ? 'demo' : plan ? 'plan' : 'direct',
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Failed to create account');
        return;
      }

      clearPendingDog();

      const signInResult = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (signInResult?.ok) {
        router.push('/dashboard');
      } else {
        setError('Account created but sign in failed. Please try signing in manually.');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const title = demoDog ? `Get ${demoDog.dogName}'s letters` : 'Letters from your dog';

  return (
    <AuthShell side="signup">
      <Card className="border-0 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-3xl">{title}</CardTitle>
          <CardDescription>
            Free forever, no credit card. You&apos;ll see the first one as soon as you sign up, then
            a new one every day.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm dark:bg-red-950/40 dark:border-red-900 dark:text-red-300">
                {error}
              </div>
            )}

            {plan && (
              <div className="rounded-2xl bg-[#FFF8F0] px-4 py-3 text-sm text-[#2C2C2C] dark:bg-muted dark:text-gray-100">
                You&apos;ll be on the {plan === 'PREMIUM' ? 'Premium' : 'Family'} list. It&apos;s free until paid
                plans open, and you keep today&apos;s price.
              </div>
            )}

            {demoDog ? (
              <div className="flex items-center gap-3 rounded-2xl bg-[#FFF8F0] px-4 py-3 dark:bg-muted">
                <div className="w-11 h-11 shrink-0 rounded-full bg-gradient-to-br from-[#FF8C42] to-[#FFB380] flex items-center justify-center text-xl">
                  🐕
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-[#2C2C2C] dark:text-gray-100">{dogName}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {[breed, traits.join(', ').toLowerCase()].filter(Boolean).join(' · ')}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setDemoDog(null)}
                  className="text-sm font-medium text-[#FF8C42] hover:text-[#FF6B1A]"
                >
                  Change
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dogName">Your dog&apos;s name</Label>
                  <Input
                    id="dogName"
                    type="text"
                    value={dogName}
                    onChange={(e) => setDogName(e.target.value)}
                    required
                    maxLength={30}
                    placeholder="Coco"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <Label htmlFor="breed">Breed</Label>
                  <select
                    id="breed"
                    value={breed}
                    onChange={(e) => setBreed(e.target.value)}
                    required
                    disabled={isLoading}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                  >
                    <option value="">Choose…</option>
                    {SIGNUP_BREEDS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="kidNames">Your kids&apos; first names</Label>
              <Input
                id="kidNames"
                type="text"
                value={kidNames}
                onChange={(e) => setKidNames(e.target.value)}
                placeholder="Maya, Leo"
                maxLength={120}
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">
                {dogName.trim() || 'Your dog'} writes to them every day. First names only.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">Your first name</Label>
                <Input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  placeholder="First name"
                  disabled={isLoading}
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Optional"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">
                We&apos;ll send the letters here too.
              </p>
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Create a password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">
                Must be at least 8 characters
              </p>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#FF8C42] hover:bg-[#FF6B1A] py-6 rounded-full text-base"
              disabled={isLoading}
            >
              {isLoading
                ? 'Creating account...'
                : dogName.trim()
                  ? `See ${dogName.trim()}'s first text`
                  : 'Create account'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link href="/auth/login" className="font-medium text-[#FF8C42] hover:text-[#FF6B1A]">
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </AuthShell>
  );
}
