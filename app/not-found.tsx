import Link from 'next/link';
import { LostDogIllustration } from '../components/illustrations/empty-state';

export const metadata = {
  title: 'Page not found | DogText',
};

export default function NotFound() {
  return (
    <div className="container max-w-2xl mx-auto px-4 py-20 text-center">
      <LostDogIllustration size={240} className="mx-auto mb-6" />
      <p className="text-sm font-bold text-[#FF8C42] tracking-wider mb-3">404</p>
      <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
        We can't find this page
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
        The link might be broken or the page might have moved. Let's get you somewhere
        useful.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/"
          className="bg-[#FF8C42] hover:bg-[#FF6B1A] text-white font-semibold px-6 py-3 rounded-full transition-colors"
        >
          Back to home
        </Link>
        <Link
          href="/learn"
          className="border-2 border-gray-300 dark:border-gray-700 hover:border-[#FF8C42] text-gray-700 dark:text-gray-300 hover:text-[#FF8C42] font-semibold px-6 py-3 rounded-full transition-colors"
        >
          Browse Learn
        </Link>
      </div>
    </div>
  );
}
