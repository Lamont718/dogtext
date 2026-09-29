
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Progress } from '../../components/ui/progress';
import {
  Heart,
  Plus,
  MessageCircle,
  BookOpen,
  Settings,
  Crown,
  Calendar,
  Activity,
  TrendingUp,
  Edit,
  Sparkles
} from 'lucide-react';
import DogProfileForm from '../../components/dogs/dog-profile-form';
import DailyBarkCard from '../../components/dashboard/daily-bark-card';
import NotifyCard from '../../components/dashboard/notify-card';
import KidsCard from '../../components/dashboard/kids-card';
import { PawChatIllustration } from '../../components/illustrations/empty-state';

import { Dog, User, MessageUsage } from '../../types/interfaces';

interface DashboardContentProps {
  dogs: Dog[];
  user: User | null;
  messageUsage: MessageUsage | null;
}

export default function DashboardContent({ dogs, user, messageUsage }: DashboardContentProps) {
  const [showAddDogForm, setShowAddDogForm] = useState(false);
  // Bumped when the kids change: today's letter is rewritten for them.
  const [letterVersion, setLetterVersion] = useState(0);
  const [editingDog, setEditingDog] = useState<Dog | null>(null);

  if (!user) return null;

  // One free plan for everyone (Premium dropped 2026-09-29).
  const maxDogs = 3;
  const messageLimit = 5;
  const messagesUsed = messageUsage?.messageCount || 0;
  const messagesRemaining = Math.max(0, messageLimit - messagesUsed);

  const canAddMoreDogs = dogs.length < maxDogs;

  const handleDogFormSuccess = () => {
    setShowAddDogForm(false);
    setEditingDog(null);
    window.location.reload(); // Simple refresh to update the UI
  };

  if (showAddDogForm) {
    return (
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => setShowAddDogForm(false)}
            className="mb-4"
          >
            ← Back to Dashboard
          </Button>
        </div>
        <DogProfileForm onSuccess={handleDogFormSuccess} />
      </div>
    );
  }

  if (editingDog) {
    return (
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => setEditingDog(null)}
            className="mb-4"
          >
            ← Back to Dashboard
          </Button>
        </div>
        <DogProfileForm dog={editingDog} onSuccess={handleDogFormSuccess} />
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {Date.now() - new Date(user.createdAt).getTime() < 24 * 60 * 60 * 1000
              ? 'Welcome'
              : 'Welcome back'}
            , {user.firstName || 'there'}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {dogs.length > 0
              ? `Here's what ${dogs[0].name} had to say this morning.`
              : "Add your dog to get their first text."}
          </p>
        </div>
      </div>

      {/* Daily Barks */}
      {dogs.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Today&apos;s letter</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                A new one every day. Read it aloud at breakfast or bedtime.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {dogs.map((dog) => (
              <DailyBarkCard
                key={`${dog.id}-${letterVersion}`}
                dogId={dog.id}
                dogName={dog.name}
                dogBreed={dog.breed}
                dogPhotoUrl={dog.photoUrl}
              />
            ))}
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <KidsCard dogName={dogs[0].name} onChange={() => setLetterVersion((v) => v + 1)} />
            <NotifyCard dogName={dogs[0].name} />
            <Link
              href="/dashboard/book"
              className="flex items-center gap-4 rounded-xl border border-[#FFB88C] bg-white p-5 hover:bg-[#FFF8F0] transition-colors"
            >
              <div className="w-11 h-11 rounded-full bg-[#FFF8F0] flex items-center justify-center shrink-0 text-xl">📖</div>
              <div className="flex-1 text-sm text-gray-700">
                <p className="font-semibold text-gray-900 mb-1">{dogs[0].name}&apos;s book</p>
                <p>Every letter becomes a page. See how it&apos;s coming together.</p>
              </div>
            </Link>
          </div>
        </div>
      )}

      {/* Quick Stats: one compact row, below the texts */}
      <div className="grid grid-cols-3 gap-2 sm:gap-6 mb-8">
        {[
          {
            icon: Heart,
            label: 'My Dogs',
            value: `${dogs.length}/${maxDogs}`,
          },
          {
            icon: MessageCircle,
            label: 'Chats left',
            value: String(messagesRemaining),
            progress: (messagesUsed / messageLimit) * 100,
          },
          {
            icon: Calendar,
            label: 'Member Since',
            value: new Date(user.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              year: 'numeric',
            }),
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-3 sm:p-6">
                <div className="flex items-center">
                  <div className="hidden sm:block p-2 bg-[#FFF8F0] rounded-lg dark:bg-[#FF8C42]/10">
                    <Icon className="w-6 h-6 text-[#FF8C42]" />
                  </div>
                  <div className="sm:ml-4 flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">{stat.label}</p>
                    <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {stat.value}
                    </p>
                    {stat.progress !== null && stat.progress !== undefined && (
                      <Progress value={stat.progress} className="mt-2 h-2" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* My Dogs */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">My Dogs</h2>
            {canAddMoreDogs && (
              <Button 
                onClick={() => setShowAddDogForm(true)}
                className="bg-[#FF8C42] hover:bg-[#FF6B1A]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Dog
              </Button>
            )}
          </div>

          {dogs.length === 0 ? (
            <Card>
              <CardContent className="p-10 text-center">
                <PawChatIllustration size={180} className="mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Add your first dog
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-sm mx-auto">
                  Create a profile and they&apos;ll write your kids a letter every day,
                  plus AI chats based on their breed and personality.
                </p>
                <Button
                  onClick={() => setShowAddDogForm(true)}
                  className="bg-[#FF8C42] hover:bg-[#FF6B1A]"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Dog Profile
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {dogs.map((dog) => (
                <Card key={dog.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {dog.photoUrl ? (
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={dog.photoUrl} alt={dog.name} />
                          </Avatar>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setEditingDog(dog)}
                            className="w-12 h-12 shrink-0 rounded-full border-2 border-dashed border-[#FF8C42] text-[#FF8C42] text-[10px] font-semibold leading-tight hover:bg-[#FFF8F0]"
                          >
                            Add
                            <br />
                            photo
                          </button>
                        )}
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100">{dog.name}</h3>
                          <p className="text-gray-600 dark:text-gray-400 text-sm">
                            {dog.age ? `${dog.age} ${dog.ageUnit} old` : ''} {dog.breed}
                            {dog.weight && ` • ${dog.weight} ${dog.weightUnit}`}
                          </p>
                          {dog.personalityTraits.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {dog.personalityTraits.slice(0, 3).map((trait) => (
                                <Badge key={trait} variant="secondary" className="text-xs">
                                  {trait}
                                </Badge>
                              ))}
                              {dog.personalityTraits.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{dog.personalityTraits.length - 3}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingDog(dog)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="border-[#FF8C42] text-[#FF8C42] hover:bg-[#FFF8F0]"
                        >
                          <Link href={`/dashboard/celebrations/new?dogId=${dog.id}`}>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Milestone
                          </Link>
                        </Button>
                        <Button 
                          asChild 
                          className="bg-[#FF8C42] hover:bg-[#FF6B1A]"
                          size="sm"
                        >
                          <Link href={`/chat?dog=${dog.id}`}>
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Chat
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Add more dogs if under limit */}
              {canAddMoreDogs && (
                <Card 
                  className="border-dashed border-2 border-gray-300 hover:border-gray-400 cursor-pointer transition-colors"
                  onClick={() => setShowAddDogForm(true)}
                >
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Plus className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Add another dog ({dogs.length}/{maxDogs} used)
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {dogs.length > 0 && (
                <Button asChild className="w-full bg-[#FF8C42] hover:bg-[#FF6B1A]">
                  <Link href="/chat">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Chat with My Dog
                  </Link>
                </Button>
              )}
              <Button variant="outline" asChild className="w-full">
                <Link href="/learn/breeds">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Browse Breeds
                </Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href="/learn/articles">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Read Articles
                </Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href="/dashboard/settings">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Usage Stats for Free Users */}
          {(
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Weekly Usage</CardTitle>
                <CardDescription>Resets every Sunday</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Messages</span>
                    <span>{messagesUsed}/{messageLimit}</span>
                  </div>
                  <Progress value={(messagesUsed / messageLimit) * 100} />
                  <p className="text-xs text-gray-500">
                    {messagesRemaining > 0 
                      ? `${messagesRemaining} messages remaining`
                      : 'Weekly limit reached'
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
