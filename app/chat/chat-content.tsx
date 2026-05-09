
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { MessageCircle, ArrowLeft } from 'lucide-react';
import ChatInterface from '../../components/chat/chat-interface';
import Link from 'next/link';

import { Dog } from '../../types/interfaces';

interface ChatPageContentProps {
  dogs: Dog[];
  selectedDog: Dog;
}

export default function ChatPageContent({ dogs, selectedDog }: ChatPageContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const handleDogChange = (dogId: string) => {
    const params = new URLSearchParams(searchParams?.toString());
    params.set('dog', dogId);
    router.push(`/chat?${params.toString()}`);
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
        
        {/* Dog Selector */}
        {dogs.length > 1 && (
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-600">Chat with:</span>
            <Select value={selectedDog.id} onValueChange={handleDogChange}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {dogs.map((dog) => (
                  <SelectItem key={dog.id} value={dog.id}>
                    <div className="flex items-center space-x-2">
                      <Avatar className="w-6 h-6">
                        {dog.photoUrl ? (
                          <AvatarImage src={dog.photoUrl} alt={dog.name} />
                        ) : (
                          <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                            {dog.name.charAt(0)}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <span>{dog.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Chat Interface */}
      <ChatInterface dog={selectedDog} />
    </>
  );
}
