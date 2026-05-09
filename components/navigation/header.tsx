
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback } from '../ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '../ui/navigation-menu';
import { Heart, Menu, User, Settings, LogOut, Crown, Sparkles, Sun, Moon } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';

export default function Header() {
  const { data: session, status } = useSession() || {};
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();

  const isAuthenticated = status === 'authenticated' && session?.user;
  const isDark = resolvedTheme === 'dark';

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/90 dark:bg-background/90 dark:border-border backdrop-blur-sm">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-[#FF8C42] rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-gray-100">DogText</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-gray-700">Learn</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-80 p-4">
                      <div className="grid gap-2">
                        <Link
                          href="/learn/breeds"
                          className="block px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
                        >
                          <div className="font-medium">Breed Library</div>
                          <div className="text-sm text-gray-600">Explore dog breeds</div>
                        </Link>
                        <Link
                          href="/learn/articles"
                          className="block px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
                        >
                          <div className="font-medium">Expert Articles</div>
                          <div className="text-sm text-gray-600">Training, health & nutrition</div>
                        </Link>
                        <Link
                          href="/learn/tools"
                          className="block px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
                        >
                          <div className="font-medium">Tools</div>
                          <div className="text-sm text-gray-600">Calculators & quizzes</div>
                        </Link>
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            <Link
              href="/shop"
              className="text-gray-700 dark:text-gray-300 hover:text-[#FF8C42] dark:hover:text-[#FF8C42] transition-colors font-medium"
            >
              Shop
            </Link>

            <Link
              href="/premium"
              className="text-gray-700 dark:text-gray-300 hover:text-[#FF8C42] dark:hover:text-[#FF8C42] transition-colors font-medium flex items-center space-x-1"
            >
              <Crown className="w-4 h-4" />
              <span>Premium</span>
            </Link>

            <Link
              href="/celebrations"
              className="text-gray-700 hover:text-amber-600 transition-colors font-medium flex items-center space-x-1"
            >
              <Sparkles className="w-4 h-4" />
              <span>Celebrations</span>
            </Link>

          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Button 
                  asChild 
                  className="hidden md:inline-flex bg-[#FF8C42] hover:bg-[#FF6B1A]"
                >
                  <Link href="/chat">Chat With My Dog</Link>
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button 
                      className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 px-2 relative"
                      aria-label="User account menu"
                      type="button"
                    >
                      <Avatar className="w-7 h-7">
                        <AvatarFallback className="text-xs bg-gray-100">
                          {session?.user?.name?.charAt(0) || session?.user?.email?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium">{session?.user?.name || 'User'}</p>
                      <p className="text-xs text-gray-500">{session?.user?.email}</p>
                      <p className="text-xs text-[#FF8C42] font-medium">
                        {session?.user?.subscriptionTier || 'FREE'} Plan
                      </p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/settings" className="flex items-center">
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    {session?.user?.subscriptionTier === 'FREE' && (
                      <DropdownMenuItem asChild>
                        <Link href="/premium" className="flex items-center text-[#FF8C42]">
                          <Crown className="w-4 h-4 mr-2" />
                          Upgrade to Premium
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setTheme(isDark ? 'light' : 'dark')}
                      className="flex items-center"
                    >
                      {isDark ? (
                        <>
                          <Sun className="w-4 h-4 mr-2" />
                          Light mode
                        </>
                      ) : (
                        <>
                          <Moon className="w-4 h-4 mr-2" />
                          Dark mode
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="flex items-center text-red-600 dark:text-red-400"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="hidden md:flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTheme(isDark ? 'light' : 'dark')}
                  aria-label="Toggle theme"
                >
                  {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </Button>
                <Button variant="ghost" asChild>
                  <Link href="/auth/login">Sign In</Link>
                </Button>
                <Button asChild className="bg-[#FF8C42] hover:bg-[#FF6B1A]">
                  <Link href="/auth/signup">Get Started</Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="sm">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col space-y-4 mt-8">
                  <Link
                    href="/learn/breeds"
                    className="text-lg font-medium text-gray-900 hover:text-[#FF8C42]"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Breed Library
                  </Link>
                  <Link
                    href="/learn/articles"
                    className="text-lg font-medium text-gray-900 hover:text-[#FF8C42]"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Expert Articles
                  </Link>
                  <Link
                    href="/learn/tools"
                    className="text-lg font-medium text-gray-900 hover:text-[#FF8C42]"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Tools
                  </Link>
                  <Link
                    href="/shop"
                    className="text-lg font-medium text-gray-900 hover:text-[#FF8C42]"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Shop
                  </Link>
                  <Link
                    href="/premium"
                    className="text-lg font-medium text-gray-900 hover:text-[#FF8C42] flex items-center space-x-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Crown className="w-5 h-5" />
                    <span>Premium</span>
                  </Link>
                  <Link
                    href="/celebrations"
                    className="text-lg font-medium text-gray-900 hover:text-amber-600 flex items-center space-x-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Sparkles className="w-5 h-5" />
                    <span>Celebrations</span>
                  </Link>
                  
                  <div className="border-t pt-4">
                    {isAuthenticated ? (
                      <>
                        <Button asChild className="w-full mb-3 bg-[#FF8C42] hover:bg-[#FF6B1A]">
                          <Link href="/chat" onClick={() => setMobileMenuOpen(false)}>
                            Chat With My Dog
                          </Link>
                        </Button>
                        <Link
                          href="/dashboard"
                          className="block text-lg font-medium text-gray-900 hover:text-[#FF8C42] mb-3"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Dashboard
                        </Link>
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setMobileMenuOpen(false);
                            signOut({ callbackUrl: '/' });
                          }}
                          className="w-full text-red-600 hover:text-red-700"
                        >
                          Sign Out
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button variant="ghost" asChild className="w-full mb-2">
                          <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                            Sign In
                          </Link>
                        </Button>
                        <Button asChild className="w-full bg-[#FF8C42] hover:bg-[#FF6B1A]">
                          <Link href="/auth/signup" onClick={() => setMobileMenuOpen(false)}>
                            Get Started
                          </Link>
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
