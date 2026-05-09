
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Sparkles,
  Shield,
  Heart,
} from 'lucide-react';

export default function GuidelinesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="h-8 w-8 text-amber-600" />
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
              Celebration Guidelines
            </h1>
          </div>
          <p className="text-lg text-gray-600">
            Help us keep our celebration gallery positive, safe, and wholesome for
            everyone
          </p>
        </div>

        {/* Who Can Submit */}
        <Card className="p-8 mb-8">
          <div className="flex items-start gap-4 mb-4">
            <Sparkles className="h-6 w-6 text-amber-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Who Can Submit?
              </h2>
              <p className="text-gray-700 mb-4">
                Milestone celebrations are an exclusive feature for our{' '}
                <strong>Premium</strong> and <strong>Family</strong> tier members.
              </p>
              <Link href="/premium">
                <Button className="bg-amber-600 hover:bg-amber-700">
                  Upgrade to Premium
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        {/* Milestone Types */}
        <Card className="p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Heart className="h-6 w-6 text-red-500" />
            Milestone Types
          </h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="text-2xl">🎂</span>
              <div>
                <strong className="text-gray-900">Birthdays</strong>
                <p className="text-gray-600">Celebrate your dog's birthday!</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-2xl">🏠</span>
              <div>
                <strong className="text-gray-900">Adoption Anniversaries</strong>
                <p className="text-gray-600">
                  Mark the anniversary of when you adopted your pup
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-2xl">❤️</span>
              <div>
                <strong className="text-gray-900">Gotcha Days</strong>
                <p className="text-gray-600">
                  Celebrate the day your dog came home
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-2xl">🏆</span>
              <div>
                <strong className="text-gray-900">Training Achievements</strong>
                <p className="text-gray-600">
                  Completed training, learned a new trick, earned a certification
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-2xl">💪</span>
              <div>
                <strong className="text-gray-900">Health Milestones</strong>
                <p className="text-gray-600">
                  Recovery from illness, weight goals, or health achievements
                </p>
              </div>
            </li>
          </ul>
        </Card>

        {/* Photo Requirements */}
        <Card className="p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Photo Requirements
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Do's */}
            <div>
              <h3 className="font-semibold text-green-700 mb-3 flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Do's
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Clear, well-lit photos of your dog</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Photos that celebrate the milestone</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Appropriate for all ages</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>High-quality images (under 5MB)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>JPEG, PNG, or WebP format</span>
                </li>
              </ul>
            </div>

            {/* Don'ts */}
            <div>
              <h3 className="font-semibold text-red-700 mb-3 flex items-center gap-2">
                <XCircle className="h-5 w-5" />
                Don'ts
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-red-600">✗</span>
                  <span>Promotional content or ads</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600">✗</span>
                  <span>Watermarks or logos (except ours)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600">✗</span>
                  <span>Graphic or disturbing content</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600">✗</span>
                  <span>Spam or duplicate submissions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600">✗</span>
                  <span>Photos of other people's dogs</span>
                </li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Caption Guidelines */}
        <Card className="p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Caption Guidelines
          </h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Keep it short:</strong> Maximum 100 characters
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Be positive:</strong> Share joy, not complaints
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Stay relevant:</strong> Focus on the milestone
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span>
                <strong>No promotions:</strong> No business, products, or external links
              </span>
            </li>
          </ul>
        </Card>

        {/* Review Process */}
        <Card className="p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Review Process
          </h2>
          <div className="space-y-4 text-gray-700">
            <p>
              All celebrations are manually reviewed by our team before appearing in
              the public gallery. This ensures our community remains positive and
              safe.
            </p>
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-900 mb-1">
                    Review Time
                  </p>
                  <p className="text-amber-800 text-sm">
                    Most submissions are reviewed within 24-48 hours. You'll be
                    notified via email once your celebration is approved.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Report Inappropriate Content */}
        <Card className="p-8 mb-8 bg-red-50 border-red-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Shield className="h-6 w-6 text-red-600" />
            Report Inappropriate Content
          </h2>
          <p className="text-gray-700 mb-4">
            If you see any celebration that violates these guidelines, please report
            it immediately. We take community safety seriously.
          </p>
          <Link href="/contact">
            <Button variant="outline" className="border-red-600 text-red-600 hover:bg-red-50">
              Report Content
            </Button>
          </Link>
        </Card>

        {/* Ready to Submit */}
        <div className="text-center bg-gradient-to-r from-amber-100 to-orange-100 p-8 rounded-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Share Your Milestone?
          </h2>
          <p className="text-gray-700 mb-6">
            Head to your dashboard to submit your celebration!
          </p>
          <Link href="/dashboard">
            <Button size="lg" className="bg-amber-600 hover:bg-amber-700">
              <Sparkles className="h-5 w-5 mr-2" />
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
