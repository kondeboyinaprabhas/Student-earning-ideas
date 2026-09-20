// src/app/page.js - Production-Ready Homepage Snap-Scroll Feed
'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Header from '@/components/Header';
import IdeaCard from '@/components/IdeaCard';
import RecommendedResourceCard from '@/components/RecommendedResourceCard';
import AdUnit from '@/components/AdUnit';
import Toast from '@/components/Toast';
import Footer from '@/components/Footer';
import { 
  getPublishedIdeas, getSavedIds, getViewedIds, 
  markAsViewed, getMaintenanceConfig 
} from '@/lib/ideasStore';
import { fetchRecommendedResources, getGlobalFrequency } from '@/lib/firestoreStore';
import { SEED_IDEAS } from '@/lib/seedData';
import { trackEvent } from '@/lib/analytics';
import { X, Sparkles } from 'lucide-react';
import PremiumRefreshOverlay from '@/components/PremiumRefreshOverlay';
import { usePwaInstall } from '@/hooks/usePwaInstall';
import { getPushStatus, subscribeUserToPush } from '@/lib/pushSubscription';

// Dynamically import non-critical modals and prompts to reduce initial JS payload
const SearchModal = dynamic(() => import('@/components/SearchModal'), { ssr: false });
const ScrollGuidance = dynamic(() => import('@/components/ScrollGuidance'), { ssr: false });
const CookieConsent = dynamic(() => import('@/components/CookieConsent'), { ssr: false });
const PwaInstallPrompt = dynamic(() => import('@/components/PwaInstallPrompt'), { ssr: false });
const NotificationPrompt = dynamic(() => import('@/components/NotificationPrompt'), { ssr: false });

export default function HomePage() {
  const router = useRouter();
  const {
    isVisible: isPwaPromptVisible,
    promptIdea: pwaPromptIdea,
    isIos: isPwaIos,
    triggerOnIdeaView,
    handleInstall: handlePwaInstall,
    handleDismiss: handlePwaDismiss,
  } = usePwaInstall();
  const [rawIdeas, setRawIdeas] = useState(SEED_IDEAS);
  const [isRefreshing, setIsRefreshing] = useState(true);
  const [isFeedRevealed, setIsFeedRevealed] = useState(false);
  const [savedIds, setSavedIds] = useState([]);
  const [recommendedResources, setRecommendedResources] = useState([]);
  const [globalFrequency, setGlobalFrequency] = useState(7);
  const [isClient, setIsClient] = useState(false);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [vignetteAdVisible, setVignetteAdVisible] = useState(false);
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);
  const [viewedIdeaCount, setViewedIdeaCount] = useState(0);
  const [maintenance, setMaintenance] = useState({ enabled: false, message: '' });
  const viewedIdeaIds = useRef(new Set());
  const previousScrollY = useRef(0);

  useEffect(() => {
    const dismissed = typeof window !== 'undefined' && localStorage.getItem('notification_prompt_dismissed') === 'true';
    const shown = typeof window !== 'undefined' && localStorage.getItem('notification_prompt_shown') === 'true';
    if (dismissed || shown) {
      setShowNotificationPrompt(false);
    }
  }, []);
  const [scrollCounter, setScrollCounter] = useState(0);
  const handleNotificationClose = () => {
    setShowNotificationPrompt(false);
    localStorage.setItem('notification_prompt_dismissed', 'true');
  };

    // Online/Offline detection using navigator.onLine only
  const [isOnline, setIsOnline] = useState(() => {
    if (typeof navigator === 'undefined') return true;
    return navigator.onLine;
  });
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);



  useEffect(() => {
    setIsClient(true);
    setSavedIds(getSavedIds());
    setMaintenance(getMaintenanceConfig());

    // Fetch ideas from Firestore + resources + global frequency concurrently with minimum 1.7s animation
    const loadResourcesAndFrequency = async () => {
      setIsRefreshing(true);
      // Run data loading and the 1.7s minimum animation duration simultaneously
      const minDurationPromise = new Promise((resolve) => setTimeout(resolve, 1700));
      const dataPromise = Promise.all([
        getPublishedIdeas(),
        fetchRecommendedResources(),
        getGlobalFrequency(),
      ]);

      // Apply ideas as soon as Firestore delivers them to start hero image download immediately
      dataPromise.then(([ideas, resources, freq]) => {
        if (Array.isArray(ideas) && ideas.length > 0) {
          setRawIdeas(ideas);
        }
        if (Array.isArray(resources)) {
          const activeOnly = resources.filter((r) => r.active !== false);
          setRecommendedResources(activeOnly);
        }
        if (typeof freq === 'number' && freq > 0) {
          setGlobalFrequency(freq);
        }
      }).catch((err) => {
        console.error('Failed to load ideas or recommended resources:', err);
      });

      try {
        await Promise.all([dataPromise, minDurationPromise]);
        setIsFeedRevealed(true);
      } catch (err) {
        console.error('Overlay completion error:', err);
      } finally {
        setIsRefreshing(false);
      }
    };

    loadResourcesAndFrequency();
  }, []);

  // Organize feed: Unseen ideas first!
  const sortedFeedIdeas = useMemo(() => {
    if (!rawIdeas.length) return [];

    const viewedIds = new Set(getViewedIds());
    const unseen = rawIdeas.filter(i => !viewedIds.has(i.id));
    const seen = rawIdeas.filter(i => viewedIds.has(i.id));

    // Keep deterministic order on SSR and initial hydration to prevent mismatch
    if (!isClient) {
      return [...unseen, ...seen];
    }

    const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);
    return [...shuffle(unseen), ...shuffle(seen)];
  }, [rawIdeas, isClient]);

  // Interleave active Recommended Resources into the Ideas feed after every N ideas
