
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Sparkles, Calendar, Filter, AlertCircle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Celebration {
  id: string;
  dogName: string;
  dogBreed: string;
  milestoneType: string;
  caption: string;
  milestoneDate: string;
  photoUrl: string;
  submittedAt: string;
}

const milestoneTypes = [
  { value: 'all', label: 'All Milestones', icon: '🎉' },
  { value: 'birthday', label: 'Birthdays', icon: '🎂' },
  { value: 'adoption_anniversary', label: 'Adoption Anniversaries', icon: '🏠' },
  { value: 'gotcha_day', label: 'Gotcha Days', icon: '❤️' },
  { value: 'training_achievement', label: 'Training Wins', icon: '🏆' },
  { value: 'health_milestone', label: 'Health Milestones', icon: '💪' },
];

const milestoneColors: Record<string, string> = {
  birthday: 'bg-pink-500',
  adoption_anniversary: 'bg-blue-500',
  gotcha_day: 'bg-red-500',
  training_achievement: 'bg-yellow-500',
  health_milestone: 'bg-green-500',
};

const milestoneLabels: Record<string, string> = {
  birthday: 'Birthday',
  adoption_anniversary: 'Adoption Anniversary',
  gotcha_day: 'Gotcha Day',
  training_achievement: 'Training Achievement',
  health_milestone: 'Health Milestone',
};

export default function CelebrationsPage() {
  const [celebrations, setCelebrations] = useState<Celebration[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    fetchCelebrations();
  }, [selectedFilter]);

  const fetchCelebrations = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/celebrations?milestoneType=${selectedFilter}&limit=50`
      );
      const data = await response.json();

      if (data.success) {
        setCelebrations(data.celebrations);
        setHasMore(data.hasMore);
      }
    } catch (error) {
      console.error('Error fetching celebrations:', error);
    } finally {
      setLoading(false);
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-8 w-8 text-amber-600" />
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
              Milestone Celebrations
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            A gallery of special moments from our DogText community. Every milestone
            deserves to be celebrated! 🎉
          </p>
          <div className="mt-6 flex flex-wrap gap-3 items-center justify-center">
            <Link href="/celebrations/guidelines">
              <Button variant="outline" size="sm">
                Submission Guidelines
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="default" size="sm" className="bg-amber-600 hover:bg-amber-700">
                <Sparkles className="h-4 w-4 mr-2" />
                Share Your Milestone
              </Button>
            </Link>
          </div>
        </div>

        {/* Filter */}
        <div className="mb-8 flex items-center justify-center gap-4">
          <Filter className="h-5 w-5 text-gray-500" />
          <Select value={selectedFilter} onValueChange={setSelectedFilter}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Filter by milestone" />
            </SelectTrigger>
            <SelectContent>
              {milestoneTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  <span className="flex items-center gap-2">
                    <span>{type.icon}</span>
                    <span>{type.label}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading celebrations...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && celebrations.length === 0 && (
          <Card className="p-12 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No celebrations yet
            </h3>
            <p className="text-gray-600 mb-6">
              Be the first to share a special milestone with our community!
            </p>
            <Link href="/dashboard">
              <Button className="bg-amber-600 hover:bg-amber-700">
                Share Your Milestone
              </Button>
            </Link>
          </Card>
        )}

        {/* Masonry Grid */}
        {!loading && celebrations.length > 0 && (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            {celebrations.map((celebration) => (
              <Card
                key={celebration.id}
                className="break-inside-avoid overflow-hidden hover:shadow-xl transition-shadow duration-300 group"
              >
                {/* Image */}
                <div className="relative aspect-square bg-gray-200">
                  <Image
                    src={celebration.photoUrl}
                    alt={`${celebration.dogName}'s ${milestoneLabels[celebration.milestoneType]}`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  {/* Milestone Badge */}
                  <div className="absolute top-3 right-3">
                    <Badge
                      className={`${milestoneColors[celebration.milestoneType]} text-white font-semibold px-3 py-1`}
                    >
                      {milestoneLabels[celebration.milestoneType]}
                    </Badge>
                  </div>
                  {/* Watermark */}
                  <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded">
                    Celebrating with DogText
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-bold text-lg text-gray-900 mb-1">
                    {celebration.dogName}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">{celebration.dogBreed}</p>
                  <p className="text-gray-800 mb-3 leading-relaxed">
                    {celebration.caption}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(celebration.milestoneDate)}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Load More (if needed in future) */}
        {hasMore && !loading && (
          <div className="text-center mt-12">
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                // Implement load more functionality
              }}
            >
              Load More Celebrations
            </Button>
          </div>
        )}

        {/* Footer Note */}
        <div className="mt-16 text-center text-sm text-gray-500">
          <p>
            All celebrations are reviewed and approved by our team to ensure a
            positive, wholesome experience for everyone.
          </p>
        </div>
      </div>
    </div>
  );
}
