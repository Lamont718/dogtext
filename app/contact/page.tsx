'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Clock, Heart } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const CONTACT_EMAIL = 'lamont1879@gmail.com';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullName = `${formData.firstName} ${formData.lastName}`.trim() || 'a DogText visitor';
    const subject = formData.subject.trim() || 'Hello from DogText';
    const body = `${formData.message.trim()}

—
From: ${fullName}
Reply-to: ${formData.email.trim()}`;
    const url = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = url;
    toast.success("Opening your email app — hit send and we'll have it.");
  };

  return (
    <div className="container max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">Get in touch</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          We're a small team. Every email is read by a real person — usually Lamont.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-[#FF8C42]" />
                Email
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400 mb-2">Anything goes — feature ideas, support, hello.</p>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="font-semibold text-[#FF8C42] hover:underline break-all"
              >
                {CONTACT_EMAIL}
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#FF8C42]" />
                Response time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">
                Usually within 1–2 days, faster on weekdays. We don't have a phone line or
                live chat yet — we'd rather respond well by email than badly in real time.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-[#FF8C42]" />
                Found a bug?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">
                Tell us what you clicked, what you expected, what happened. Screenshots
                welcome. Founding members get extra goodwill for bug reports.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Send us a message</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First name</Label>
                    <Input
                      id="firstName"
                      placeholder="First name"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last name</Label>
                    <Input
                      id="lastName"
                      placeholder="Last name"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Your email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    placeholder="What's this about?"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Tell us how we can help..."
                    className="min-h-[140px]"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                  />
                </div>

                <Button type="submit" className="w-full bg-[#FF8C42] hover:bg-[#FF6B1A]">
                  Open in my email app
                </Button>
                <p className="text-xs text-gray-500 text-center">
                  Submitting opens a draft in your default mail client to{' '}
                  <span className="font-mono">{CONTACT_EMAIL}</span> — no hidden form
                  pipeline, no third-party form service.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-16">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8 text-center">FAQ</h2>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">How accurate is the AI chat?</h3>
            <p className="text-gray-600 dark:text-gray-400">
              The AI gives a personality-flavored take based on your dog's breed and traits.
              It's a companion, not a vet — for medical questions, always consult a real
              veterinarian.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Can I change my plan later?</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Paid plans aren't live yet. Once they are, you can upgrade or downgrade any
              time from the Billing tab in Settings.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">How do I delete my account?</h3>
            <p className="text-gray-600 dark:text-gray-400">
              We don't have a self-serve delete button yet. Email us from your account
              email and we'll handle it within a couple of days.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Will my chats be used to train AI?</h3>
            <p className="text-gray-600 dark:text-gray-400">
              No. Your dog's chats are private to you and never used to train the model.
              That's a hard line for us.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
