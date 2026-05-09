
'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Send, MessageCircle, Crown } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import Link from 'next/link';
import { toast } from 'sonner';

interface Message {
  id: string;
  messageText: string;
  senderType: 'user' | 'ai';
  createdAt: string;
}

import { Dog } from '../../types/interfaces';

interface ChatInterfaceProps {
  dog: Dog;
}

export default function ChatInterface({ dog }: ChatInterfaceProps) {
  const { data: session } = useSession() || {};
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messageUsage, setMessageUsage] = useState<{
    subscriptionTier: string;
    messageCount: number;
    limit: number;
    remaining: number;
  } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat history
  useEffect(() => {
    if (dog?.id) {
      loadChatHistory();
      loadMessageUsage();
    }
  }, [dog?.id]);

  const loadChatHistory = async () => {
    try {
      const response = await fetch(`/api/chat/history/${dog.id}`);
      if (response.ok) {
        const history = await response.json();
        setMessages(history);
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  };

  const loadMessageUsage = async () => {
    try {
      const response = await fetch('/api/user/message-usage');
      if (response.ok) {
        const usage = await response.json();
        setMessageUsage(usage);
      }
    } catch (error) {
      console.error('Failed to load message usage:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || isLoading) return;

    // Check message limits
    if (messageUsage?.subscriptionTier === 'FREE' && messageUsage.remaining <= 0) {
      toast.error("You've hit your weekly message limit. Upgrade to Premium for unlimited.");
      return;
    }

    const messageText = newMessage.trim();
    setNewMessage('');
    setIsLoading(true);

    // Add user message to UI
    const userMessage: Message = {
      id: Date.now().toString(),
      messageText,
      senderType: 'user',
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMessage]);

    // Add loading message
    const loadingMessage: Message = {
      id: 'loading',
      messageText: 'Thinking...',
      senderType: 'ai',
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, loadingMessage]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dogId: dog.id,
          message: messageText,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send message');
      }

      // Remove loading message
      setMessages(prev => prev.filter(m => m.id !== 'loading'));

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let aiResponse = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n').filter(line => line.trim() !== '');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') {
                // Final AI message
                const aiMessage: Message = {
                  id: Date.now().toString(),
                  messageText: aiResponse,
                  senderType: 'ai',
                  createdAt: new Date().toISOString(),
                };
                setMessages(prev => [...prev.filter(m => m.id !== 'streaming'), aiMessage]);
                loadMessageUsage(); // Refresh usage after successful message
                return;
              }

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content || '';
                if (content) {
                  aiResponse += content;
                  
                  // Update streaming message
                  setMessages(prev => {
                    const filtered = prev.filter(m => m.id !== 'streaming');
                    const streamingMessage: Message = {
                      id: 'streaming',
                      messageText: aiResponse,
                      senderType: 'ai',
                      createdAt: new Date().toISOString(),
                    };
                    return [...filtered, streamingMessage];
                  });
                }
              } catch (e) {
                // Skip invalid JSON
              }
            }
          }
        }
      }
    } catch (error) {
      setMessages(prev => prev.filter(m => m.id === 'loading' || m.id === 'streaming' ? false : true));
      console.error('Error sending message:', error);
      alert(error instanceof Error ? error.message : 'Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!session) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Sign in to chat with your dog</h3>
          <p className="text-gray-600 mb-6">
            Create an account to start having conversations with your AI dog companion.
          </p>
          <Button asChild>
            <Link href="/auth/signup">Get Started</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <MessageCircle className="w-5 h-5 text-blue-600" />
                <span>Chatting with {dog?.name}</span>
              </CardTitle>
              <p className="text-gray-600 text-sm">
                {dog?.age ? `${dog.age} ${dog.ageUnit} old` : ''} {dog?.breed}
              </p>
            </div>
            {messageUsage && (
              <div className="text-right">
                <div className="text-sm text-gray-600">
                  {messageUsage.subscriptionTier === 'FREE' ? (
                    <>
                      <span className={messageUsage.remaining <= 1 ? 'text-red-600 font-semibold' : ''}>
                        {messageUsage.remaining} of {messageUsage.limit} messages left
                      </span>
                      <div className="mt-1">
                        <Link href="/premium" className="text-blue-600 hover:text-blue-700 text-xs flex items-center">
                          <Crown className="w-3 h-3 mr-1" />
                          Upgrade for unlimited
                        </Link>
                      </div>
                    </>
                  ) : (
                    <span className="text-green-600 font-semibold">Unlimited messages</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Chat Messages */}
      <Card className="mb-6">
        <CardContent className="p-0">
          <ScrollArea className="h-[500px] p-4">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Start a conversation with {dog?.name}</h3>
                <p className="text-gray-600 text-sm">
                  Ask about their day, training tips, or just say hello!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start space-x-3 ${
                      message.senderType === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                    }`}
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className={
                        message.senderType === 'user' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-green-100 text-green-700'
                      }>
                        {message.senderType === 'user' 
                          ? (session?.user?.name?.charAt(0) || 'U')
                          : dog?.name?.charAt(0) || 'D'
                        }
                      </AvatarFallback>
                    </Avatar>
                    <div className={`max-w-xs lg:max-w-md rounded-lg px-3 py-2 ${
                      message.senderType === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      <p className="text-sm">{message.messageText}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Message Input */}
      <Card>
        <CardContent className="p-4">
          <div className="flex space-x-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Type a message to ${dog?.name}...`}
              disabled={isLoading || (messageUsage?.subscriptionTier === 'FREE' && messageUsage?.remaining <= 0)}
              className="flex-1"
            />
            <Button
              onClick={sendMessage}
              disabled={isLoading || !newMessage.trim() || (messageUsage?.subscriptionTier === 'FREE' && messageUsage?.remaining <= 0)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          {messageUsage?.subscriptionTier === 'FREE' && messageUsage.remaining <= 1 && (
            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                {messageUsage.remaining === 0 
                  ? "You've reached your weekly message limit."
                  : "You have 1 message remaining this week."
                } <Link href="/premium" className="text-blue-600 hover:text-blue-700 font-semibold">Upgrade to Premium</Link> for unlimited conversations!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
