// ScrollGuidance.jsx - First-time animated scroll indicator
'use client';

import { useState, useEffect } from 'react';
import { ChevronUp, X } from 'lucide-react';
import { getScrollHintDismissed, setScrollHintDismissed } from '../lib/ideasStore';

export default function ScrollGuidance() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const isDismissed = getScrollHintDismissed();
    if (!isDismissed) {
      // Show with slight delay
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setScrollHintDismissed();
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div 
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 animate-bounce pointer-events-auto"
      style={{ willChange: 'transform' }}
    >
      <div 
        onClick={handleDismiss}
        className="flex items-center gap-2 bg-slate-900/95 text-white px-4 py-2.5 rounded-full shadow-xl border border-slate-700/80 backdrop-blur-md cursor-pointer select-none group"
      >
        <ChevronUp className="w-4 h-4 text-emerald-400 animate-pulse" />
        <span className="text-xs font-bold tracking-wide">
          Scroll up for the next idea ↑
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDismiss();
          }}
          className="ml-1 text-slate-400 hover:text-white p-1.5 -mr-1 rounded-full flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Dismiss scroll guidance"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
