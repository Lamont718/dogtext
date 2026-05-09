'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { User, Bell, Shield, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

const TIMEZONES = [
  { value: 'America/Los_Angeles', label: 'Pacific Time (Los Angeles)' },
  { value: 'America/Denver', label: 'Mountain Time (Denver)' },
  { value: 'America/Chicago', label: 'Central Time (Chicago)' },
  { value: 'America/New_York', label: 'Eastern Time (New York)' },
  { value: 'UTC', label: 'UTC' },
  { value: 'Europe/London', label: 'London' },
  { value: 'Europe/Paris', label: 'Paris' },
  { value: 'Asia/Tokyo', label: 'Tokyo' },
];

interface SettingsData {
  firstName: string;
  lastName: string;
  email: string;
  subscriptionTier: string;
  emailNotifications: boolean;
  weeklyDigest: boolean;
  marketingEmails: boolean;
  timezone: string;
}

export default function SettingsPage() {
  const [data, setData] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/user/settings')
      .then((r) => (r.ok ? r.json() : Promise.reject(r)))
      .then((d: SettingsData) => setData(d))
      .catch(() => toast.error('Failed to load your settings.'))
      .finally(() => setLoading(false));
  }, []);

  const update = (patch: Partial<SettingsData>) => {
    if (data) setData({ ...data, ...patch });
  };

  const save = async (fields: (keyof SettingsData)[], successMessage: string) => {
    if (!data) return;
    setSaving(true);
    const body: Partial<SettingsData> = {};
    fields.forEach((f) => {
      (body as any)[f] = data[f];
    });
    try {
      const res = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      toast.success(successMessage);
    } catch {
      toast.error('Failed to save. Try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-gray-200 rounded" />
          <div className="h-4 w-72 bg-gray-200 rounded" />
          <div className="h-64 bg-gray-100 rounded-2xl mt-8" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-600">Could not load your settings. Try refreshing.</p>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Manage your account preferences and settings.</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="account" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Account
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Billing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={data.firstName}
                    onChange={(e) => update({ firstName: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={data.lastName}
                    onChange={(e) => update({ lastName: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" value={data.email} disabled />
                <p className="text-xs text-gray-500 mt-1">
                  Email is your account ID — contact support to change it.
                </p>
              </div>

              <div>
                <Label htmlFor="timezone">Timezone</Label>
                <Select
                  value={data.timezone}
                  onValueChange={(v) => update({ timezone: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMEZONES.map((tz) => (
                      <SelectItem key={tz.value} value={tz.value}>
                        {tz.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={() => save(['firstName', 'lastName', 'timezone'], 'Profile saved.')}
                disabled={saving}
              >
                {saving ? 'Saving…' : 'Save Changes'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Email Notifications</h3>
                  <p className="text-sm text-gray-600">
                    Account-related emails (security, billing receipts, important changes).
                  </p>
                </div>
                <Switch
                  checked={data.emailNotifications}
                  onCheckedChange={(v) => update({ emailNotifications: v })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Weekly Digest</h3>
                  <p className="text-sm text-gray-600">
                    Recap of your dog's chats and any new articles each week.
                  </p>
                </div>
                <Switch
                  checked={data.weeklyDigest}
                  onCheckedChange={(v) => update({ weeklyDigest: v })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Marketing Updates</h3>
                  <p className="text-sm text-gray-600">
                    Product updates and occasional offers. Off by default.
                  </p>
                </div>
                <Switch
                  checked={data.marketingEmails}
                  onCheckedChange={(v) => update({ marketingEmails: v })}
                />
              </div>

              <Button
                onClick={() =>
                  save(
                    ['emailNotifications', 'weeklyDigest', 'marketingEmails'],
                    'Notification preferences saved.'
                  )
                }
                disabled={saving}
              >
                {saving ? 'Saving…' : 'Save Preferences'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-medium mb-1">Your data</h3>
                <p className="text-sm text-gray-600">
                  Your dog profiles, chat history, and account details are stored
                  privately and never sold.
                </p>
              </div>

              <div className="pt-6 border-t">
                <h3 className="font-medium text-red-600 mb-2">Danger Zone</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Account deletion permanently removes your dogs, chats, and settings.
                  We don't have a self-serve flow yet — email{' '}
                  <a
                    href="mailto:lamont1879@gmail.com"
                    className="text-[#FF8C42] font-medium hover:underline"
                  >
                    lamont1879@gmail.com
                  </a>{' '}
                  from your account email and we'll handle it within a couple of days.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Billing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-[#FFF8F0] p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-1">
                  {data.subscriptionTier === 'FREE'
                    ? 'Free plan'
                    : data.subscriptionTier === 'PREMIUM'
                    ? 'Premium plan'
                    : 'Family plan'}
                </h3>
                <p className="text-sm text-gray-700">
                  {data.subscriptionTier === 'FREE'
                    ? "You're on the free plan. Paid billing isn't open yet — sign up will be ready soon."
                    : "You're an active paid member. Thanks for supporting DogText."}
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">Billing history</h3>
                <p className="text-sm text-gray-600">
                  No invoices yet — we'll show them here once paid plans go live.
                </p>
              </div>

              {data.subscriptionTier === 'FREE' && (
                <Button asChild>
                  <Link href="/premium">See pricing</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
