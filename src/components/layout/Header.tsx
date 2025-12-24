import Link from 'next/link';
import { Menu } from 'lucide-react';
import ThemeToggle from '../ThemeToggle';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-black border-b border-gray-200 dark:border-green-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-2xl font-medium tracking-tight text-gray-900 dark:text-green-500">
              Aural<span className="text-blue-600 dark:text-green-300">Vision</span>
            </Link>
          </div>
          <div className="hidden sm:flex sm:space-x-8 items-center">
            <Link href="/category/event-av" className="text-gray-500 dark:text-green-700 hover:text-gray-900 dark:hover:text-green-400 px-3 py-2 text-sm font-medium">
              Event AV
            </Link>
            <Link href="/category/technology" className="text-gray-500 dark:text-green-700 hover:text-gray-900 dark:hover:text-green-400 px-3 py-2 text-sm font-medium">
              Technology
            </Link>
            <Link href="/category/reviews" className="text-gray-500 dark:text-green-700 hover:text-gray-900 dark:hover:text-green-400 px-3 py-2 text-sm font-medium">
              Reviews
            </Link>
            <Link href="/category/how-to" className="text-gray-500 dark:text-green-700 hover:text-gray-900 dark:hover:text-green-400 px-3 py-2 text-sm font-medium">
              How-To
            </Link>
            <ThemeToggle />
          </div>
          <div className="sm:hidden flex items-center space-x-4">
            <ThemeToggle />
            <button className="text-gray-500 dark:text-green-500 hover:text-gray-900">
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
