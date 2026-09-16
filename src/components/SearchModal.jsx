// SearchModal.jsx - Premium Mobile-Style Full-Screen Search Sheet with Scroll-Lock & Feed Card Results
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search, X, ArrowLeft, TrendingUp, History, Sparkles, CheckCircle2, DollarSign, Clock, Award } from 'lucide-react';
import { FILTER_CHIPS } from '../lib/seedData';
import { trackEvent } from '../lib/analytics';

const SEARCH_HISTORY_KEY = 'sei_recent_searches_v1';

export default function SearchModal({ isOpen, onClose, ideas = [], onSelectIdea }) {
  const [query, setQuery] = useState('');
  const [activeFilterId, setActiveFilterId] = useState('all');
  const [searchHistory, setSearchHistory] = useState([]);

  // Popular search suggestions
  const popularSuggestions = [
    "Zero Investment", "Print on Demand", "Video Editing", "Notion", 
    "High Profit", "Tutoring", "Campus Stalls", "Beginner"
  ];

  // Lock background scrolling while Search is open
  useEffect(() => {
    if (isOpen) {
      const prevBodyOverflow = document.body.style.overflow;
      const prevHtmlOverflow = document.documentElement.style.overflow;
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';

      return () => {
        document.body.style.overflow = prevBodyOverflow;
        document.documentElement.style.overflow = prevHtmlOverflow;
      };
    }
  }, [isOpen]);

  // Load search history
  useEffect(() => {
    if (typeof window !== 'undefined' && isOpen) {
      try {
        const saved = localStorage.getItem(SEARCH_HISTORY_KEY);
        if (saved) setSearchHistory(JSON.parse(saved));
      } catch (e) {}
    }
  }, [isOpen]);

  const saveToHistory = (term) => {
    if (!term || term.trim().length < 2) return;
    const clean = term.trim();
    const updated = [clean, ...searchHistory.filter(h => h.toLowerCase() !== clean.toLowerCase())].slice(0, 6);
    setSearchHistory(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
    }
  };

  const clearHistory = () => {
    setSearchHistory([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(SEARCH_HISTORY_KEY);
    }
  };

  // Filter and search logic
  const filteredIdeas = useMemo(() => {
    let list = ideas;

    // Apply filter chip
    if (activeFilterId !== 'all') {
      const chip = FILTER_CHIPS.find(c => c.id === activeFilterId);
      if (chip) {
        if (chip.filterKey === 'investment') {
          list = list.filter(i => i.investment?.includes(chip.match));
        } else if (chip.filterKey === 'tag') {
          list = list.filter(i => i.tags?.includes(chip.match) || i.category?.includes(chip.match));
        } else if (chip.filterKey === 'difficulty') {
          list = list.filter(i => i.difficulty?.toLowerCase() === chip.match.toLowerCase());
        }
      }
    }

    // Apply text search
    if (query.trim()) {
      const q = query.toLowerCase().trim();
      list = list.filter(i => 
        i.title?.toLowerCase().includes(q) ||
        i.subtitle?.toLowerCase().includes(q) ||
        i.category?.toLowerCase().includes(q) ||
        i.tags?.some(t => t.toLowerCase().includes(q)) ||
        i.breakdown?.summary?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [ideas, query, activeFilterId]);

  const handleQueryChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (val.length > 2) {
      trackEvent('search', { keyword: val });
    }
  };

  const handleSelect = (idea) => {
    if (query.trim()) saveToHistory(query.trim());
    onSelectIdea(idea);
  };

  const handleSelectSuggestion = (term) => {
    setQuery(term);
    saveToHistory(term);
  };

  const handleClearOrClose = () => {
    if (query) {
      setQuery('');
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-100 dark:bg-slate-950 flex flex-col h-dvh w-full overflow-hidden animate-in slide-in-from-bottom duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="Search Student Earning Ideas"
    >
      {/* 1. Fixed Top Bar: Back Arrow, Search Title, Clear (X) Button */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between sticky top-0 z-30 shrink-0">
        {/* Back Arrow */}
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors active:scale-95"
          aria-label="Back to feed"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Search Title */}
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          Search
        </h2>

        {/* Clear (X) Button */}
        <button
          onClick={handleClearOrClose}
          className="w-9 h-9 rounded-full text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors active:scale-95"
          aria-label={query ? "Clear search query" : "Close search"}
          title={query ? "Clear search" : "Close"}
        >
          <X className="w-5 h-5" />
        </button>
      </header>

      {/* 2. Full-Screen Search Input Bar */}
      <div className="p-3.5 bg-white dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <div className="relative flex items-center max-w-xl mx-auto w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={handleQueryChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && query.trim()) {
                saveToHistory(query.trim());
              }
            }}
            placeholder="Search student blueprints, skills, investments..."
            autoFocus
            className="w-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm font-medium pl-10 pr-10 py-2.5 rounded-full outline-none focus:ring-2 focus:ring-teal-500/40 border border-transparent focus:bg-white dark:focus:bg-slate-900 transition-all"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center text-xs hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
              aria-label="Clear input text"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* 3. Filter Chips Scroll Bar */}
      <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-none flex items-center gap-2 shrink-0 max-w-xl mx-auto w-full">
        {FILTER_CHIPS.map((chip) => (
          <button
            key={chip.id}
            onClick={() => setActiveFilterId(chip.id)}
            className={`text-xs font-bold px-3 py-1.5 rounded-full whitespace-nowrap transition-all ${
              activeFilterId === chip.id
                ? 'bg-teal-700 dark:bg-teal-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700'
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* 4. Search History & Suggestions (When no text query typed yet) */}
      {!query.trim() && (
        <div className="p-4 border-b border-slate-200/70 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 space-y-3 shrink-0 max-w-xl mx-auto w-full">
          {/* Recent History */}
          {searchHistory.length > 0 && (
            <div>
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                <span className="flex items-center gap-1">
                  <History className="w-3.5 h-3.5 text-teal-600" /> Recent Searches
                </span>
                <button
                  onClick={clearHistory}
                  className="text-slate-400 hover:text-rose-500 transition-colors"
                >
                  Clear
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {searchHistory.map((term, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectSuggestion(term)}
                    className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs px-2.5 py-1 rounded-lg font-medium hover:border-teal-500 transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Popular Suggestions */}
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Popular Student Topics
            </span>
            <div className="flex flex-wrap gap-1.5">
              {popularSuggestions.map((sug, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectSuggestion(sug)}
                  className="bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800/40 text-xs px-2.5 py-1 rounded-lg font-medium hover:bg-teal-100 dark:hover:bg-teal-900/50 transition-colors"
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. Results List: Mobile Feed / Card Layout */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 space-y-4 max-w-xl mx-auto w-full">
        {filteredIdeas.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800">
            <span className="text-4xl block mb-2">🔍</span>
            <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">No matching blueprints found</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
              Try searching for general keywords like "online", "₹0", "design", or select another filter tag.
            </p>
          </div>
        ) : (
          filteredIdeas.map((item) => (
            <article
              key={item.id}
              onClick={() => handleSelect(item)}
              className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-4 shadow-sm hover:shadow-md hover:border-teal-400 dark:hover:border-teal-500 cursor-pointer transition-all group"
            >
              {/* Category & Trust Badge Row */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/40 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-500" />
                  {item.category}
                </span>
                <span className="text-[10px] font-bold text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 border border-teal-200/60 dark:border-teal-800/40 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-teal-500" />
                  Verified Blueprint
                </span>
              </div>

              {/* 16:9 Responsive Hero Image (Matching Mobile Feed Card) */}
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 mb-3.5">
                <img
                  src={item.heroImage}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                  loading="lazy"
                />
              </div>

              {/* Title & Subtitle */}
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-snug group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">
                {item.title}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed line-clamp-2">
                {item.subtitle}
              </p>

              {/* Financial Metrics Pill Grid (Matching Feed Card) */}
              <div className="grid grid-cols-3 gap-2 text-xs pt-3 mt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-center">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block truncate">Investment</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400 text-xs truncate block">{item.investment}</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-center">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block truncate">Profit</span>
                  <span className="font-bold text-slate-900 dark:text-white text-xs truncate block">{item.estimatedProfit}</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-center">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block truncate">Payback</span>
                  <span className="font-bold text-teal-700 dark:text-teal-400 text-xs truncate block">{item.paybackPeriod || "Instant"}</span>
                </div>
              </div>

              {/* Mobile Card Action Bar */}
              <div className="mt-3.5 pt-2.5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[11px] font-medium">Difficulty: <strong className="text-slate-700 dark:text-slate-200">{item.difficulty || "Beginner"}</strong></span>
                <span className="inline-flex items-center gap-1 font-bold text-teal-700 dark:text-teal-400 group-hover:translate-x-1 transition-transform">
                  View Blueprint →
                </span>
              </div>
            </article>
          ))
        )}
      </div>

      {/* Footer bar */}
      <footer className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400 font-medium shrink-0">
        Showing {filteredIdeas.length} student earning {filteredIdeas.length === 1 ? 'blueprint' : 'blueprints'}
      </footer>
    </div>
  );
}
