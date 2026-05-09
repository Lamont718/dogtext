import Link from 'next/link';
import Image from 'next/image';
import { Heart, CheckCircle, Sparkles, Lock, MessageCircle } from 'lucide-react';

interface AuthShellProps {
  side: 'signup' | 'login';
  children: React.ReactNode;
}

const SIGNUP_BULLETS = [
  { icon: MessageCircle, text: '5 AI conversations per week, free forever' },
  { icon: Sparkles, text: 'A daily message from your dog every morning' },
  { icon: CheckCircle, text: 'Real breed guides + working calculators' },
  { icon: Lock, text: "Your data stays yours — chats never train the AI" },
];

const LOGIN_BULLETS = [
  { icon: Sparkles, text: 'Pick up where you left off' },
  { icon: MessageCircle, text: "Today's bark is waiting" },
];

export default function AuthShell({ side, children }: AuthShellProps) {
  const bullets = side === 'signup' ? SIGNUP_BULLETS : LOGIN_BULLETS;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF8F0] to-white dark:from-gray-950 dark:to-gray-950">
      <div className="container max-w-6xl mx-auto px-4 py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Right panel on desktop, hidden on mobile if login (less to say) */}
          <div className={`order-1 lg:order-2 ${side === 'login' ? 'hidden lg:block' : ''}`}>
            <div className="relative rounded-3xl overflow-hidden shadow-2xl gradient-warm p-10 lg:p-12 text-white">
              <div className="absolute top-6 right-6 text-5xl opacity-30 select-none">🐾</div>
              <div className="relative">
                <Link href="/" className="flex items-center gap-2 mb-8">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                    <Heart className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold">DogText</span>
                </Link>

                <h2 className="text-3xl lg:text-4xl font-bold leading-tight mb-4">
                  {side === 'signup'
                    ? "Your dog's been waiting for this conversation."
                    : 'Welcome back.'}
                </h2>
                <p className="text-lg text-white/90 mb-8">
                  {side === 'signup'
                    ? "Sign up free in 60 seconds. No credit card. No tricks."
                    : "Sign in to read what your dog texted you today."}
                </p>

                <ul className="space-y-3 mb-10">
                  {bullets.map((b) => {
                    const Icon = b.icon;
                    return (
                      <li key={b.text} className="flex items-start gap-3">
                        <Icon className="w-5 h-5 mt-0.5 shrink-0 text-white/95" />
                        <span className="text-white/95">{b.text}</span>
                      </li>
                    );
                  })}
                </ul>

                {side === 'signup' && (
                  <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-5 border border-white/20">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="relative w-12 h-12 rounded-full overflow-hidden ring-2 ring-white/30 shrink-0 bg-white/10">
                        <Image
                          src="/images/founder_with_coco.jpg"
                          alt="Lamont with Coco"
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">A note from Lamont</p>
                        <p className="text-xs text-white/70">Founder & Dog Dad, Brooklyn</p>
                      </div>
                    </div>
                    <p className="text-sm text-white/90 leading-relaxed font-handwriting text-lg">
                      "Founding members lock today's pricing for life and get every feature
                      we ship. We'd rather earn your trust than fake it."
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Form panel */}
          <div className="order-2 lg:order-1">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
