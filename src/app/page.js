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
import { 
  fetchRecommendedResources, 
  getGlobalFrequency, 
  getWelcomeHero,
  DEFAULT_WELCOME_HERO
} from '@/lib/firestoreStore';
import { SEED_IDEAS } from '@/lib/seedData';
import { trackEvent } from '@/lib/analytics';
import { X, Sparkles } from 'lucide-react';
import { usePwaInstall } from '@/hooks/usePwaInstall';
import WelcomeHero from '@/components/WelcomeHero';

// Dynamically import non-critical modals and prompts to reduce initial JS payload
const SearchModal = dynamic(() => import('@/components/SearchModal'), { ssr: false });
const ScrollGuidance = dynamic(() => import('@/components/ScrollGuidance'), { ssr: false });
const CookieConsent = dynamic(() => import('@/components/CookieConsent'), { ssr: false });
const PwaInstallPrompt = dynamic(() => import('@/components/PwaInstallPrompt'), { ssr: false });
const NotificationPrompt = dynamic(() => import('@/components/NotificationPrompt'), { ssr: false });
const PremiumRefreshOverlay = dynamic(() => import('@/components/PremiumRefreshOverlay'), { ssr: false });

const INITIAL_FEED_LIMIT = 4;

export default function HomePage() {
  const router = useRouter();
  const {
    isVisible: isPwaPromptVisible,
    promptIdea: pwaPromptIdea,
    isIos: isPwaIos,
    isStandalone,
    canInstallNative,
    triggerOnIdeaView,
    handleInstall: handlePwaInstall,
    handleDismiss: handlePwaDismiss,
  } = usePwaInstall();
  const [visibleCount, setVisibleCount] = useState(INITIAL_FEED_LIMIT);
  const sentinelRef = useRef(null);
  // Start with the overlay hidden so the feed (and LCP image) is immediately visible.
  // The overlay will briefly appear only while Firestore refreshes in the background.
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFeedRevealed, setIsFeedRevealed] = useState(true);
  const [savedIds, setSavedIds] = useState([]);
  const [recommendedResources, setRecommendedResources] = useState([]);
  const [globalFrequency, setGlobalFrequency] = useState(7);
  const [isClient, setIsClient] = useState(false);
  const [rawIdeas, setRawIdeas] = useState(SEED_IDEAS);
  const [welcomeHeroConfig, setWelcomeHeroConfig] = useState(DEFAULT_WELCOME_HERO);
  const [feedOrderIds, setFeedOrderIds] = useState(null);


  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [vignetteAdVisible, setVignetteAdVisible] = useState(false);
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);
  const [maintenance, setMaintenance] = useState({ enabled: false, message: '' });
  const previousScrollY = useRef(0);
  // Dedicated notification observer & viewport visibility tracker
  const notifObserverFiredRef = useRef(false);
  const notifCountedIdsRef = useRef(new Set());
  const notifObserverRef = useRef(null);

  useEffect(() => {
    // Clear session dismissal on fresh page load so after a refresh,
    // the user will see the prompt again after viewing another 3-5 real idea cards.
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('notification_session_dismissed');
      // Clean up legacy permanent dismissal key so previous testers/users aren't suppressed
      localStorage.removeItem('notification_prompt_dismissed');
    }
  }, []);

  const [scrollCounter, setScrollCounter] = useState(0);

  const handleNotificationClose = () => {
    setShowNotificationPrompt(false);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('notification_session_dismissed', 'true');
    }
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

    // Shuffled once per page refresh on client mount so discovery is fresh,
    // while frozen against background Firestore syncs to eliminate layout jumps.
    const viewedIds = new Set(getViewedIds());
    const unseen = SEED_IDEAS.filter(i => !viewedIds.has(i.id));
    const seen = SEED_IDEAS.filter(i => viewedIds.has(i.id));
    const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);
    setFeedOrderIds([...shuffle(unseen), ...shuffle(seen)].map(i => i.id));

    // Load data silently in the background when the browser is idle.
    // SEED_IDEAS render immediately for instant FCP and LCP.
    // Firestore updates the feed in the background without blocking the critical path.
    const loadResourcesAndFrequency = async () => {
      try {
        const [ideas, resources, freq, heroConfig] = await Promise.all([
          getPublishedIdeas(),
          fetchRecommendedResources(),
          getGlobalFrequency(),
          getWelcomeHero(),
        ]);
        if (Array.isArray(ideas) && ideas.length > 0) {
          setRawIdeas(ideas);
          setFeedOrderIds(prev => {
            if (!prev) return ideas.map(i => i.id);
            const existingSet = new Set(prev);
            const brandNew = ideas.filter(i => !existingSet.has(i.id));
            if (brandNew.length > 0) {
              const brandNewUnseen = brandNew.filter(i => !viewedIds.has(i.id));
              const brandNewSeen = brandNew.filter(i => viewedIds.has(i.id));
              return [...prev, ...shuffle(brandNewUnseen).map(i => i.id), ...shuffle(brandNewSeen).map(i => i.id)];
            }
            return prev;
          });
        }
        if (Array.isArray(resources)) {
          const activeOnly = resources.filter((r) => r.active !== false);
          setRecommendedResources(activeOnly);
        }
        if (typeof freq === 'number' && freq > 0) {
          setGlobalFrequency(freq);
        }
        if (heroConfig && heroConfig.enabled !== false) {
          setWelcomeHeroConfig(heroConfig);
        } else if (heroConfig && heroConfig.enabled === false) {
          setWelcomeHeroConfig(null);
        }
      } catch (err) {
        console.error('Failed to load ideas or recommended resources:', err);
      }
    };

    // Schedule background Firestore sync strictly after window load + idle
    // to guarantee zero competition with the LCP image or initial React rendering.
    let scheduled = false;
    const scheduleBackgroundSync = () => {
      if (scheduled) return;
      scheduled = true;

      if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
        window.requestIdleCallback(() => {
          loadResourcesAndFrequency();
        }, { timeout: 4500 });
      } else {
        setTimeout(loadResourcesAndFrequency, 4000);
      }
    };

    if (document.readyState === 'complete') {
      scheduleBackgroundSync();
    } else {
      window.addEventListener('load', scheduleBackgroundSync, { once: true });
      const safetyTimer = setTimeout(scheduleBackgroundSync, 5000);
      return () => {
        window.removeEventListener('load', scheduleBackgroundSync);
        clearTimeout(safetyTimer);
      };
    }
  }, []);

  // Persistent feed order for the current page session.
  // Shuffled once per page refresh on client mount so discovery is fresh,
  // while frozen against background Firestore syncs to eliminate layout jumps.
  const sortedFeedIdeas = useMemo(() => {
    if (!rawIdeas.length) return [];

    if (!feedOrderIds) {
      const viewedIds = new Set(getViewedIds());
      const unseen = rawIdeas.filter(i => !viewedIds.has(i.id));
      const seen = rawIdeas.filter(i => viewedIds.has(i.id));
      return [...unseen, ...seen];
    }

    const ideaMap = new Map(rawIdeas.map(i => [i.id, i]));
    const existingOrdered = feedOrderIds
      .map(id => ideaMap.get(id))
      .filter(Boolean);

    const existingIdSet = new Set(feedOrderIds);
    const unassigned = rawIdeas.filter(i => !existingIdSet.has(i.id));
    return [...existingOrdered, ...unassigned];
  }, [rawIdeas, feedOrderIds]);

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

  // --- Dedicated Notification Trigger (Single-fire, decoupled from visibleCount) ---
  // Sets up ONCE after sortedFeedIdeas is available. Observes ALL idea cards using the
  // actual scroll container (<main>) as the root so intersection events fire correctly.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!sortedFeedIdeas.length) return;
    // Already fired this session — do nothing
    if (notifObserverFiredRef.current) return;

    const triggerNotificationPopup = () => {
      if (notifObserverFiredRef.current) return;
      notifObserverFiredRef.current = true;

      if (notifObserverRef.current) {
        notifObserverRef.current.disconnect();
        notifObserverRef.current = null;
      }

      const isGranted = 'Notification' in window && Notification.permission === 'granted';
      const isSubscribed = localStorage.getItem('notification_prompt_shown') === 'true';
      const sessionDismissed = sessionStorage.getItem('notification_session_dismissed') === 'true';

      if (process.env.NODE_ENV === 'development') {
        console.log('[Notif] Trigger check — granted:', isGranted, 'subscribed:', isSubscribed, 'sessionDismissed:', sessionDismissed);
      }

      if (!isGranted && !isSubscribed && !sessionDismissed) {
        setShowNotificationPrompt(true);
        if (process.env.NODE_ENV === 'development') {
          console.log('[Notif] ✅ Popup shown after 3 real idea cards.');
        }
      }
    };

    // Defer setup by one frame so <main> is mounted and idea cards are in the DOM
    const rafId = requestAnimationFrame(() => {
      const scrollContainer = mainFeedRef.current;

      // IntersectionObserver with <main> as root — fires as cards scroll into view inside it
      const observer = new IntersectionObserver(
        (entries) => {
          if (notifObserverFiredRef.current) return;

          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const cardId = entry.target.id?.replace('card-', '');
            if (!cardId || notifCountedIdsRef.current.has(cardId)) return;

            notifCountedIdsRef.current.add(cardId);
            observer.unobserve(entry.target);

            if (process.env.NODE_ENV === 'development') {
              console.log('[Notif] Card seen:', cardId, '— total:', notifCountedIdsRef.current.size);
            }

            if (notifCountedIdsRef.current.size >= 3) {
              triggerNotificationPopup();
            }
          });
        },
        // Use the scroll container as root so intersections are relative to it.
        // Fall back to viewport (null root) if mainFeedRef isn't attached yet.
        { root: scrollContainer || null, threshold: 0.4 }
      );

      notifObserverRef.current = observer;

      // Observe ALL idea cards (not just the visible slice) so new cards entering
      // the DOM later are picked up without needing to re-run this effect.
      sortedFeedIdeas.forEach((idea) => {
        const el = document.getElementById(`card-${idea.id}`);
        if (el && !notifCountedIdsRef.current.has(idea.id)) {
          observer.observe(el);
        }
      });

      if (process.env.NODE_ENV === 'development') {
        console.log('[Notif] Observer attached. Watching', sortedFeedIdeas.length, 'cards.');
      }

      // Immediate BoundingClientRect fallback: count cards already visible on screen.
      // This handles the case where cards were rendered before the observer attached.
      const vh = scrollContainer ? scrollContainer.clientHeight : window.innerHeight;
      sortedFeedIdeas.forEach((idea) => {
        if (notifObserverFiredRef.current) return;
        if (notifCountedIdsRef.current.has(idea.id)) return;
        const el = document.getElementById(`card-${idea.id}`);
        if (!el) return;
        const rect = el.getBoundingClientRect();
        // When using a scroll container as root, getBoundingClientRect() is still
        // relative to the viewport — check if the card is meaningfully visible.
        if (rect.top >= 0 && rect.top < vh * 0.85 && rect.height > 0) {
          notifCountedIdsRef.current.add(idea.id);
          observer.unobserve(el);
          if (process.env.NODE_ENV === 'development') {
            console.log('[Notif] Card pre-visible (rect):', idea.id, '— total:', notifCountedIdsRef.current.size);
          }
          if (notifCountedIdsRef.current.size >= 3) {
            triggerNotificationPopup();
          }
        }
      });

      // Scroll listener on the actual scroll container as a belt-and-suspenders fallback
      const handleScrollCheck = () => {
        if (notifObserverFiredRef.current) return;
        // Re-run rect check on scroll in case IntersectionObserver root missed something
        sortedFeedIdeas.forEach((idea) => {
          if (notifObserverFiredRef.current) return;
          if (notifCountedIdsRef.current.has(idea.id)) return;
          const el = document.getElementById(`card-${idea.id}`);
          if (!el) return;
          const rect = el.getBoundingClientRect();
          if (rect.top >= 0 && rect.top < window.innerHeight * 0.85 && rect.height > 0) {
            notifCountedIdsRef.current.add(idea.id);
            if (notifObserverRef.current) observer.unobserve(el);
            if (notifCountedIdsRef.current.size >= 3) {
              triggerNotificationPopup();
            }
          }
        });
      };

      if (scrollContainer) {
        scrollContainer.addEventListener('scroll', handleScrollCheck, { passive: true });
      } else {
        window.addEventListener('scroll', handleScrollCheck, { passive: true });
      }

      // Store cleanup in a closure-captured var for the effect cleanup
      notifObserverRef._cleanup = () => {
        observer.disconnect();
        notifObserverRef.current = null;
        if (scrollContainer) {
          scrollContainer.removeEventListener('scroll', handleScrollCheck);
        } else {
          window.removeEventListener('scroll', handleScrollCheck);
        }
      };
    });

    return () => {
      cancelAnimationFrame(rafId);
      if (notifObserverRef._cleanup) {
        notifObserverRef._cleanup();
        delete notifObserverRef._cleanup;
      } else if (notifObserverRef.current) {
        notifObserverRef.current.disconnect();
        notifObserverRef.current = null;
      }
    };
  // Only re-run when the feed data itself changes, NOT when visibleCount changes.
  // This prevents the observer from being torn down/rebuilt as the feed expands.
  }, [sortedFeedIdeas]);

  // As visibleCount grows, newly rendered cards enter the DOM. Register them with
  // the existing notification observer (notifObserverRef) without recreating it.
  useEffect(() => {
    if (!sortedFeedIdeas.length) return;
    if (notifObserverFiredRef.current) return;
    const observer = notifObserverRef.current;
    if (!observer) return;

    sortedFeedIdeas.slice(0, visibleCount).forEach((idea) => {
      if (notifCountedIdsRef.current.has(idea.id)) return;
      const el = document.getElementById(`card-${idea.id}`);
      if (el) observer.observe(el);
    });
  }, [sortedFeedIdeas, visibleCount]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleSaveChange = () => {
    setSavedIds(getSavedIds());
  };

  const mainFeedRef = useRef(null); // Attached to <main> — the actual scroll container
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

  // Scroll-based progressive feed expansion
  useEffect(() => {
    if (visibleCount >= feedItems.length) return;

    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + 4, feedItems.length));
        }
      },
      { rootMargin: '800px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [visibleCount, feedItems.length]);

  // Idle-time expansion: once LCP settles, quietly expand remaining items
  useEffect(() => {
    if (visibleCount < feedItems.length) {
      if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
        const id = window.requestIdleCallback(() => {
          setVisibleCount((prev) => Math.min(prev + 6, feedItems.length));
        }, { timeout: 3500 });
        return () => window.cancelIdleCallback(id);
      } else {
        const t = setTimeout(() => {
          setVisibleCount((prev) => Math.min(prev + 6, feedItems.length));
        }, 2000);
        return () => clearTimeout(t);
      }
    }
  }, [visibleCount, feedItems.length]);

  const handleSelectIdeaFromSearch = (idea) => {
    setVisibleCount(feedItems.length); // Ensure target exists in DOM
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

      {/* Native Full-Screen CSS Snap-Scroll Feed Container */}
      <main ref={mainFeedRef} className={`flex-1 overflow-y-auto snap-y snap-mandatory min-h-screen ${isFeedRevealed ? 'feed-reveal-active' : ''}`}>
        {/* Welcome Blueprint Card — permanent introduction to the platform, shown before idea cards, never an idea */}
        {welcomeHeroConfig && welcomeHeroConfig.enabled !== false && (
          <WelcomeHero
            config={welcomeHeroConfig}
            onInstall={handlePwaInstall}
            isStandalone={isStandalone}
            canInstallNative={canInstallNative}
            isIos={isPwaIos}
          />
        )}

        {/* Scroll anchor target for Welcome Blueprint Card CTA */}
        <div id="feed" />
        {feedItems.slice(0, visibleCount).map((item, index) => {
          if (item.type === 'idea') {
            const idea = item.data;

            return (
              <div key={idea.id} className={index > 0 ? "feed-card-lazy" : ""}>
                <IdeaCard
                  idea={idea}
                  index={index + 1}
                  allIdeas={sortedFeedIdeas}
                  onSaveChange={handleSaveChange}
                  onShowToast={showToast}
                  showBottomAd={index !== 0}
                  onNavigateToIdea={(slug) => {
                    setVisibleCount(feedItems.length);
                    const target = sortedFeedIdeas.find(i => i.slug === slug);

                    if (target) {
                      setTimeout(() => {
                        const el = document.getElementById(`card-${target.id}`);
                        if (el) {
                          el.scrollIntoView({ behavior: 'smooth' });
                        }
                      }, 50);
                    }
                  }}
                />

                {/* Ad placement: Positioned strictly below the first complete publisher content (Hero Idea) */}
                {index === 0 && rawIdeas.length > 0 && (
                  <div className="max-w-xl mx-auto w-full px-3 sm:px-4 py-2 min-h-[66px]">
                    <AdUnit type="header-banner" />
                  </div>
                )}
              </div>
            );
          }

          if (item.type === 'resource') {
            return (
              <div key={item.key} className={index > 0 ? "feed-card-lazy" : ""}>
                <RecommendedResourceCard
                  resource={item.data}
                  index={index}
                />
              </div>
            );
          }

          return null;
        })}

        {/* Scroll Sentinel for progressive feed loading */}
        {visibleCount < feedItems.length && (
          <div ref={sentinelRef} className="h-6 w-full pointer-events-none" aria-hidden="true" />
        )}

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

      {/* Notification Opt‑In Top Banner (shown ONLY after 3-5 real ideas entered viewport) */}
      {showNotificationPrompt && (
        <NotificationPrompt isVisible={showNotificationPrompt} onClose={handleNotificationClose} />
      )}

      {/* One-Time Animated Scroll Guidance Banner */}
      <ScrollGuidance />

      {/* Search Drawer & 7-Chip Filter Screen — dynamically mounted on demand */}
      {isSearchOpen && (
        <SearchModal
          isOpen={isSearchOpen}
          onClose={handleCloseSearch}
          ideas={sortedFeedIdeas}
          onSelectIdea={handleSelectIdeaFromSearch}
        />
      )}

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

      {/* PWA Install Prompt Banner — conditionally mounted on demand */}
      {isPwaPromptVisible && (
        <PwaInstallPrompt
          isVisible={isPwaPromptVisible}
          promptIdea={pwaPromptIdea}
          isIos={isPwaIos}
          onInstall={handlePwaInstall}
          onDismiss={handlePwaDismiss}
        />
      )}

      {/* Premium Refresh Overlay */}
      {isRefreshing && (
        <PremiumRefreshOverlay visible={isRefreshing} />
      )}

      {/* GDPR / ePrivacy Cookie Consent */}
      <CookieConsent />

      {/* Footer */}
      <Footer />
    </div>
  );
}
