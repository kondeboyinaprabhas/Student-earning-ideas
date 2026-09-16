// ThemeToggle.jsx - Sun/Moon Dark & Light Theme Switcher
'use client';

import { useState, useEffect, useSyncExternalStore } from 'react';
import { Sun, Moon } from 'lucide-react';
import { getInitialTheme, saveThemePreference } from '@/lib/theme';

const emptySubscribe = () => () => {};

export default function ThemeToggle({ className = "" }) {
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [theme, setTheme] = useState(() => getInitialTheme());

  useEffect(() => {
    // Listen to system theme changes if user hasn't explicitly set preference
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = (e) => {
      const saved = localStorage.getItem('sei_theme_preference_v1');
      if (!saved) {
        const nextTheme = e.matches ? 'dark' : 'light';
        setTheme(nextTheme);
        saveThemePreference(nextTheme);
      }
    };
    media.addEventListener('change', handleSystemChange);
    return () => media.removeEventListener('change', handleSystemChange);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    saveThemePreference(nextTheme);
  };

  if (!mounted) {
    return <div className="w-9 h-9" />;
  }

  return (
    <button
      onClick={toggleTheme}
      className={`flex items-center justify-center w-9 h-9 rounded-full text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all ${className}`}
      aria-label={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
      title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
    >
      {theme === 'dark' ? (
        <Sun className="w-4 h-4 text-amber-400 transition-transform duration-300 rotate-0 hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 text-slate-700 transition-transform duration-300 rotate-0 hover:-rotate-12" />
      )}
    </button>
  );
}
