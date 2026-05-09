import Link from 'next/link';
import { Heart } from 'lucide-react';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-gray-50 dark:bg-background dark:border-border border-t">
      <div className="container max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-[#FF8C42] rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-gray-100">DogText</span>
            </Link>
            <p className="text-gray-600 max-w-md">
              AI-powered conversations with your dog, plain-language guidance for their
              breed, and tools you'll actually use. Built by a dog dad in Brooklyn.
            </p>
            <p className="text-xs text-gray-500 mt-4 max-w-md">
              We don't sell your data. Chats stay private and never train the AI.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Learn</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/learn/breeds" className="text-gray-600 dark:text-gray-400 hover:text-[#FF8C42] dark:hover:text-[#FF8C42] transition-colors">
                  Breed Library
                </Link>
              </li>
              <li>
                <Link href="/learn/articles" className="text-gray-600 dark:text-gray-400 hover:text-[#FF8C42] dark:hover:text-[#FF8C42] transition-colors">
                  Expert Articles
                </Link>
              </li>
              <li>
                <Link href="/tools" className="text-gray-600 dark:text-gray-400 hover:text-[#FF8C42] dark:hover:text-[#FF8C42] transition-colors">
                  Calculators
                </Link>
              </li>
              <li>
                <Link href="/celebrations" className="text-gray-600 dark:text-gray-400 hover:text-[#FF8C42] dark:hover:text-[#FF8C42] transition-colors">
                  Celebrations
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/premium" className="text-gray-600 dark:text-gray-400 hover:text-[#FF8C42] dark:hover:text-[#FF8C42] transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-600 dark:text-gray-400 hover:text-[#FF8C42] dark:hover:text-[#FF8C42] transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-600 dark:text-gray-400 hover:text-[#FF8C42] dark:hover:text-[#FF8C42] transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center">
          <p className="text-gray-500 text-sm">
            © {year} DogText. Built with love for dogs and the people who love them.
          </p>
        </div>
      </div>
    </footer>
  );
}
