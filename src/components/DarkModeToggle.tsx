"use client";

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export function DarkModeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const theme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (theme === 'dark' || (!theme && prefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);

    if (newIsDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <button
      onClick={toggleDarkMode}
      className="fixed bottom-32 md:bottom-20 right-6 z-50 p-3 rounded-full bg-secondary border-2 border-border hover:border-primary/50 shadow-lg hover:shadow-xl transition-all duration-300 group"
      aria-label="Toggle dark mode"
    >
      <div className="relative w-5 h-5">
        <Sun className={`absolute inset-0 w-5 h-5 text-yellow-500 transition-all duration-500 ${
          isDark ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
        }`} />
        <Moon className={`absolute inset-0 w-5 h-5 text-blue-500 transition-all duration-500 ${
          isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'
        }`} />
      </div>
    </button>
  );
}
