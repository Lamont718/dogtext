'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Send, MessageCircle, Crown, Sparkles } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { ScrollArea } from '../ui/scroll-area';
import { Dog } from '../../types/interfaces';
import { sendToDog } from '../../lib/send-to-dog';

interface Message {
  id: string;
  messageText: string;
  senderType: 'user' | 'ai';
  createdAt: string;
  kind?: 'bark';
}

interface ChatInterfaceProps {
  dog: Dog;
}

const TYPING = 'typing';

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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!dog?.id) return;
    fetch(`/api/chat/history/${dog.id}`)
      .then((r) => (r.ok ? r.json() : []))
      .then(setMessages)
      .catch(() => {});
    loadMessageUsage();
  }, [dog?.id]);

  const loadMessageUsage = async () => {
    try {
      const response = await fetch('/api/user/message-usage');
      if (response.ok) setMessageUsage(await response.json());
    } catch {
      // the counter just won't show
    }
  };

  const outOfChats = messageUsage?.subscriptionTier === 'FREE' && messageUsage.remaining <= 0;

  const sendMessage = async () => {
    const text = newMessage.trim();
    if (!text || isLoading) return;
    if (outOfChats) {
      toast.error(`That's your chats for this week. ${dog.name}'s morning texts keep coming.`);
      return;
    }

    setNewMessage('');
    setIsLoading(true);
    const now = new Date().toISOString();
    setMessages((prev) => [
      ...prev,
      { id: `me-${Date.now()}`, messageText: text, senderType: 'user', createdAt: now },
      { id: TYPING, messageText: '', senderType: 'ai', createdAt: now },
    ]);

    try {
      const reply = await sendToDog(dog.id, text, (soFar) =>
        setMessages((prev) =>
          prev.map((m) => (m.id === TYPING ? { ...m, messageText: soFar } : m)),
        ),
      );
      setMessages((prev) =>
        prev.map((m) => (m.id === TYPING ? { ...m, id: `dog-${Date.now()}`, messageText: reply } : m)),
      );
      loadMessageUsage();
    } catch (error) {
      setMessages((prev) => prev.filter((m) => m.id !== TYPING));
      setNewMessage(text); // give them their words back
      toast.error(error instanceof Error ? error.message : 'Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
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
          <h3 className="text-lg font-semibold mb-2">Sign in to text your dog</h3>
          <Button asChild className="bg-[#FF8C42] hover:bg-[#FF6B1A] text-white rounded-full">
            <Link href="/auth/signup">Get started</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const dogAvatar = (
    <Avatar className="w-8 h-8 shrink-0">
      {dog.photoUrl ? <AvatarImage src={dog.photoUrl} alt={dog.name} /> : null}
      <AvatarFallback className="bg-[#FFF8F0] text-[#FF8C42] font-semibold">
        {dog.name.charAt(0)}
      </AvatarFallback>
    </Avatar>
  );

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="overflow-hidden">
        {/* Header, like the top of a text thread */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <Avatar className="w-11 h-11">
            {dog.photoUrl ? <AvatarImage src={dog.photoUrl} alt={dog.name} /> : null}
            <AvatarFallback className="bg-gradient-to-br from-[#FF8C42] to-[#FFB380] text-white font-bold">
              {dog.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900 dark:text-gray-100">{dog.name}</div>
            <div className="text-xs text-gray-500">{dog.breed}</div>
          </div>
          {messageUsage && (
            <div className="text-right text-xs">
              {messageUsage.subscriptionTier === 'FREE' ? (
                <>
                  <div className={messageUsage.remaining <= 1 ? 'text-red-600 font-semibold' : 'text-gray-500'}>
                    {messageUsage.remaining} of {messageUsage.limit} chats left this week
                  </div>
                  <Link href="/premium" className="text-[#FF8C42] hover:text-[#FF6B1A] inline-flex items-center gap-1 mt-0.5">
                    <Crown className="w-3 h-3" /> Unlimited with Premium
                  </Link>
                </>
              ) : (
                <span className="text-gray-500">Unlimited chats</span>
              )}
            </div>
          )}
        </div>

        <ScrollArea className="h-[60vh] min-h-[380px] px-4 py-5">
          {messages.length === 0 ? (
            <div className="text-center py-16 px-6">
              <p className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Text {dog.name}</p>
              <p className="text-sm text-gray-500">
                Ask what they did today, tell them you&apos;re running late, or just say hi.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((message) => {
                const mine = message.senderType === 'user';
                const typing = message.id === TYPING && !message.messageText;
                return (
                  <div key={message.id} className={`flex items-end gap-2 ${mine ? 'justify-end' : ''}`}>
                    {!mine && dogAvatar}
                    <div className="max-w-[80%]">
                      {message.kind === 'bark' && (
                        <div className="text-[11px] text-[#FF8C42] font-medium mb-1 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          Morning text ·{' '}
                          {new Date(message.createdAt).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </div>
                      )}
                      <div
                        className={`rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed whitespace-pre-line ${
                          mine
                            ? 'bg-[#FF8C42] text-white rounded-br-md'
                            : 'bg-gray-100 text-gray-900 dark:bg-muted dark:text-gray-100 rounded-bl-md'
                        }`}
                      >
                        {typing ? (
                          <span className="text-gray-400 italic">{dog.name} is typing…</span>
                        ) : (
                          message.messageText
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>

        <div className="border-t border-gray-100 dark:border-gray-800 p-3">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={outOfChats ? 'Chats reset Sunday' : `Text ${dog.name}…`}
              disabled={isLoading || outOfChats}
              maxLength={1000}
              className="flex-1 rounded-full"
            />
            <Button
              onClick={sendMessage}
              disabled={isLoading || !newMessage.trim() || outOfChats}
              className="rounded-full bg-[#FF8C42] hover:bg-[#FF6B1A] text-white"
              aria-label="Send"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          {outOfChats && (
            <p className="mt-2 text-xs text-gray-500 text-center">
              That&apos;s this week&apos;s {messageUsage?.limit} chats. {dog.name}&apos;s morning texts keep coming.{' '}
              <Link href="/premium" className="text-[#FF8C42] font-semibold">Unlimited with Premium</Link>
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
