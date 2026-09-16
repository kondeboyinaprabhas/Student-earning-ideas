// src/app/page.js - Production-Ready Homepage Snap-Scroll Feed
'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import IdeaCard from '@/components/IdeaCard';
import AdUnit from '@/components/AdUnit';
import SearchModal from '@/components/SearchModal';
import ScrollGuidance from '@/components/ScrollGuidance';
import CookieConsent from '@/components/CookieConsent';
import Toast from '@/components/Toast';
import Footer from '@/components/Footer';
import { 
  getPublishedIdeas, getSavedIds, getViewedIds, 
  markAsViewed, getMaintenanceConfig 
} from '@/lib/ideasStore';
import { trackEvent } from '@/lib/analytics';
import { X, Sparkles, ShieldAlert, Key } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [rawIdeas, setRawIdeas] = useState([]);
  const [savedIds, setSavedIds] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [vignetteAdVisible, setVignetteAdVisible] = useState(false);
  const [scrollCounter, setScrollCounter] = useState(0);
  const previousScrollY = useRef(0);

  // Maintenance mode state
  const [maintenance, setMaintenance] = useState({ enabled: false });

  useEffect(() => {
    const ideas = getPublishedIdeas();
    setRawIdeas(ideas);
    setSavedIds(getSavedIds());
    setMaintenance(getMaintenanceConfig());
  }, []);

  // Organize feed: Unseen ideas first!
  const sortedFeedIdeas = useMemo(() => {
    if (!rawIdeas.length) return [];
    const viewedIds = new Set(getViewedIds());

    const unseen = rawIdeas.filter(i => !viewedIds.has(i.id));
    const seen = rawIdeas.filter(i => viewedIds.has(i.id));

    return [...unseen, ...seen];
  }, [rawIdeas]);

  // Track viewed ideas with IntersectionObserver
  useEffect(() => {
    if (!sortedFeedIdeas.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // IntersectionObserver callback with direction-aware vignette ad trigger
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const cardId = entry.target.id.replace('card-', '');
          if (cardId) {
            markAsViewed(cardId);
            // Only count when scrolling down
            const currentScrollY = window.scrollY || document.documentElement.scrollTop || 0;
            if (currentScrollY > previousScrollY.current) {
              setScrollCounter((prev) => {
                const next = prev + 1;
                // Vignette Ad every 10 ideas (non-intrusive modal simulation)
                if (next > 0 && next % 10 === 0) {
                  setVignetteAdVisible(true);
                }
                // Update previous scroll position after counting
                previousScrollY.current = currentScrollY;
                return next;
              });
            }
            // Update previous scroll position even if not counting (e.g., scrolling up)
            else {
              previousScrollY.current = currentScrollY;
            }
            trackEvent('view_idea', { ideaId: cardId });
          }
        }
      });
      },
      { threshold: 0.6 }
    );

    sortedFeedIdeas.forEach((idea) => {
      const el = document.getElementById(`card-${idea.id}`);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sortedFeedIdeas]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleSaveChange = () => {
    setSavedIds(getSavedIds());
  };

  const mainFeedRef = useRef(null);
  const scrollPosRef = useRef({ scrollY: 0, containerScrollTop: 0 });

  const handleOpenSearch = () => {
    const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
    const containerScrollTop = mainFeedRef.current ? mainFeedRef.current.scrollTop : 0;
    scrollPosRef.current = { scrollY, containerScrollTop };
    setIsSearchOpen(true);
  };

  const handleCloseSearch = () => {
    setIsSearchOpen(false);
    // Restore the previous homepage scroll position
    setTimeout(() => {
      if (mainFeedRef.current && scrollPosRef.current.containerScrollTop > 0) {
        mainFeedRef.current.scrollTop = scrollPosRef.current.containerScrollTop;
      }
      if (scrollPosRef.current.scrollY > 0) {
        window.scrollTo({ top: scrollPosRef.current.scrollY, behavior: 'instant' });
      }
    }, 20);
  };

  const handleSelectIdeaFromSearch = (idea) => {
    setIsSearchOpen(false);
    setTimeout(() => {
      const el = document.getElementById(`card-${idea.id}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 50);
  };

  // Maintenance Screen if active
  if (maintenance.enabled) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-white">
        <div className="bg-slate-900 border border-teal-500/30 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center shadow-2xl space-y-4">
          <div className="w-14 h-14 bg-teal-500/20 text-teal-400 rounded-2xl flex items-center justify-center mx-auto">
            <Sparkles className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-black text-white">Student Earning Ideas</h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            {maintenance.message || "We are polishing new 2026 student earning blueprints. Launching soon!"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col antialiased">
      {/* Premium Frosted Glass Header */}
      <Header
        savedCount={savedIds.length}
        onOpenSearch={handleOpenSearch}
      />

      <Toast message={toastMessage} />

      {/* Top AdSense Header Banner (Matches Reference Image) */}
      <div className="max-w-xl mx-auto w-full px-3 sm:px-4 pt-1">
        <AdUnit type="header-banner" />
      </div>

      {/* Native Full-Screen CSS Snap-Scroll Feed Container */}
      <main ref={mainFeedRef} className="flex-1 w-full max-w-xl mx-auto overflow-y-auto snap-y snap-mandatory scroll-smooth pb-16">
        {sortedFeedIdeas.map((idea, index) => (
          <IdeaCard
            key={idea.id}
            idea={idea}
            index={index}
            allIdeas={sortedFeedIdeas}
            onSaveChange={handleSaveChange}
            onShowToast={showToast}
            onNavigateToIdea={(slug) => {
              const target = sortedFeedIdeas.find(i => i.slug === slug);
              if (target) {
                const el = document.getElementById(`card-${target.id}`);
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          />
        ))}

        {/* Feed Bottom Note */}
        <div className="py-12 px-4 text-center text-xs text-slate-500 space-y-2">
          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto font-bold text-sm">
            ✓
          </div>
          <p className="font-bold text-slate-800">You've explored all verified student blueprints!</p>
          <p className="text-[11px] text-slate-400">
            More blueprints are published weekly by our student editorial research desk.
          </p>
        </div>
      </main>

      {/* One-Time Animated Scroll Guidance Banner */}
      <ScrollGuidance />

      {/* Search Drawer & 7-Chip Filter Screen */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={handleCloseSearch}
        ideas={sortedFeedIdeas}
        onSelectIdea={handleSelectIdeaFromSearch}
      />

      {/* Google Vignette Ad Simulation (Every 5–6 Ideas) */}
      {vignetteAdVisible && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl relative">
            <button
              onClick={() => setVignetteAdVisible(false)}
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
              aria-label="Close advertisement"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
              Sponsored • Google Vignette
            </span>

            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-400 to-indigo-600 text-white text-3xl flex items-center justify-center mx-auto shadow-md">
              💼
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 leading-snug">
                Student Micro-Internships & Project Grants 2026
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Connect with funded early-stage startups offering paid weekend remote internships for university students.
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setVignetteAdVisible(false)}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-md active:scale-98"
              >
                Continue to Student Earning Ideas →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GDPR / ePrivacy Cookie Consent */}
      <CookieConsent />

      {/* Footer */}
      <Footer />
    </div>
  );
}
