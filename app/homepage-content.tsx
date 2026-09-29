
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { BOOK_PRICE_USD } from '../lib/book';
import { DEMO_BREEDS, type DemoBreedSlug, parseKidNames, savePendingDog } from '../lib/dog-voice';
import ShareDemoText from '../components/demo/share-demo-text';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { 
  Heart, 
  MessageCircle, 
  BookOpen, 
  ShoppingBag, 
  Crown, 
  Star, 
  Clock, 
  Users, 
  CheckCircle,
  ArrowRight,
  Play,
  Calculator,
  Search,
  Zap,
  Target,
  Award,
  TrendingUp,
  Sparkles,
  Send
} from 'lucide-react';

import { Article, BreedProfile } from '../types/interfaces';

interface SampleBark {
  id: string;
  messageText: string;
  dog: { name: string; breed: string };
}

interface HomePageContentProps {
  featuredArticles: Article[];
  popularBreeds: BreedProfile[];
  recentArticles: Article[];
  sampleBarks: SampleBark[];
}

export default function HomePageContent({ featuredArticles, popularBreeds, recentArticles, sampleBarks }: HomePageContentProps) {
  const { data: session } = useSession();
  
  // AI Demo Form State
  // The kids the dog writes to, typed as 'Maya and Leo'.
  const [kidNames, setKidNames] = useState('');
  const [dogName, setDogName] = useState('');
  const [breed, setBreed] = useState('');
  const [selectedTraits, setSelectedTraits] = useState<string[]>([]);
  const [fromBreedPage, setFromBreedPage] = useState(false);

  // Arriving from a breed guide (/?breed=beagle#try): start the demo on that breed.
  useEffect(() => {
    const b = new URLSearchParams(window.location.search).get('breed');
    if (b && b in DEMO_BREEDS) {
      setBreed(b);
      setFromBreedPage(true);
    }
  }, []);
  const [generatedMessages, setGeneratedMessages] = useState<string[]>([]);
  const [signatures, setSignatures] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showMessages, setShowMessages] = useState(false);

  const traits = [
    'playful', 'calm', 'energetic', 'goofy', 'protective',
    'silly', 'loyal', 'smart', 'cuddly'
  ];

  const handleTraitClick = (trait: string) => {
    if (selectedTraits.includes(trait)) {
      setSelectedTraits(selectedTraits.filter(t => t !== trait));
    } else if (selectedTraits.length < 3) {
      setSelectedTraits([...selectedTraits, trait]);
    }
  };

  const handleGenerateMessages = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!parseKidNames(kidNames).length || !dogName || !breed || selectedTraits.length !== 3) {
      alert("Add your kids' first names, your dog's name and breed, and pick 3 traits.");
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch('/api/generate-dog-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kids: parseKidNames(kidNames),
          dogName,
          breed,
          traits: selectedTraits,
          fromBreedPage,
        })
      });

      const data = await response.json();
      
      if (data.messages) {
        setGeneratedMessages(data.messages);
        setSignatures(Array.isArray(data.signatures) ? data.signatures : []);
        setShowMessages(true);
      } else {
        alert(data.error || 'Sorry, there was an error generating messages. Please try again.');
      }
    } catch (error) {
      console.error('Error generating messages:', error);
      alert('Sorry, there was an error generating messages. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTryAgain = () => {
    setShowMessages(false);
    setGeneratedMessages([]);
    setKidNames('');
    setDogName('');
    setBreed('');
    setSelectedTraits([]);
  };


  return (
    <div className="min-h-screen bg-white dark:bg-background">

      {/* 1. REDESIGNED HERO SECTION */}
      <section className="relative gradient-warm overflow-hidden min-h-screen flex items-center">
        {/* Floating paw prints animation */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none hidden sm:block">
          <div className="absolute top-20 left-10 text-6xl animate-float-paw" style={{ animationDelay: '0s' }}>🐾</div>
          <div className="absolute top-40 right-20 text-5xl animate-float-paw" style={{ animationDelay: '1s' }}>🐾</div>
          <div className="absolute bottom-40 left-1/4 text-4xl animate-float-paw" style={{ animationDelay: '2s' }}>🐾</div>
        </div>

        <div className="container max-w-6xl mx-auto px-4 py-20 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
            {/* Left Column - 60% */}
            <motion.div
              className="lg:col-span-3"
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-sm font-bold text-white/80 tracking-wider mb-4">
                A DAILY LETTER FROM YOUR DOG, TO YOUR KIDS
              </p>
              <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Your dog writes to your kids. <span className="block">Every day.</span>
              </h1>
              <p className="text-xl text-white/95 mb-10 leading-relaxed max-w-xl">
                In your dog&apos;s voice, in words kids understand. Read it at breakfast or
                bedtime, and keep a year of them in a printed book (coming soon).
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-white text-[#FF8C42] hover:bg-white/90 text-lg px-8 py-6 rounded-full font-semibold shadow-xl hover:scale-105 transition-transform"
                  asChild
                >
                  <Link href={session ? '/dashboard' : '/auth/signup'}>
                    Get the first letter →
                  </Link>
                </Button>

                <a
                  href="#try"
                  className="text-white font-semibold text-lg hover:text-white/90 transition-colors flex items-center justify-center gap-2"
                >
                  Try it with your dog <ArrowRight className="w-5 h-5" />
                </a>
              </div>

              {/* Trust Signals */}
              <div className="flex flex-wrap items-center gap-3 mt-8 text-white/95 text-sm">
                <span className="flex items-center gap-1">✨ Free forever</span>
                <span>•</span>
                <span className="flex items-center gap-1">👧 First names only</span>
                <span>•</span>
                <span className="flex items-center gap-1">🔒 No data sold</span>
              </div>
            </motion.div>

            {/* Right Column - 40% — sample dog text */}
            <motion.div
              className="lg:col-span-2"
              initial={false}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-white/30 rounded-[2rem] blur-2xl"></div>
                <div className="relative bg-white rounded-[2rem] shadow-2xl p-6 sm:p-7">
                  {/* Contact header */}
                  <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF8C42] to-[#FFB380] flex items-center justify-center text-2xl shadow-md">
                      🐕
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-[#2C2C2C] flex items-center gap-2">
                        Coco
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      </div>
                      <div className="text-xs text-gray-500">to Maya · just now</div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="space-y-3 pt-5">
                    <div className="text-xs text-gray-400 text-center">Today&apos;s letter</div>
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8, duration: 0.4 }}
                      className="bg-gray-100 rounded-2xl rounded-tl-md px-4 py-3 max-w-[88%]"
                    >
                      <p className="text-[15px] text-[#2C2C2C] leading-relaxed">
                        Maya. I guarded your backpack all day. Nobody took it. You&apos;re welcome.
                      </p>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.4, duration: 0.4 }}
                      className="bg-gray-100 rounded-2xl rounded-tl-md px-4 py-3 max-w-[88%]"
                    >
                      <p className="text-[15px] text-[#2C2C2C] leading-relaxed">
                        Also, there was a crumb in it. I handled the crumb. See you after school 💛
                      </p>
                    </motion.div>
                  </div>

                  {/* Footer */}
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500 text-center">
                      ✨ A new letter from Coco every day
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

      </section>

      {/* 1.5 SAMPLE BARKS STRIP — social-proof / share surface */}
      {sampleBarks.length > 0 && (
        <section className="py-16 bg-white dark:bg-background border-b border-gray-100 dark:border-gray-800">
          <div className="container max-w-6xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-10"
            >
              <p className="text-sm font-bold text-[#FF8C42] tracking-wider mb-3">
                SAMPLE LETTERS
              </p>
              <h2 className="text-3xl lg:text-4xl font-bold text-[#2C2C2C] dark:text-gray-100 mb-3">
                What your dog might write to your kids
              </h2>
              <p className="text-base text-[#6B6B6B] dark:text-gray-400 max-w-2xl mx-auto">
                Written by our AI in each breed&apos;s voice, in words kids understand. Tap one to share it, or get letters from your own dog.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {sampleBarks.map((bark, i) => (
                <motion.div
                  key={bark.id}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    href={`/bark/${bark.id}`}
                    className="block bg-gradient-to-br from-[#FFF8F0] to-white dark:from-card dark:to-card rounded-2xl shadow-md hover:shadow-xl transition-all hover:-translate-y-1 p-5 border border-gray-100 dark:border-gray-800 h-full"
                  >
                    <div className="flex items-center gap-3 pb-3 border-b border-gray-100 dark:border-gray-800">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF8C42] to-[#FFB380] flex items-center justify-center text-xl shadow-sm shrink-0">
                        🐕
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-[#2C2C2C] dark:text-gray-100 truncate">
                          {bark.dog.name}
                        </div>
                        <div className="text-xs text-gray-500 truncate">{bark.dog.breed}</div>
                      </div>
                    </div>
                    <p className="text-[15px] text-[#2C2C2C] dark:text-gray-200 leading-relaxed whitespace-pre-line pt-4 line-clamp-6">
                      {bark.messageText}
                    </p>
                    <p className="text-xs text-[#FF8C42] font-semibold mt-4 flex items-center gap-1">
                      Tap to share <ArrowRight className="w-3 h-3" />
                    </p>
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="text-center mt-10">
              <Button
                size="lg"
                className="bg-[#FF8C42] hover:bg-[#FF6B1A] text-white px-8 py-6 rounded-full font-semibold shadow-md"
                asChild
              >
                <Link href={session ? '/dashboard' : '/auth/signup'}>
                  Get letters from your dog →
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* 2. INTERACTIVE AI DEMO SECTION */}
      <section id="try" className="py-20 bg-white dark:bg-background scroll-mt-16">
        <div className="container max-w-4xl mx-auto px-4">
          <motion.div
            initial={false}
            className="text-center mb-12"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-[#2C2C2C] dark:text-gray-100 mb-4">
              What Would Your Dog Write to Your Kids?
            </h2>
            <p className="text-xl text-[#6B6B6B] dark:text-gray-400">
              Your kids&apos; first names, your dog, and their personality. Three letters in seconds.
            </p>
          </motion.div>

          <motion.div
            initial={false}
            className="bg-white rounded-3xl shadow-2xl p-8 lg:p-12"
          >
            {!showMessages ? (
              <form onSubmit={handleGenerateMessages} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="kidNames" className="text-base font-semibold text-[#2C2C2C] dark:text-gray-100 mb-2">
                      Your Kids&apos; First Names
                    </Label>
                    <Input
                      id="kidNames"
                      value={kidNames}
                      onChange={(e) => setKidNames(e.target.value)}
                      placeholder="Maya and Leo"
                      maxLength={120}
                      className="text-base p-6 rounded-xl border-2 border-gray-200 focus:border-[#FF8C42]"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="dogName" className="text-base font-semibold text-[#2C2C2C] dark:text-gray-100 mb-2">
                      Your Dog's Name
                    </Label>
                    <Input
                      id="dogName"
                      value={dogName}
                      onChange={(e) => setDogName(e.target.value)}
                      placeholder="Max"
                      className="text-base p-6 rounded-xl border-2 border-gray-200 focus:border-[#FF8C42]"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="breed" className="text-base font-semibold text-[#2C2C2C] dark:text-gray-100 mb-2">
                    Breed
                  </Label>
                  <select
                    id="breed"
                    value={breed}
                    onChange={(e) => setBreed(e.target.value)}
                    className="w-full text-base p-4 rounded-xl border-2 border-gray-200 focus:border-[#FF8C42] focus:outline-none"
                  >
                    <option value="">Select a breed...</option>
                    {Object.entries(DEMO_BREEDS).map(([slug, name]) => (
                      <option key={slug} value={slug}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label className="text-base font-semibold text-[#2C2C2C] dark:text-gray-100 mb-3 block">
                    Pick 3 Personality Traits
                  </Label>
                  <div className="flex flex-wrap gap-3">
                    {traits.map((trait) => (
                      <button
                        key={trait}
                        type="button"
                        onClick={() => handleTraitClick(trait)}
                        disabled={!selectedTraits.includes(trait) && selectedTraits.length >= 3}
                        className={`
                          px-6 py-3 rounded-full border-2 font-medium capitalize transition-all
                          ${selectedTraits.includes(trait)
                            ? 'bg-[#FF8C42] text-white border-[#FF8C42] shadow-md'
                            : selectedTraits.length >= 3
                            ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                            : 'border-gray-200 text-gray-700 hover:border-[#FF8C42] hover:-translate-y-0.5'
                          }
                        `}
                      >
                        {trait}
                      </button>
                    ))}
                  </div>
                  <p className="text-sm text-[#6B6B6B] dark:text-gray-400 mt-3">
                    Selected: {selectedTraits.length}/3
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={isGenerating || selectedTraits.length !== 3}
                  className="w-full gradient-warm text-white text-lg py-7 rounded-full font-semibold hover:scale-105 transition-transform disabled:opacity-60"
                >
                  {isGenerating ? (
                    'Generating messages...'
                  ) : (
                    <>
                      Generate My Dog's Messages <Sparkles className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </form>
            ) : (
              <div className="animate-fade-in">
                {/* Messages Display */}
                <div className="mb-8 pb-8 border-b-2 border-gray-100 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FF8C42] to-[#FFB88C] flex items-center justify-center text-3xl">
                    🐕
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-[#2C2C2C] dark:text-gray-100">{dogName}</h3>
                    <p className="text-[#6B6B6B] dark:text-gray-400">{DEMO_BREEDS[breed as DemoBreedSlug] ?? breed}</p>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  {generatedMessages.map((message, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.3 }}
                      className="max-w-[88%]"
                    >
                      <div className="bg-gray-100 dark:bg-muted rounded-3xl rounded-tl-md px-5 py-4">
                        <p className="text-lg text-[#2C2C2C] dark:text-gray-100 leading-relaxed">{message}</p>
                      </div>
                      <ShareDemoText
                        dogName={dogName}
                        breed={breed}
                        message={message}
                        signature={signatures[index]}
                      />
                    </motion.div>
                  ))}
                </div>

                <div className="text-center pt-8 border-t-2 border-gray-100">
                  <p className="text-xl font-semibold text-[#2C2C2C] dark:text-gray-100 mb-2">
                    Want a letter from {dogName} every day?
                  </p>
                  <p className="text-[#6B6B6B] dark:text-gray-400 mb-6">
                    Free. We&apos;ll keep {dogName} and the kids&apos; names. You just add your email.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                      className="gradient-warm text-white px-8 py-6 text-lg rounded-full font-semibold hover:scale-105 transition-transform"
                      asChild
                    >
                      <Link
                        href="/auth/signup?from=demo"
                        onClick={() =>
                          savePendingDog({
                            ownerName: '',
                            kids: parseKidNames(kidNames),
                            dogName,
                            breed: DEMO_BREEDS[breed as DemoBreedSlug] ?? 'Other',
                            traits: selectedTraits,
                          })
                        }
                      >
                        Get {dogName}&apos;s letters 🐾
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleTryAgain}
                      className="border-2 border-[#FF8C42] text-[#FF8C42] px-8 py-6 text-lg rounded-full font-semibold hover:bg-[#FFF8F0]"
                    >
                      Try Another Dog
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* 3. "WHY WE EXIST" SECTION */}
      <section className="py-20 bg-[#FFF8F0] dark:bg-card">
        <div className="container max-w-5xl mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            {/* Story */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <p className="text-sm font-bold text-[#FF8C42] tracking-wider mb-4">
                OUR STORY
              </p>
              <h2 className="text-4xl font-bold text-[#2C2C2C] dark:text-gray-100 mb-6 leading-tight">
                We Started This For One Simple Reason
              </h2>
              <div className="space-y-4 text-lg text-[#3D3D3D] dark:text-gray-300 leading-relaxed">
                <p>
                  My daughter asked me, "Dad, did Coco text you?" When I said yes, 
                  her face lit up with the biggest smile. That moment - that pure joy - 
                  is why we built DogText.
                </p>
                <p>
                  We believe dogs deserve the best care possible, and owners deserve 
                  guidance without the overwhelm. So we started with the thing that made
                  her smile, a letter from Coco every day, and added plain-language
                  guides and tools for the rest.
                </p>
                <p className="font-semibold">
                  Because your dog isn't just a pet. They're family.
                </p>
                <p className="font-handwriting text-2xl text-[#6B6B6B] dark:text-gray-400 mt-6">
                  — Lamont<br/>
                  <span className="text-base">Founder & Dog Dad, Brooklyn</span>
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 4. SCENARIO CARDS (Replacing Three Pillars) */}
      <section className="py-20 bg-white dark:bg-background">
        <div className="container max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-[#2C2C2C] dark:text-gray-100 mb-4">
              How We Help You & Your Dog Thrive
            </h2>
            <p className="text-xl text-[#6B6B6B] dark:text-gray-400 max-w-3xl mx-auto">
              Real solutions for real dog owners - from first-time puppy parents to experienced handlers
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Card 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="group"
            >
              <Card className="overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 cursor-pointer">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src="/images/scenario1_nervous_owner.jpg"
                    alt="First-time dog owner with puppy"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-[#2C2C2C] dark:text-gray-100 mb-4">
                    When You're a First-Time Dog Parent
                  </h3>
                  <p className="text-[#3D3D3D] dark:text-gray-300 leading-relaxed mb-6">
                    We've been there. That's why we built step-by-step training guides —
                    from "how to housetrain" to "stop the biting" — written in plain
                    language by people who actually get it.
                  </p>
                  <Link 
                    href="/learn" 
                    className="text-[#FF8C42] font-semibold hover:text-[#FF6B1A] transition-colors inline-flex items-center gap-2"
                  >
                    Start Puppy Training 101 <ArrowRight className="w-5 h-5" />
                  </Link>
                </CardContent>
              </Card>
            </motion.div>

            {/* Card 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="group"
            >
              <Card className="overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 cursor-pointer">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src="/images/scenario2_reading_with_dog.jpg"
                    alt="Owner learning about their breed"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-[#2C2C2C] dark:text-gray-100 mb-4">
                    When You Want to Understand Your Breed
                  </h3>
                  <p className="text-[#3D3D3D] dark:text-gray-300 leading-relaxed mb-6">
                    Every breed is different. German Shepherds aren't Golden Retrievers. 
                    We break down exactly what makes your dog tick - health, temperament, 
                    quirks, and all.
                  </p>
                  <Link 
                    href="/learn/breeds" 
                    className="text-[#FF8C42] font-semibold hover:text-[#FF6B1A] transition-colors inline-flex items-center gap-2"
                  >
                    Find Your Breed Guide <ArrowRight className="w-5 h-5" />
                  </Link>
                </CardContent>
              </Card>
            </motion.div>

            {/* Card 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="group"
            >
              <Card className="overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 cursor-pointer">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src="/images/scenario3_owner_phone.jpg"
                    alt="Concerned owner checking health info"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-[#2C2C2C] dark:text-gray-100 mb-4">
                    When You Need Real Answers, Fast
                  </h3>
                  <p className="text-[#3D3D3D] dark:text-gray-300 leading-relaxed mb-6">
                    How much should they eat? How old is that in dog years? Our guides and
                    calculators give you a starting point at 2 AM or 2 PM, and we'll always
                    tell you when it's a question for your vet.
                  </p>
                  <Link 
                    href="/tools" 
                    className="text-[#FF8C42] font-semibold hover:text-[#FF6B1A] transition-colors inline-flex items-center gap-2"
                  >
                    Try Our Health Tools <ArrowRight className="w-5 h-5" />
                  </Link>
                </CardContent>
              </Card>
            </motion.div>

            {/* Card 4 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="group"
            >
              <Card className="overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 cursor-pointer">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src="/images/scenario4_happy_dog_toy.jpg"
                    alt="Happy dog with toy"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-[#2C2C2C] dark:text-gray-100 mb-4">
                    When You Want to Spoil Them Right
                  </h3>
                  <p className="text-[#3D3D3D] dark:text-gray-300 leading-relaxed mb-6">
                    The shop isn't open yet. When it is, it will only carry things we'd buy
                    for Coco. Get on the list to hear first.
                  </p>
                  <Link 
                    href="/shop" 
                    className="text-[#FF8C42] font-semibold hover:text-[#FF6B1A] transition-colors inline-flex items-center gap-2"
                  >
                    Get on the list <ArrowRight className="w-5 h-5" />
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 5. FOUNDING MEMBERS / WHY WE'RE DIFFERENT */}
      <section className="py-20 bg-[#FFF8F0] dark:bg-card">
        <div className="container max-w-5xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge className="bg-[#FF8C42] text-white mb-4">FOUNDING MEMBERS</Badge>
            <h2 className="text-4xl lg:text-5xl font-bold text-[#2C2C2C] dark:text-gray-100 mb-4">
              We're new — and we'd rather earn your trust than fake it
            </h2>
            <p className="text-xl text-[#6B6B6B] dark:text-gray-400 max-w-2xl mx-auto">
              Most pet platforms paste in stock-photo "5-star reviews" before they ship anything.
              We won't. Here's what we promise instead.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-white shadow-lg border-0">
              <CardContent className="p-8">
                <div className="text-3xl mb-3">🐾</div>
                <h3 className="text-xl font-bold text-[#2C2C2C] dark:text-gray-100 mb-2">Built by a dog dad</h3>
                <p className="text-[#3D3D3D] dark:text-gray-300 leading-relaxed">
                  Hi, I'm Lamont. Brooklyn-based, two kids, one Coco. Every feature here
                  started as something I actually wanted for my own dog.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg border-0">
              <CardContent className="p-8">
                <div className="text-3xl mb-3">🔒</div>
                <h3 className="text-xl font-bold text-[#2C2C2C] dark:text-gray-100 mb-2">Your data stays yours</h3>
                <p className="text-[#3D3D3D] dark:text-gray-300 leading-relaxed">
                  No selling your email. No surprise upsells. When paid plans open,
                  canceling will be one click, with no "are you sure?" maze.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg border-0">
              <CardContent className="p-8">
                <div className="text-3xl mb-3">✨</div>
                <h3 className="text-xl font-bold text-[#2C2C2C] dark:text-gray-100 mb-2">Free, for good</h3>
                <p className="text-[#3D3D3D] dark:text-gray-300 leading-relaxed">
                  The daily letters, the chats and the guides are free. The only thing we
                  sell is the printed book, and only if you want one.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 6. POPULAR BREEDS SECTION (Keep existing but update styling) */}
      <section className="py-20 bg-white dark:bg-background">
        <div className="container max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-[#2C2C2C] dark:text-gray-100 mb-4">
              Popular Breed Guides
            </h2>
            <p className="text-xl text-[#6B6B6B] dark:text-gray-400">
              What makes each breed tick
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {popularBreeds.slice(0, 6).map((breed) => (
              <Link key={breed.id} href={`/learn/breeds/${breed.slug}`}>
                <Card className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 cursor-pointer">
                  <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                    {breed.imageUrl && (
                      <Image
                        src={breed.imageUrl}
                        alt={breed.breedName}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    )}
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-[#2C2C2C] dark:text-gray-100 mb-2 group-hover:text-[#FF8C42] transition-colors">
                      {breed.breedName}
                    </h3>
                    <p className="text-[#6B6B6B] dark:text-gray-400 text-sm line-clamp-2">
                      {breed.temperament}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-[#FF8C42] text-[#FF8C42] hover:bg-[#FFF8F0] px-8 py-6 rounded-full font-semibold"
              asChild
            >
              <Link href="/learn/breeds">
                View All Breeds <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 7. LATEST ARTICLES (Keep but update styling) */}
      <section className="py-20 bg-[#FFF8F0] dark:bg-card">
        <div className="container max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-[#2C2C2C] dark:text-gray-100 mb-4">
              Dog Care Guides
            </h2>
            <p className="text-xl text-[#6B6B6B] dark:text-gray-400">
              Plain-language guides. For anything medical, your vet comes first.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {recentArticles.slice(0, 3).map((article) => (
              <Link key={article.id} href={`/learn/articles/${article.slug}`}>
                  <Card className="group bg-white border-0 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 cursor-pointer h-full">
                    <CardContent className="p-6">
                      <Badge className="bg-[#FF8C42] text-white mb-4">
                        {article.category}
                      </Badge>
                      <h3 className="text-xl font-bold text-[#2C2C2C] dark:text-gray-100 mb-3 group-hover:text-[#FF8C42] transition-colors">
                        {article.title}
                      </h3>
                      <p className="text-[#6B6B6B] dark:text-gray-400 mb-4 line-clamp-3">
                        {article.excerpt}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-[#6B6B6B] dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {article.readTime} min
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-[#FF8C42] text-[#FF8C42] hover:bg-white px-8 py-6 rounded-full font-semibold"
              asChild
            >
              <Link href="/learn/articles">
                Read All Articles <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 8. THE BOOK: the one thing we sell */}
      <section className="py-20 bg-white dark:bg-background">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="grid gap-10 md:grid-cols-2 items-center">
            <div className="mx-auto w-full max-w-xs aspect-[3/4] rounded-r-2xl rounded-l-md shadow-2xl bg-gradient-to-br from-[#FF8C42] to-[#FFB6C1] p-8 flex flex-col items-center justify-center text-center text-white">
              <div className="w-24 h-24 rounded-full bg-white/25 border-4 border-white flex items-center justify-center text-4xl font-bold mb-5">
                C
              </div>
              <p className="font-serif text-2xl font-bold leading-tight">Coco&apos;s Letters to Maya and Leo</p>
              <p className="mt-2 text-sm text-white/90">Letters from the family dog</p>
            </div>
            <div>
              <p className="text-sm font-bold tracking-wider text-[#FF8C42] mb-3">THE BOOK</p>
              <h2 className="text-3xl lg:text-4xl font-bold text-[#2C2C2C] dark:text-gray-100 mb-4">
                The letters are free. Keep them in a real book.
              </h2>
              <p className="text-lg text-[#6B6B6B] dark:text-gray-400 mb-6">
                A month of your dog&apos;s letters, printed as a softcover book: your dog&apos;s photo on the
                cover, one letter per page, mailed to your door. ${BOOK_PRICE_USD} plus shipping, once there&apos;s a month of letters.
              </p>
              <Button asChild className="bg-[#FF8C42] hover:bg-[#FF6B1A] text-white rounded-full px-8 py-6 text-base font-semibold">
                <Link href="/book">See the book</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 9. REDESIGNED FOOTER CTA */}
      <section className="gradient-warm py-20 text-white text-center">
        <div className="container max-w-3xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
              Your dog's been waiting for this conversation.
            </h2>
            <p className="text-xl mb-10 opacity-95">
              Create your free account and get your first message in 60 seconds.
            </p>
            
            <Button
              size="lg"
              className="bg-white text-[#FF8C42] hover:bg-white/90 hover:scale-110 transition-all text-xl px-12 py-8 rounded-full font-bold shadow-2xl mb-8"
              asChild
            >
              <Link href="/auth/signup">
                Start My Free Account 🐾
              </Link>
            </Button>

            <div className="flex flex-wrap items-center justify-center gap-2 text-sm mb-4 opacity-90">
              <span>🔒 Your data is private</span>
              <span>•</span>
              <span>📖 A printed book when you want one</span>
              <span>•</span>
              <span>🐾 A new letter every day</span>
            </div>

            <p className="text-sm opacity-85">
              No credit card required • Free forever
            </p>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
