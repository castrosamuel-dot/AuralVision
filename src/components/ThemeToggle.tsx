'use client';

import { useTheme } from 'next-themes';
import { Sun, Terminal } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Render a placeholder with the same dimensions to avoid layout shift
    return (
      <button
        className="p-2 rounded-full border border-transparent opacity-0"
        aria-hidden="true"
      >
        <Sun className="h-5 w-5" />
      </button>
    );
  }

  const isDark = theme === 'dark' || resolvedTheme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="p-2 rounded-full transition-all duration-300 hover:bg-gray-100 dark:hover:bg-green-900 border border-transparent dark:border-green-500"
      aria-label="Toggle Theme"
    >
      {isDark ? (
        <Terminal className="h-5 w-5 text-green-500" />
      ) : (
        <Sun className="h-5 w-5 text-yellow-500" />
      )}
    </button>
  );
}