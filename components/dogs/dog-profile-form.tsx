
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Checkbox } from '../ui/checkbox';
import { Upload, Heart } from 'lucide-react';
import { toast } from 'sonner';

const MAX_TRAITS = 3;

interface Dog {
  id?: string;
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
}

interface DogProfileFormProps {
  dog?: Dog;
  onSuccess?: () => void;
}

const personalityOptions = [
  'Playful', 'Calm', 'Energetic', 'Gentle', 'Protective', 'Friendly',
  'Independent', 'Loyal', 'Curious', 'Affectionate', 'Intelligent', 'Stubborn'
];

const popularBreeds = [
  'Labrador Retriever', 'Golden Retriever', 'German Shepherd', 'Bulldog', 'Poodle',
  'Beagle', 'Rottweiler', 'Yorkshire Terrier', 'Dachshund', 'Siberian Husky',
  'Boxer', 'Boston Terrier', 'Shih Tzu', 'Chihuahua', 'Border Collie',
  'Australian Shepherd', 'Cocker Spaniel', 'Maltese', 'Pomeranian', 'Great Dane',
  'Mixed Breed', 'Other'
];

export default function DogProfileForm({ dog, onSuccess }: DogProfileFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Dog>(dog || {
    name: '',
    breed: '',
    age: undefined,
    ageUnit: 'years',
    weight: undefined,
    weightUnit: 'lbs',
    gender: '',
    personalityTraits: [],
    healthConditions: [],
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [customBreed, setCustomBreed] = useState('');

  const handleInputChange = (field: keyof Dog, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePersonalityChange = (trait: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => {
        if (prev.personalityTraits.length >= MAX_TRAITS) {
          toast.info(`Pick up to ${MAX_TRAITS} traits — uncheck one first.`);
          return prev;
        }
        return { ...prev, personalityTraits: [...prev.personalityTraits, trait] };
      });
    } else {
      setFormData(prev => ({
        ...prev,
        personalityTraits: prev.personalityTraits.filter(t => t !== trait)
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.breed) return;

    setIsLoading(true);

    try {
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('breed', formData.breed === 'Other' ? customBreed : formData.breed);
      if (formData.age) submitData.append('age', formData.age.toString());
      if (formData.ageUnit) submitData.append('ageUnit', formData.ageUnit);
      if (formData.weight) submitData.append('weight', formData.weight.toString());
      if (formData.weightUnit) submitData.append('weightUnit', formData.weightUnit);
      if (formData.gender) submitData.append('gender', formData.gender);
      submitData.append('personalityTraits', formData.personalityTraits.join(','));
      submitData.append('healthConditions', formData.healthConditions.join(','));
      if (selectedFile) submitData.append('photo', selectedFile);

      const url = dog?.id ? `/api/dogs/${dog.id}` : '/api/dogs';
      const method = dog?.id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        body: dog?.id ? JSON.stringify(formData) : submitData,
        headers: dog?.id ? { 'Content-Type': 'application/json' } : {},
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save dog profile');
      }

      const savedDog = await response.json();
      
      if (onSuccess) {
        onSuccess();
      } else {
        router.push(`/dashboard`);
      }
    } catch (error) {
      console.error('Error saving dog profile:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save dog profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Heart className="w-5 h-5 text-blue-600" />
          <span>{dog ? 'Edit' : 'Add'} Dog Profile</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Your dog's name"
                required
              />
            </div>

            <div>
              <Label htmlFor="breed">Breed *</Label>
              <Select
                value={formData.breed}
                onValueChange={(value) => handleInputChange('breed', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a breed" />
                </SelectTrigger>
                <SelectContent>
                  {popularBreeds.map((breed) => (
                    <SelectItem key={breed} value={breed}>
                      {breed}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Custom Breed Input */}
          {formData.breed === 'Other' && (
            <div>
              <Label htmlFor="customBreed">Breed Name</Label>
              <Input
                id="customBreed"
                value={customBreed}
                onChange={(e) => setCustomBreed(e.target.value)}
                placeholder="Enter breed name"
              />
            </div>
          )}

          {/* Age and Weight */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                value={formData.age || ''}
                onChange={(e) => handleInputChange('age', e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="Age"
                min="0"
              />
            </div>

            <div>
              <Label htmlFor="ageUnit">Unit</Label>
              <Select
                value={formData.ageUnit || undefined}
                onValueChange={(value) => handleInputChange('ageUnit', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="months">Months</SelectItem>
                  <SelectItem value="years">Years</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="weight">Weight</Label>
              <Input
                id="weight"
                type="number"
                value={formData.weight || ''}
                onChange={(e) => handleInputChange('weight', e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="Weight"
                min="0"
                step="0.1"
              />
            </div>

            <div>
              <Label htmlFor="weightUnit">Unit</Label>
              <Select
                value={formData.weightUnit || undefined}
                onValueChange={(value) => handleInputChange('weightUnit', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lbs">lbs</SelectItem>
                  <SelectItem value="kg">kg</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Gender */}
          <div>
            <Label htmlFor="gender">Gender</Label>
            <Select
              value={formData.gender || undefined}
              onValueChange={(value) => handleInputChange('gender', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Personality Traits */}
          <div>
            <div className="flex items-baseline justify-between">
              <Label>Personality Traits</Label>
              <span className="text-xs text-gray-500">
                {formData.personalityTraits.length}/{MAX_TRAITS} selected
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Pick the {MAX_TRAITS} that fit best — these shape how the AI talks.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
              {personalityOptions.map((trait) => {
                const checked = formData.personalityTraits.includes(trait);
                const disabled = !checked && formData.personalityTraits.length >= MAX_TRAITS;
                return (
                  <label
                    key={trait}
                    className={`flex items-center space-x-2 ${
                      disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                    }`}
                  >
                    <Checkbox
                      checked={checked}
                      disabled={disabled}
                      onCheckedChange={(c) => handlePersonalityChange(trait, c as boolean)}
                    />
                    <span className="text-sm">{trait}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Health Conditions */}
          <div>
            <Label htmlFor="healthConditions">Health Conditions</Label>
            <Textarea
              id="healthConditions"
              value={formData.healthConditions.join(', ')}
              onChange={(e) => handleInputChange('healthConditions', 
                e.target.value.split(',').map(s => s.trim()).filter(s => s)
              )}
              placeholder="Any health conditions or concerns (comma separated)"
              className="min-h-[80px]"
            />
          </div>

          {/* Photo Upload */}
          {!dog && (
            <div>
              <Label htmlFor="photo">Photo</Label>
              <div className="mt-2">
                <label
                  htmlFor="photo"
                  className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors"
                >
                  <div className="text-center">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      {selectedFile ? selectedFile.name : 'Click to upload a photo'}
                    </p>
                  </div>
                  <input
                    id="photo"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading || !formData.name || !formData.breed}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? 'Saving...' : dog ? 'Update Profile' : 'Add Dog'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
