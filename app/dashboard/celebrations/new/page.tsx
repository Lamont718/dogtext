
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Sparkles, Upload, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

interface Dog {
  id: string;
  name: string;
  breed: string;
}

function NewCelebrationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession() || {};
  
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [loadingDogs, setLoadingDogs] = useState(true);
  const [selectedDogId, setSelectedDogId] = useState('');
  const [milestoneType, setMilestoneType] = useState('');
  const [caption, setCaption] = useState('');
  const [milestoneDate, setMilestoneDate] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    if (status === 'authenticated') {
      fetchDogs();
      
      // Pre-select dog if dogId is in query params
      const dogId = searchParams?.get('dogId');
      if (dogId) {
        setSelectedDogId(dogId);
      }
    }
  }, [status, searchParams, router]);

  const fetchDogs = async () => {
    try {
      const response = await fetch('/api/dogs');
      const data = await response.json();
      
      if (data.success) {
        setDogs(data.dogs);
      }
    } catch (error) {
      console.error('Error fetching dogs:', error);
      toast.error('Failed to load your dogs');
    } finally {
      setLoadingDogs(false);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a JPEG, PNG, or WebP image');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setPhoto(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!selectedDogId) {
      toast.error('Please select a dog');
      return;
    }

    if (!milestoneType) {
      toast.error('Please select a milestone type');
      return;
    }

    if (!caption.trim()) {
      toast.error('Please enter a caption');
      return;
    }

    if (caption.length > 100) {
      toast.error('Caption must be 100 characters or less');
      return;
    }

    if (!milestoneDate) {
      toast.error('Please select a milestone date');
      return;
    }

    if (!photo) {
      toast.error('Please upload a photo');
      return;
    }

    try {
      setSubmitting(true);

      // Create form data
      const formData = new FormData();
      formData.append('dogId', selectedDogId);
      formData.append('milestoneType', milestoneType);
      formData.append('caption', caption);
      formData.append('milestoneDate', milestoneDate);
      formData.append('photo', photo);

      const response = await fetch('/api/celebrations', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setSubmitted(true);
        toast.success('Celebration submitted! It will appear once approved by our team.');
      } else {
        toast.error(data.error || 'Failed to submit celebration');
      }
    } catch (error) {
      console.error('Error submitting celebration:', error);
      toast.error('Failed to submit celebration. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (status === 'loading' || loadingDogs) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="text-center p-12">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Celebration Submitted!
            </h2>
            <p className="text-gray-600 mb-8 text-lg">
              Your milestone celebration has been submitted for review. Our team will
              review it within 24-48 hours, and you'll receive an email once it's
              approved and live in the gallery.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild variant="outline" size="lg">
                <Link href="/celebrations">
                  View Gallery
                </Link>
              </Button>
              <Button asChild size="lg" className="bg-amber-600 hover:bg-amber-700">
                <Link href="/dashboard">
                  Back to Dashboard
                </Link>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="h-8 w-8 text-amber-600" />
            <h1 className="text-4xl font-bold text-gray-900">
              Share a Milestone Celebration
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Celebrate your dog's special moments with our community! Your submission
            will be reviewed before appearing in the public gallery.
          </p>
        </div>

        {/* Info Alert */}
        <Alert className="mb-8 border-amber-200 bg-amber-50">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-900">
            Please review our{' '}
            <Link
              href="/celebrations/guidelines"
              className="underline font-medium hover:text-amber-700"
            >
              submission guidelines
            </Link>{' '}
            before submitting. All celebrations are manually reviewed.
          </AlertDescription>
        </Alert>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Celebration Details</CardTitle>
            <CardDescription>
              All fields are required. Photos must be under 5MB.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Select Dog */}
              <div className="space-y-2">
                <Label htmlFor="dog">Select Dog *</Label>
                <Select value={selectedDogId} onValueChange={setSelectedDogId}>
                  <SelectTrigger id="dog">
                    <SelectValue placeholder="Choose a dog" />
                  </SelectTrigger>
                  <SelectContent>
                    {dogs.map((dog) => (
                      <SelectItem key={dog.id} value={dog.id}>
                        {dog.name} ({dog.breed})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Milestone Type */}
              <div className="space-y-2">
                <Label htmlFor="milestoneType">Milestone Type *</Label>
                <Select value={milestoneType} onValueChange={setMilestoneType}>
                  <SelectTrigger id="milestoneType">
                    <SelectValue placeholder="Select milestone type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="birthday">🎂 Birthday</SelectItem>
                    <SelectItem value="adoption_anniversary">🏠 Adoption Anniversary</SelectItem>
                    <SelectItem value="gotcha_day">❤️ Gotcha Day</SelectItem>
                    <SelectItem value="training_achievement">🏆 Training Achievement</SelectItem>
                    <SelectItem value="health_milestone">💪 Health Milestone</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Caption */}
              <div className="space-y-2">
                <Label htmlFor="caption">
                  Caption * ({caption.length}/100 characters)
                </Label>
                <Textarea
                  id="caption"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Share what makes this moment special..."
                  maxLength={100}
                  rows={3}
                  className="resize-none"
                />
              </div>

              {/* Milestone Date */}
              <div className="space-y-2">
                <Label htmlFor="milestoneDate">Milestone Date *</Label>
                <Input
                  id="milestoneDate"
                  type="date"
                  value={milestoneDate}
                  onChange={(e) => setMilestoneDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>

              {/* Photo Upload */}
              <div className="space-y-2">
                <Label htmlFor="photo">Photo * (Max 5MB, JPEG/PNG/WebP)</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-amber-500 transition-colors">
                  {photoPreview ? (
                    <div className="space-y-4">
                      <div className="relative w-full aspect-square max-w-md mx-auto">
                        <Image
                          src={photoPreview}
                          alt="Preview"
                          fill
                          className="object-cover rounded-lg"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setPhoto(null);
                          setPhotoPreview('');
                        }}
                      >
                        Change Photo
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">Click to upload a photo</p>
                      <p className="text-sm text-gray-500">JPEG, PNG, or WebP (Max 5MB)</p>
                      <Input
                        id="photo"
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={handlePhotoChange}
                        className="mt-4"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/dashboard')}
                  disabled={submitting}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-amber-600 hover:bg-amber-700"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Submit for Review
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function NewCelebrationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading...</p>
        </div>
      </div>
    }>
      <NewCelebrationForm />
    </Suspense>
  );
}
