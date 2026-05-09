
// Common interfaces used across the application

export interface Dog {
  id: string;
  name: string;
  breed: string;
  age?: number | null;
  ageUnit?: string | null;
  weight?: number | null;
  weightUnit?: string | null;
  gender?: string | null;
  personalityTraits: string[];
  healthConditions: string[];
  photoUrl?: string | null;
  cloudStoragePath?: string | null;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt?: Date | string;
  userId?: string;
}

export interface User {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  image?: string | null;
  subscriptionTier: string;
  subscriptionId?: string | null;
  createdAt: Date | string;
  updatedAt?: Date | string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content?: string;
  category: string;
  readTime: number;
  author: string;
  imageUrl?: string | null;
  imageAlt?: string | null;
  tags?: string[];
  isPublished?: boolean;
  isFeatured?: boolean;
  viewCount?: number;
  publishedAt: Date | string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface BreedProfile {
  id: string;
  breedName: string;
  slug: string;
  description: string;
  origin?: string;
  physicalCharacteristics?: string;
  temperament: string;
  exerciseNeeds?: string;
  groomingRequirements?: string;
  healthConsiderations?: string;
  trainingTips?: string;
  idealLivingConditions?: string;
  imageUrl?: string | null;
  imageAlt?: string | null;
  sizeCategory?: string | null;
  energyLevel?: string | null;
  groomingLevel?: string | null;
  trainability?: string | null;
  familyFriendly?: boolean;
  goodWithKids?: boolean;
  goodWithPets?: boolean;
  isPopular?: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface MessageUsage {
  id: string;
  userId: string;
  weekStartDate: Date | string;
  messageCount: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface AiChatMessage {
  id: string;
  userId: string;
  dogId: string;
  messageText: string;
  senderType: 'user' | 'ai';
  metadata?: any;
  createdAt: Date | string;
}
