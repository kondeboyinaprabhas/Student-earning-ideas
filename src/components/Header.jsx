// Header.jsx - Premium Glass-Style Navigation Bar with Dark/Light Theme & Clean Public Actions
'use client';

import Link from 'next/link';
import StudentLogo from './StudentLogo';
import ThemeToggle from './ThemeToggle';
import { Search, Bookmark, Mail } from 'lucide-react';

export default function Header({ savedCount = 0, onOpenSearch, activeView = 'home' }) {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Brand Logo & Tagline */}
        <Link href="/" className="flex items-center gap-2 group" aria-label="Student Earning Ideas homepage">
          <StudentLogo size="sm" showTagline={false} />
          <div className="hidden sm:flex flex-col border-l border-slate-200 dark:border-slate-800 pl-2 ml-0.5">
            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400">
              100+ Ways to Earn
            </span>
          </div>
        </Link>

        {/* Right Actions: Theme Toggle, Search, Saved List (Zero public Admin link) */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Dark / Light Theme Switcher */}
          <ThemeToggle />

          {/* Search Trigger */}
          <button
            onClick={onOpenSearch}
            className="flex items-center justify-center w-9 h-9 rounded-full text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all"
            aria-label="Search student earning ideas"
            title="Search ideas"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Saved List Trigger */}
          <Link
            href="/saved"
            className={`relative flex items-center justify-center w-9 h-9 rounded-full transition-all ${
              activeView === 'saved'
                ? 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60'
                : 'text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95'
            }`}
            aria-label={`Saved ideas (${savedCount})`}
            title="Saved Ideas"
          >
            <Bookmark className={`w-5 h-5 ${savedCount > 0 && activeView !== 'saved' ? 'fill-teal-600 dark:fill-teal-400 text-teal-600 dark:text-teal-400' : ''}`} />
            {savedCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-gradient-to-r from-teal-600 to-emerald-600 text-white text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center shadow-sm animate-pulse">
                {savedCount > 9 ? '9+' : savedCount}
              </span>
            )}
          </Link>

          {/* Contact & Support Link */}
          <Link
            href="/contact"
            className={`flex items-center justify-center w-9 h-9 rounded-full transition-all ${
              activeView === 'contact'
                ? 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60'
                : 'text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95'
            }`}
            aria-label="Contact editorial desk"
            title="Contact & Support"
          >
            <Mail className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
