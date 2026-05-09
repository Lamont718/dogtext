
'use client';

import { useEffect, useState } from 'react';
import { Session } from 'next-auth';
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

interface HomePageContentProps {
  session: Session | null;
  featuredArticles: Article[];
  popularBreeds: BreedProfile[];
  recentArticles: Article[];
}

export default function HomePageContent({ session, featuredArticles, popularBreeds, recentArticles }: HomePageContentProps) {
  const [email, setEmail] = useState('');
  const [showVideo, setShowVideo] = useState(false);
  
  // AI Demo Form State
  const [ownerName, setOwnerName] = useState('');
  const [dogName, setDogName] = useState('');
  const [breed, setBreed] = useState('');
  const [selectedTraits, setSelectedTraits] = useState<string[]>([]);
  const [generatedMessages, setGeneratedMessages] = useState<string[]>([]);
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
    
    if (!ownerName || !dogName || !breed || selectedTraits.length !== 3) {
      alert('Please fill all fields and select exactly 3 personality traits');
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch('/api/generate-dog-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownerName,
          dogName,
          breed,
          traits: selectedTraits
        })
      });

      const data = await response.json();
      
      if (data.messages) {
        setGeneratedMessages(data.messages);
        setShowMessages(true);
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
    setOwnerName('');
    setDogName('');
    setBreed('');
    setSelectedTraits([]);
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    alert('Thank you for signing up! We\'ll be in touch soon.');
    setEmail('');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-background">

      {/* 1. REDESIGNED HERO SECTION */}
      <section className="relative gradient-warm overflow-hidden min-h-screen flex items-center">
        {/* Floating paw prints animation */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 text-6xl animate-float-paw" style={{ animationDelay: '0s' }}>🐾</div>
          <div className="absolute top-40 right-20 text-5xl animate-float-paw" style={{ animationDelay: '1s' }}>🐾</div>
          <div className="absolute bottom-40 left-1/4 text-4xl animate-float-paw" style={{ animationDelay: '2s' }}>🐾</div>
        </div>

        <div className="container max-w-6xl mx-auto px-4 py-20 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
            {/* Left Column - 60% */}
            <motion.div
              className="lg:col-span-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                What if your dog could tell you how much they love you?
              </h1>
              <p className="text-xl text-white/95 mb-10 leading-relaxed max-w-xl">
                We use AI to give voice to your dog's personality - creating messages 
                that feel like they're really from your furry best friend. Plus everything 
                you need to give them the best life possible.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="bg-white text-[#FF8C42] hover:bg-white/90 text-lg px-8 py-6 rounded-full font-semibold shadow-xl hover:scale-105 transition-transform"
                  asChild
                >
                  <Link href={session ? "/chat" : "/auth/signup"}>
                    Meet My Dog 🐾
                  </Link>
                </Button>
                
                <button 
                  onClick={() => setShowVideo(true)}
                  className="text-white font-semibold text-lg hover:text-white/90 transition-colors flex items-center justify-center gap-2"
                >
                  See how it works <Play className="w-5 h-5" />
                </button>
              </div>
              
              {/* Trust Signals */}
              <div className="flex flex-wrap items-center gap-3 mt-8 text-white/95 text-sm">
                <span className="flex items-center gap-1">🔒 Your data is private</span>
                <span>•</span>
                <span className="flex items-center gap-1">✨ Free to start</span>
                <span>•</span>
                <span className="flex items-center gap-1">🐾 Founder-led, in beta</span>
              </div>
            </motion.div>

            {/* Right Column - 40% */}
            <motion.div
              className="lg:col-span-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-white/20 rounded-3xl blur-2xl"></div>
                <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl">
                  <Image
                    src="/images/hero_child_golden_retriever.jpg"
                    alt="Child hugging golden retriever"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Video Modal */}
        {showVideo && (
          <div 
            className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4"
            onClick={() => setShowVideo(false)}
          >
            <div className="relative max-w-4xl w-full bg-white rounded-2xl p-4" onClick={e => e.stopPropagation()}>
              <button 
                onClick={() => setShowVideo(false)}
                className="absolute -top-12 right-0 text-white text-4xl hover:text-gray-300"
              >
                ×
              </button>
              <div className="aspect-video bg-gray-200 rounded-xl flex items-center justify-center">
                <p className="text-gray-600">Video placeholder - Demo video would play here</p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 2. INTERACTIVE AI DEMO SECTION */}
      <section className="py-20 bg-white dark:bg-background">
        <div className="container max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-[#2C2C2C] dark:text-gray-100 mb-4">
              Want to See What Your Dog Might Say?
            </h2>
            <p className="text-xl text-[#6B6B6B] dark:text-gray-400">
              Tell us about your dog and we'll show you the magic ✨
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl shadow-2xl p-8 lg:p-12"
          >
            {!showMessages ? (
              <form onSubmit={handleGenerateMessages} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="ownerName" className="text-base font-semibold text-[#2C2C2C] dark:text-gray-100 mb-2">
                      Your Name
                    </Label>
                    <Input
                      id="ownerName"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      placeholder="Sarah"
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
                    <option value="golden-retriever">Golden Retriever</option>
                    <option value="labrador">Labrador Retriever</option>
                    <option value="german-shepherd">German Shepherd</option>
                    <option value="french-bulldog">French Bulldog</option>
                    <option value="beagle">Beagle</option>
                    <option value="poodle">Poodle</option>
                    <option value="bulldog">Bulldog</option>
                    <option value="rottweiler">Rottweiler</option>
                    <option value="yorkshire-terrier">Yorkshire Terrier</option>
                    <option value="boxer">Boxer</option>
                    <option value="dachshund">Dachshund</option>
                    <option value="husky">Siberian Husky</option>
                    <option value="corgi">Corgi</option>
                    <option value="chihuahua">Chihuahua</option>
                    <option value="mixed">Mixed Breed</option>
                    <option value="other">Other</option>
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
                    <p className="text-[#6B6B6B] dark:text-gray-400 capitalize">{breed.replace('-', ' ')}</p>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  {generatedMessages.map((message, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.3 }}
                      className="bg-gradient-to-br from-[#FFB88C] to-[#FFB6C1] text-white p-6 rounded-3xl rounded-tl-sm shadow-lg max-w-[85%]"
                    >
                      <p className="text-lg font-handwriting leading-relaxed">{message}</p>
                    </motion.div>
                  ))}
                </div>

                <div className="text-center pt-8 border-t-2 border-gray-100">
                  <p className="text-xl font-semibold text-[#2C2C2C] dark:text-gray-100 mb-6">
                    Want messages like this every day?
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                      className="gradient-warm text-white px-8 py-6 text-lg rounded-full font-semibold hover:scale-105 transition-transform"
                      asChild
                    >
                      <Link href="/auth/signup">
                        Create Free Account 🐾
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
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
            {/* Left - Image */}
            <motion.div
              className="lg:col-span-2"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-xl">
                <Image
                  src="/images/founder_with_coco.jpg"
                  alt="Founder's daughter with Coco"
                  fill
                  className="object-cover"
                />
              </div>
            </motion.div>

            {/* Right - Story */}
            <motion.div
              className="lg:col-span-3"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
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
                  expert guidance without the overwhelm. So we created one place with 
                  everything: AI that captures your dog's personality, training that 
                  actually works, health info you can trust, and products worth buying.
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
                    Is that limp serious? How much should they eat? Our vet-approved 
                    resources and smart tools give you answers when you need them - 
                    at 2 AM or 2 PM.
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
                    Not all dog products are created equal. We only recommend what 
                    actually works - tested by experts, loved by dogs.
                  </p>
                  <Link 
                    href="/shop" 
                    className="text-[#FF8C42] font-semibold hover:text-[#FF6B1A] transition-colors inline-flex items-center gap-2"
                  >
                    Shop Smart Picks <ArrowRight className="w-5 h-5" />
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
                  No selling your email. No surprise upsells. Cancel any subscription with
                  one click — no "are you sure?" maze.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg border-0">
              <CardContent className="p-8">
                <div className="text-3xl mb-3">✨</div>
                <h3 className="text-xl font-bold text-[#2C2C2C] dark:text-gray-100 mb-2">Founder pricing, locked</h3>
                <p className="text-[#3D3D3D] dark:text-gray-300 leading-relaxed">
                  Sign up while we're in beta and you keep your launch rate forever, even
                  when prices go up later.
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
              Expert insights into the breeds you love
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
              Expert Advice & Guides
            </h2>
            <p className="text-xl text-[#6B6B6B] dark:text-gray-400">
              Vet-approved content you can trust
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

      {/* 8. REDESIGNED PRICING SECTION */}
      <section className="py-20 bg-white dark:bg-background">
        <div className="container max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-[#2C2C2C] dark:text-gray-100 mb-4">
              Choose Your Experience
            </h2>
            <p className="text-xl text-[#6B6B6B] dark:text-gray-400">
              Start free. Upgrade when you're ready. Cancel anytime.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {/* Free Tier */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card className="border-2 border-gray-200 shadow-lg hover:shadow-xl transition-all relative">
                <CardContent className="p-8 text-center">
                  <Badge className="bg-gray-200 text-[#2C2C2C] dark:text-gray-100 mb-4">
                    FREE
                  </Badge>
                  <h3 className="text-2xl font-bold text-[#2C2C2C] dark:text-gray-100 mb-2">
                    Just Starting Out?
                  </h3>
                  <p className="text-[#6B6B6B] dark:text-gray-400 mb-6 min-h-[60px]">
                    Try us free. Chat with your dog 5 times a week, access basic training, explore breed guides.
                  </p>
                  <div className="mb-4">
                    <span className="text-5xl font-bold text-[#2C2C2C] dark:text-gray-100">$0</span>
                    <span className="text-lg text-[#6B6B6B] dark:text-gray-400">/month</span>
                  </div>
                  <p className="text-sm text-[#FF8C42] font-semibold italic mb-6">
                    For: First-time visitors, casual browsers
                  </p>
                  <ul className="text-left space-y-3 mb-8">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-[#3D3D3D] dark:text-gray-300">5 AI conversations per week</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-[#3D3D3D] dark:text-gray-300">1 dog profile</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-[#3D3D3D] dark:text-gray-300">Browse the breed library</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-[#3D3D3D] dark:text-gray-300">Read every expert article</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-[#3D3D3D] dark:text-gray-300">Age + food calculators</span>
                    </li>
                  </ul>
                  <Button
                    className="w-full bg-gray-200 hover:bg-gray-300 text-[#2C2C2C] dark:text-gray-100 py-6 rounded-full font-semibold"
                    asChild
                  >
                    <Link href="/auth/signup">Start Free</Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Premium Tier - Featured */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="relative"
            >
              <div className="absolute -inset-1 gradient-warm rounded-3xl blur opacity-25"></div>
              <Card className="border-4 border-[#FF8C42] shadow-2xl relative bg-white transform md:scale-105">
                <CardContent className="p-8 text-center">
                  <Badge className="gradient-warm text-white mb-4">
                    ⭐ MOST POPULAR
                  </Badge>
                  <h3 className="text-2xl font-bold text-[#2C2C2C] dark:text-gray-100 mb-2">
                    Serious Dog Parents
                  </h3>
                  <p className="text-[#6B6B6B] dark:text-gray-400 mb-6 min-h-[60px]">
                    Unlimited AI chats, every training video, all health tools, zero ads. Your dog deserves premium.
                  </p>
                  <div className="mb-4">
                    <span className="text-5xl font-bold text-[#2C2C2C] dark:text-gray-100">$7.99</span>
                    <span className="text-lg text-[#6B6B6B] dark:text-gray-400">/month</span>
                  </div>
                  <p className="text-sm text-[#FF8C42] font-semibold italic mb-6">
                    For: Dedicated owners who want the best
                  </p>
                  <ul className="text-left space-y-3 mb-8">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-[#FF8C42] flex-shrink-0 mt-0.5" />
                      <span className="text-[#3D3D3D] dark:text-gray-300"><strong>Unlimited AI conversations</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-[#FF8C42] flex-shrink-0 mt-0.5" />
                      <span className="text-[#3D3D3D] dark:text-gray-300"><strong>Up to 3 dog profiles</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-[#FF8C42] flex-shrink-0 mt-0.5" />
                      <span className="text-[#3D3D3D] dark:text-gray-300"><strong>Everything in Free</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-[#FF8C42] flex-shrink-0 mt-0.5" />
                      <span className="text-[#3D3D3D] dark:text-gray-300"><strong>Priority support over email</strong></span>
                    </li>
                  </ul>
                  <Button
                    className="w-full gradient-warm text-white py-6 rounded-full font-semibold hover:scale-105 transition-transform"
                    asChild
                  >
                    <Link href="/premium">See pricing details</Link>
                  </Button>
                  <p className="text-xs text-[#6B6B6B] dark:text-gray-400 mt-3">
                    Founder pricing locked while we're in beta.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Family Tier */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-2 border-gray-200 shadow-lg hover:shadow-xl transition-all">
                <CardContent className="p-8 text-center">
                  <Badge className="bg-[#FFB88C] text-white mb-4">
                    FAMILY PACK
                  </Badge>
                  <h3 className="text-2xl font-bold text-[#2C2C2C] dark:text-gray-100 mb-2">
                    Multi-Dog Households
                  </h3>
                  <p className="text-[#6B6B6B] dark:text-gray-400 mb-6 min-h-[60px]">
                    Everything in Premium, but for up to 5 dogs. One subscription, whole pack.
                  </p>
                  <div className="mb-4">
                    <span className="text-5xl font-bold text-[#2C2C2C] dark:text-gray-100">$14.99</span>
                    <span className="text-lg text-[#6B6B6B] dark:text-gray-400">/month</span>
                  </div>
                  <p className="text-sm text-[#FF8C42] font-semibold italic mb-6">
                    For: Families with multiple fur babies
                  </p>
                  <ul className="text-left space-y-3 mb-8">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-[#FF8C42] flex-shrink-0 mt-0.5" />
                      <span className="text-[#3D3D3D] dark:text-gray-300"><strong>Everything in Premium</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-[#FF8C42] flex-shrink-0 mt-0.5" />
                      <span className="text-[#3D3D3D] dark:text-gray-300"><strong>Up to 5 dog profiles</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-[#FF8C42] flex-shrink-0 mt-0.5" />
                      <span className="text-[#3D3D3D] dark:text-gray-300"><strong>One bill for the whole pack</strong></span>
                    </li>
                  </ul>
                  <Button
                    variant="outline"
                    className="w-full border-2 border-[#FF8C42] text-[#FF8C42] hover:bg-[#FFF8F0] py-6 rounded-full font-semibold"
                    asChild
                  >
                    <Link href="/premium">Cover My Pack</Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Founder note */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto text-center"
          >
            <Card className="bg-[#FFF8F0] border-0 shadow-md">
              <CardContent className="p-6">
                <p className="text-lg text-[#3D3D3D] dark:text-gray-300 italic mb-3">
                  "Founding members get every feature we build, at the price you signed up
                  with — for as long as you stay."
                </p>
                <p className="text-sm text-[#6B6B6B] dark:text-gray-400">— Lamont, founder</p>
              </CardContent>
            </Card>
          </motion.div>
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
              <span>✨ Founder pricing locked while in beta</span>
              <span>•</span>
              <span>🐾 Cancel in one click</span>
            </div>

            <p className="text-sm opacity-85">
              No credit card required • 7-day premium trial • Cancel anytime
            </p>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