const feedItems = useMemo(() => {
  if (!sortedFeedIdeas.length) return [];

  if (!recommendedResources.length || !globalFrequency || globalFrequency < 1) {
    return sortedFeedIdeas.map((idea) => ({
      type: 'idea',
      data: idea,
      key: `idea-${idea.id}`,
    }));
  }

  const items = [];
  let resourceIdx = 0;

  for (let i = 0; i < sortedFeedIdeas.length; i++) {
    items.push({
      type: 'idea',
      data: sortedFeedIdeas[i],
      key: `idea-${sortedFeedIdeas[i].id}`,
    });

    if ((i + 1) % globalFrequency === 0) {
      const resource =
        recommendedResources[resourceIdx % recommendedResources.length];

      items.push({
        type: 'resource',
        data: resource,
        key: `feed-resource-${resource.id}-${i}`,
      });

      resourceIdx++;
    }
  }

  return items;
}, [sortedFeedIdeas, recommendedResources, globalFrequency]);

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

            // Track unique idea views for notification prompt
            if (!viewedIdeaIds.current.has(cardId)) {
              viewedIdeaIds.current.add(cardId);
              setViewedIdeaCount((prev) => {
                const newCount = prev + 1;
                const dismissed = typeof window !== 'undefined' && localStorage.getItem('notification_prompt_dismissed') === 'true';
                const shown = typeof window !== 'undefined' && localStorage.getItem('notification_prompt_shown') === 'true';
                if (newCount === 3 && !dismissed && !shown) {
                  setShowNotificationPrompt(true);
                  localStorage.setItem('notification_prompt_shown', 'true');
                }
                return newCount;
              });
            }

            // PWA install prompt trigger: strictly based ONLY on Ideas in feed order
            // Recommended Resources are never counted as ideas
            const ideaIndex = sortedFeedIdeas.findIndex(i => i.id === cardId);
            if (ideaIndex !== -1) {
              const ideaNumber = ideaIndex + 1;
              triggerOnIdeaView(ideaNumber);
            }

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

    return () => { observer.disconnect(); };
  }, [sortedFeedIdeas, triggerOnIdeaView]);

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
      <>
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
      </>
    );
  }

  if (isOnline === false) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100 text-slate-800">
      <h1 className="text-2xl font-bold">Internet connection required</h1>
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
      <div className="max-w-xl mx-auto w-full px-3 sm:px-4 pt-1 min-h-[66px]">
        <AdUnit type="header-banner" />
      </div>

      <style>{`
        @keyframes feed-slide-up {
          0% {
            opacity: 0.85;
            transform: translateY(24px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .feed-reveal-active {
          animation: feed-slide-up 280ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        @media (prefers-reduced-motion: reduce) {
          .feed-reveal-active {
            animation: none !important;
          }
        }
      `}</style>

      {/* Native Full-Screen CSS Snap-Scroll Feed Container */}
      <main className={`flex-1 overflow-y-auto snap-y snap-mandatory min-h-screen ${isFeedRevealed ? 'feed-reveal-active' : ''}`}>
        {/* Notification Opt‑In Prompt */}
        {showNotificationPrompt && (
          <NotificationPrompt isVisible={showNotificationPrompt} onClose={handleNotificationClose} />
        )}
        {feedItems.map((item, index) => {
          if (item.type === 'idea') {
            const idea = item.data;

            return (
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

                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth' });
                    }
                  }
                }}
              />
            );
          }

          if (item.type === 'resource') {
            return (
              <RecommendedResourceCard
                key={item.key}
                resource={item.data}
                index={index}
              />
            );
          }

          return null;
        })}

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

      {/* PWA Install Prompt Banner (Strict Idea #2 & Idea #10 Triggers) */}
      <PwaInstallPrompt
        isVisible={isPwaPromptVisible}
        promptIdea={pwaPromptIdea}
        isIos={isPwaIos}
        onInstall={handlePwaInstall}
        onDismiss={handlePwaDismiss}
      />

      {/* Premium Refresh Overlay */}
      <PremiumRefreshOverlay visible={isRefreshing} />

      {/* GDPR / ePrivacy Cookie Consent */}
      <CookieConsent />

      {/* Footer */}
      <Footer />
    </div>
  );
}
