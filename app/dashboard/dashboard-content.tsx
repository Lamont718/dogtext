
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
import { PawChatIllustration } from '../../components/illustrations/empty-state';

import { Dog, User, MessageUsage } from '../../types/interfaces';

interface DashboardContentProps {
  dogs: Dog[];
  user: User | null;
  messageUsage: MessageUsage | null;
}

export default function DashboardContent({ dogs, user, messageUsage }: DashboardContentProps) {
  const [showAddDogForm, setShowAddDogForm] = useState(false);
  const [editingDog, setEditingDog] = useState<Dog | null>(null);

  if (!user) return null;

  const isPremium = user.subscriptionTier === 'PREMIUM' || user.subscriptionTier === 'FAMILY';
  const maxDogs =
    user.subscriptionTier === 'FAMILY' ? 5 : user.subscriptionTier === 'PREMIUM' ? 3 : 1;
  const messageLimit = user.subscriptionTier === 'FREE' ? 5 : 999999;
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
            Welcome back, {user.firstName || 'there'}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your dogs and explore everything DogText has to offer.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge
            variant={isPremium ? 'default' : 'secondary'}
            className={isPremium ? 'bg-[#FF8C42]' : ''}
          >
            {isPremium && <Crown className="w-3 h-3 mr-1" />}
            {user.subscriptionTier} Plan
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          {
            icon: Heart,
            label: 'My Dogs',
            value: `${dogs.length}/${maxDogs}`,
          },
          {
            icon: MessageCircle,
            label: 'Messages Left',
            value: isPremium ? '∞' : String(messagesRemaining),
            progress: isPremium ? null : (messagesUsed / messageLimit) * 100,
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
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-[#FFF8F0] rounded-lg dark:bg-[#FF8C42]/10">
                    <Icon className="w-6 h-6 text-[#FF8C42]" />
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 dark:text-gray-400">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 dark:text-gray-100">
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

      {/* Daily Barks */}
      {dogs.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Today's barks</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                One short message from each of your dogs, every morning.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {dogs.map((dog) => (
              <DailyBarkCard
                key={dog.id}
                dogId={dog.id}
                dogName={dog.name}
                dogBreed={dog.breed}
                dogPhotoUrl={dog.photoUrl}
              />
            ))}
          </div>
        </div>
      )}

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
                  Create a profile and you'll get a daily message from them every morning,
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
                        <Avatar className="w-12 h-12">
                          {dog.photoUrl ? (
                            <AvatarImage src={dog.photoUrl} alt={dog.name} />
                          ) : (
                            <AvatarFallback className="bg-[#FFF8F0] text-[#FF8C42]">
                              {dog.name.charAt(0)}
                            </AvatarFallback>
                          )}
                        </Avatar>
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
                        {isPremium && (
                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="border-amber-600 text-amber-600 hover:bg-amber-50"
                          >
                            <Link href={`/dashboard/celebrations/new?dogId=${dog.id}`}>
                              <Sparkles className="w-4 h-4 mr-2" />
                              Add Milestone
                            </Link>
                          </Button>
                        )}
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

          {/* Upgrade Prompt for Free Users */}
          {!isPremium && (
            <Card className="bg-[#FFF8F0] border-[#FFB88C]">
              <CardContent className="p-6">
                <div className="flex items-center mb-3">
                  <Crown className="w-5 h-5 text-[#FF8C42] mr-2" />
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">Reserve founder pricing</h3>
                </div>
                <ul className="text-sm text-gray-700 space-y-1 mb-4">
                  <li>• Unlimited AI conversations</li>
                  <li>• Up to 3 dog profiles (Premium) or 5 (Family)</li>
                  <li>• Priority support over email</li>
                  <li>• Lock today's price for life</li>
                </ul>
                <Button asChild className="w-full bg-[#FF8C42] hover:bg-[#FF6B1A]">
                  <Link href="/premium">
                    <Crown className="w-4 h-4 mr-2" />
                    See pricing
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Usage Stats for Free Users */}
          {!isPremium && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Weekly Usage</CardTitle>
                <CardDescription>Resets every Monday</CardDescription>
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
