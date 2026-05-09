
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Shield,
  CheckCircle,
  XCircle,
  Calendar,
  User,
  Mail,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

interface Celebration {
  id: string;
  dogName: string;
  dogBreed: string;
  milestoneType: string;
  caption: string;
  milestoneDate: string;
  photoUrl: string;
  submittedAt: string;
  user: {
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
}

const milestoneLabels: Record<string, string> = {
  birthday: 'Birthday',
  adoption_anniversary: 'Adoption Anniversary',
  gotcha_day: 'Gotcha Day',
  training_achievement: 'Training Achievement',
  health_milestone: 'Health Milestone',
};

const milestoneColors: Record<string, string> = {
  birthday: 'bg-pink-500',
  adoption_anniversary: 'bg-blue-500',
  gotcha_day: 'bg-red-500',
  training_achievement: 'bg-yellow-500',
  health_milestone: 'bg-green-500',
};

export default function AdminCelebrationsPage() {
  const router = useRouter();
  const { data: session, status } = useSession() || {};
  
  const [celebrations, setCelebrations] = useState<Celebration[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    if (status === 'authenticated') {
      fetchPendingCelebrations();
    }
  }, [status, router]);

  const fetchPendingCelebrations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/celebrations/pending');
      const data = await response.json();

      if (response.status === 403) {
        toast.error('Admin access required');
        router.push('/dashboard');
        return;
      }

      if (data.success) {
        setCelebrations(data.celebrations);
      }
    } catch (error) {
      console.error('Error fetching pending celebrations:', error);
      toast.error('Failed to load pending celebrations');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (celebrationId: string) => {
    try {
      setProcessingId(celebrationId);

      const response = await fetch(`/api/celebrations/${celebrationId}/approve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'approve',
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Celebration approved!');
        setCelebrations(celebrations.filter((c) => c.id !== celebrationId));
      } else {
        toast.error(data.error || 'Failed to approve celebration');
      }
    } catch (error) {
      console.error('Error approving celebration:', error);
      toast.error('Failed to approve celebration');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    if (!rejectingId) return;

    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    try {
      setProcessingId(rejectingId);

      const response = await fetch(`/api/celebrations/${rejectingId}/approve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'reject',
          rejectionReason: rejectionReason,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Celebration rejected');
        setCelebrations(celebrations.filter((c) => c.id !== rejectingId));
        setRejectionReason('');
        setRejectingId(null);
      } else {
        toast.error(data.error || 'Failed to reject celebration');
      }
    } catch (error) {
      console.error('Error rejecting celebration:', error);
      toast.error('Failed to reject celebration');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (celebrationId: string) => {
    try {
      setProcessingId(celebrationId);

      const response = await fetch(`/api/celebrations/${celebrationId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Celebration deleted');
        setCelebrations(celebrations.filter((c) => c.id !== celebrationId));
      } else {
        toast.error(data.error || 'Failed to delete celebration');
      }
    } catch (error) {
      console.error('Error deleting celebration:', error);
      toast.error('Failed to delete celebration');
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">
              Celebration Moderation
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Review and moderate pending milestone celebration submissions
          </p>
          <div className="mt-4">
            <Badge variant="secondary" className="text-lg px-4 py-2">
              {celebrations.length} Pending
            </Badge>
          </div>
        </div>

        {/* Empty State */}
        {celebrations.length === 0 && (
          <Card className="p-12 text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              All caught up!
            </h3>
            <p className="text-gray-600">
              There are no pending celebration submissions to review.
            </p>
          </Card>
        )}

        {/* Celebrations Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {celebrations.map((celebration) => (
            <Card key={celebration.id} className="overflow-hidden">
              <CardHeader className="bg-gray-50">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl mb-2">
                      {celebration.dogName}
                    </CardTitle>
                    <p className="text-sm text-gray-600">{celebration.dogBreed}</p>
                  </div>
                  <Badge
                    className={`${milestoneColors[celebration.milestoneType]} text-white`}
                  >
                    {milestoneLabels[celebration.milestoneType]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {/* Photo */}
                <div className="relative aspect-square bg-gray-200">
                  <Image
                    src={celebration.photoUrl}
                    alt={`${celebration.dogName}'s ${milestoneLabels[celebration.milestoneType]}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>

                {/* Details */}
                <div className="p-6 space-y-4">
                  {/* Caption */}
                  <div>
                    <Label className="text-sm font-semibold text-gray-700">
                      Caption
                    </Label>
                    <p className="text-gray-900 mt-1">{celebration.caption}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {celebration.caption.length}/100 characters
                    </p>
                  </div>

                  {/* Milestone Date */}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>Milestone: {formatDate(celebration.milestoneDate)}</span>
                  </div>

                  {/* Submitter Info */}
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User className="h-4 w-4" />
                      <span>
                        {celebration.user.firstName || celebration.user.lastName
                          ? `${celebration.user.firstName || ''} ${celebration.user.lastName || ''}`.trim()
                          : 'Anonymous'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="h-4 w-4" />
                      <span>{celebration.user.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      <span>Submitted: {formatDate(celebration.submittedAt)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={() => handleApprove(celebration.id)}
                      disabled={processingId === celebration.id}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          disabled={processingId === celebration.id}
                          className="flex-1 border-red-600 text-red-600 hover:bg-red-50"
                          onClick={() => setRejectingId(celebration.id)}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Reject Celebration</AlertDialogTitle>
                          <AlertDialogDescription>
                            Please provide a reason for rejecting this celebration. The
                            user will be notified via email.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="py-4">
                          <Label htmlFor="rejectionReason">Rejection Reason</Label>
                          <Textarea
                            id="rejectionReason"
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="e.g., Photo does not meet quality standards, Caption contains promotional content, etc."
                            rows={4}
                            className="mt-2"
                          />
                        </div>
                        <AlertDialogFooter>
                          <AlertDialogCancel
                            onClick={() => {
                              setRejectingId(null);
                              setRejectionReason('');
                            }}
                          >
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleReject}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Reject Celebration
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={processingId === celebration.id}
                          className="text-gray-600 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Celebration</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to permanently delete this celebration?
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(celebration.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
