// IdeaCard.jsx - Snap-Scroll Idea Card with Dark Mode & Clean Image Indicators (Zero '16:9' Text)
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getOptimizedImageUrl } from '@/lib/imageOptimizer';
import { 
  ChevronDown, ChevronUp, ChevronLeft, ChevronRight, 
  Lightbulb, ArrowRight, Sparkles, ShieldAlert 
} from 'lucide-react';
import EngagementBar from './EngagementBar';
import BusinessTools from './BusinessTools';
import TrustFeatures from './TrustFeatures';
import AdUnit from './AdUnit';
import SpokenWordHighlight from './SpokenWordHighlight';
import { tts } from '@/lib/ttsService';
import { trackEvent } from '../lib/analytics';


export default function IdeaCard({ 
  idea, 
  index = 0, 
  onSaveChange, 
  onShowToast, 
  onNavigateToIdea,
  allIdeas = [] 
}) {
  // trackIndex moves through the slide strip (0 … N-1 real images + 1 clone of first).
  const [trackIndex, setTrackIndex] = useState(0);
  // isSliding controls whether the CSS transition is enabled.
  // Disabled only during the silent instant-jump from the clone back to index 0.
  const [isSliding, setIsSliding] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const carouselRef = useRef(null);
  const isVisibleRef = useRef(false);
  const timerRef = useRef(null);
  const isUserHoldingRef = useRef(false);
  const isTransitioningRef = useRef(false);
  const touchStartXRef = useRef(0);
  const touchStartYRef = useRef(0);
  const [audioState, setAudioState] = useState({
    isPlaying: false,
    isPaused: false,
    currentIdeaId: null,
    activeSectionKey: '',
    activeWord: '',
    activeWordIndex: -1
  });

  // Listen to TTS narration events for live word highlighting & auto-scroll
  useEffect(() => {
    const unsubscribe = tts.subscribe(state => {
      setAudioState(state);
    });
    return () => unsubscribe();
  }, []);

  // Auto-scroll and auto-expand during speech narration
  useEffect(() => {
    if (audioState.isPlaying && !audioState.isPaused && audioState.currentIdeaId === idea.id) {
      // Automatically expand Read More when speech progresses to inner sections
      if (['howItWorks', 'investment', 'profit', 'payback', 'commitment', 'steps', 'risks'].includes(audioState.activeSectionKey)) {
        setIsExpanded(true);
      }

      // Smoothly keep active sentence/word centered in view
      const activeEl = document.getElementById('tts-active-word');
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
      }
    }
  }, [audioState.activeWord, audioState.activeWordIndex, audioState.activeSectionKey, audioState.isPlaying, audioState.isPaused, audioState.currentIdeaId, idea.id]);
  const carouselImages = idea.carouselImages?.length ? idea.carouselImages : [idea.heroImage];

  // Append a clone of the first image so the last→first transition is also a smooth slide.
  // Single-image carousels keep the plain array (no clone needed).
  const slidesArray = carouselImages.length > 1
    ? [...carouselImages, carouselImages[0]]
    : carouselImages;
  const totalSlides = slidesArray.length;

  // The "real" index (0…N-1) used for dot indicators and alt text.
  const realIndex = trackIndex >= carouselImages.length ? 0 : trackIndex;

  // Schedules the next slide advance after `delay` ms (default 2-second hold).
  // Will only fire if the card is still in the viewport and the user is not actively holding.
  const scheduleNextSlide = useCallback((delay = 2000) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (!isVisibleRef.current || isUserHoldingRef.current || carouselImages.length < 2) {
      return;
    }
    timerRef.current = setTimeout(() => {
      if (isVisibleRef.current && !isUserHoldingRef.current) {
        isTransitioningRef.current = true;
        setIsSliding(true);
        setTrackIndex(prev => prev + 1);
      }
    }, delay);
  }, [carouselImages.length]);

  // Called when the CSS transition ends on the strip (after ~800ms slide).
  // If we just animated to the clone (position N), silently jump to position 0.
  const handleTransitionEnd = useCallback(() => {
    isTransitioningRef.current = false;
    if (trackIndex >= carouselImages.length) {
      setIsSliding(false);   // disable transition for the silent jump
      setTrackIndex(0);
    }
    // Hold each image still for 2 seconds before sliding to the next
    if (!isUserHoldingRef.current && isVisibleRef.current) {
      scheduleNextSlide(2000);
    }
  }, [trackIndex, carouselImages.length, scheduleNextSlide]);

  // Re-enable the transition one paint-frame after the silent jump completes
  // so the strip doesn't animate back across all slides.
  useEffect(() => {
    if (!isSliding) {
      const id = requestAnimationFrame(() =>
        requestAnimationFrame(() => setIsSliding(true))
      );
      return () => cancelAnimationFrame(id);
    }
  }, [isSliding]);

  // Viewport-aware auto-advance using IntersectionObserver.
  // Starts 2s hold when the carousel enters the viewport; pauses completely when it leaves.
  // Each mounted IdeaCard gets its own independent observer and timer.
  useEffect(() => {
    if (carouselImages.length < 2) return;
    const el = carouselRef.current;
    if (!el) return;

    const stopTicking = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
        if (entry.isIntersecting) {
          if (!isUserHoldingRef.current && !isTransitioningRef.current) {
            scheduleNextSlide(2000);
          }
        } else {
          stopTicking();
        }
      },
      { threshold: 0.01 }
    );

    observer.observe(el);
    return () => { 
      observer.disconnect(); 
      stopTicking(); 
    };
  }, [carouselImages.length, scheduleNextSlide]);

  // Manual navigation handlers
  const handlePrevImage = (e) => {
    if (e) e.stopPropagation();
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    isTransitioningRef.current = true;
    setIsSliding(true);
    // When at index 0 go backwards to the last real image.
    setTrackIndex(prev => (prev <= 0 ? carouselImages.length - 1 : prev - 1));
  };

  const handleNextImage = (e) => {
    if (e) e.stopPropagation();
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    isTransitioningRef.current = true;
    setIsSliding(true);
    // Allow advancing into the clone (position N); handleTransitionEnd will reset.
    setTrackIndex(prev => Math.min(prev + 1, carouselImages.length));
  };

  const handleDotClick = (dotIdx) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (dotIdx === realIndex) {
      scheduleNextSlide(2000);
      return;
    }
    isTransitioningRef.current = true;
    setIsSliding(true);
    setTrackIndex(dotIdx);
  };

  // Desktop: Mouse down on image -> pause immediately
  const handleMouseDown = () => {
    if (carouselImages.length < 2) return;
    isUserHoldingRef.current = true;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  // Desktop: Mouse up or mouse leaves -> resume with 2s hold on current image
  const handleMouseUp = () => {
    if (carouselImages.length < 2) return;
    if (isUserHoldingRef.current) {
      isUserHoldingRef.current = false;
      if (!isTransitioningRef.current) {
        scheduleNextSlide(2000);
      }
    }
  };

  const handleMouseLeave = () => {
    if (carouselImages.length < 2) return;
    if (isUserHoldingRef.current) {
      isUserHoldingRef.current = false;
      if (!isTransitioningRef.current) {
        scheduleNextSlide(2000);
      }
    }
  };

  // Mobile: Touch and hold -> pause immediately
  const handleTouchStart = (e) => {
    if (carouselImages.length < 2) return;
    isUserHoldingRef.current = true;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (e.touches && e.touches[0]) {
      touchStartXRef.current = e.touches[0].clientX;
      touchStartYRef.current = e.touches[0].clientY;
    }
  };

  // Mobile: Finger released -> resume with 2s hold, or process horizontal swipe
  const handleTouchEnd = (e) => {
    if (carouselImages.length < 2) return;
    isUserHoldingRef.current = false;

    if (e.changedTouches && e.changedTouches[0]) {
      const deltaX = e.changedTouches[0].clientX - touchStartXRef.current;
      const deltaY = e.changedTouches[0].clientY - touchStartYRef.current;

      // Horizontal swipe threshold: > 40px and more horizontal than vertical
      if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX < 0) {
          handleNextImage(e);
          return;
        } else {
          handlePrevImage(e);
          return;
        }
      }
    }

    // Touch and hold release without swipe -> resume from current image after 2s
    if (!isTransitioningRef.current) {
      scheduleNextSlide(2000);
    }
  };

  const handleTouchCancel = () => {
    if (carouselImages.length < 2) return;
    isUserHoldingRef.current = false;
    if (!isTransitioningRef.current) {
      scheduleNextSlide(2000);
    }
  };

  const handleToggleExpand = () => {
    const nextState = !isExpanded;
    setIsExpanded(nextState);
    if (nextState) {
      trackEvent('read_expand', { ideaId: idea.id, title: idea.title });
    }
  };

  // Resolve related ideas
  const relatedIdeas = (idea.relatedIdeaSlugs || [])
    .map(slug => allIdeas.find(i => i.slug === slug))
    .filter(Boolean);

  // Category Color Badges
  const getCategoryClass = (cat) => {
    switch (cat?.toLowerCase()) {
      case 'online business':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/60';
      case 'digital business':
        return 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200/60 dark:border-purple-800/60';
      case 'home-based':
        return 'bg-orange-50 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300 border-orange-200/60 dark:border-orange-800/60';
      case 'education':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200/60 dark:border-amber-800/60';
      case 'offline business':
        return 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200/60 dark:border-rose-800/60';
      case 'e-commerce':
        return 'bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border-teal-200/60 dark:border-teal-800/60';
      default:
        return 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200/60 dark:border-sky-800/60';
    }
  };

  return (
    <article 
      id={`card-${idea.id}`} 
      className="snap-start w-full max-w-xl mx-auto py-2 px-3 sm:px-4 transition-all duration-300"
    >
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden p-4 sm:p-5 transition-colors">
        
        {/* Category Pill & Trust Badges */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span className={`text-xs font-bold px-3 py-1 rounded-full border ${getCategoryClass(idea.category)}`}>
            {idea.category}
          </span>
          <div className="flex items-center gap-1.5">
            {idea.trustBadges?.slice(0, 2).map((badge, bIdx) => (
              <span 
                key={bIdx}
                className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md"
              >
                <Sparkles className="w-2.5 h-2.5 text-teal-600 dark:text-teal-400" />
                {badge}
              </span>
            ))}
          </div>
        </div>

        {/* Main Title & Subtitle */}
        <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-snug tracking-tight mb-1">
          <SpokenWordHighlight
            text={idea.title}
            sectionKey="title"
            audioState={audioState}
            ideaId={idea.id}
          />
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
          <SpokenWordHighlight
            text={idea.subtitle}
            sectionKey="subtitle"
            audioState={audioState}
            ideaId={idea.id}
          />
        </p>

        {/* 16:9 Hero Image — Smooth Horizontal Sliding Carousel with 2s Hold & Touch/Click Pause */}
        <div 
          ref={carouselRef} 
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchCancel}
          className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 shadow-2xs select-none"
        >

          {/* Horizontal strip: all slides (+ clone) laid out side-by-side.
              Sliding the strip with translateX creates the physical movement effect. */}
          <div
            className="flex h-full"
            style={{
              width: `${totalSlides * 100}%`,
              transform: `translateX(-${(trackIndex / totalSlides) * 100}%)`,
              transition: isSliding ? 'transform 800ms cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none',
              willChange: 'transform',
            }}
            onTransitionEnd={handleTransitionEnd}
          >
            {slidesArray.map((img, i) => {
              const isLcp = index === 0 && i === 0;
              const optimizedUrl = getOptimizedImageUrl(img, { width: 720, quality: 75 });

              return (
                <div
                  key={i}
                  className="relative h-full"
                  style={{ width: `${100 / totalSlides}%`, flexShrink: 0 }}
                >
                  <Image
                    src={optimizedUrl}
                    alt={`${idea.title} showcase photo ${(i % carouselImages.length) + 1}`}
                    fill
                    priority={isLcp}
                    loading={isLcp ? 'eager' : 'lazy'}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 580px, 600px"
                    className="object-cover select-none pointer-events-none"
                    draggable={false}
                  />
                </div>
              );
            })}
          </div>

          {/* Carousel Controls — only shown when 2+ images exist */}
          {carouselImages.length > 1 && (
            <>
              <button
                onClick={handlePrevImage}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/75 text-white flex items-center justify-center backdrop-blur-xs transition-transform active:scale-90 z-10"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNextImage}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/75 text-white flex items-center justify-center backdrop-blur-xs transition-transform active:scale-90 z-10"
                aria-label="Next image"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Dot Indicators — reflect real image position (excludes clone) */}
              <div 
                className="absolute bottom-2.5 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1.5 z-10"
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
              >
                {carouselImages.map((_, dotIdx) => (
                  <button
                    key={dotIdx}
                    onClick={() => handleDotClick(dotIdx)}
                    className={`h-1.5 rounded-full transition-all ${
                      dotIdx === realIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/50'
                    }`}
                    aria-label={`Go to slide ${dotIdx + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Engagement Bar (Like, Share, Save, Listen) */}
        <EngagementBar 
          idea={idea} 
          onSaveChange={onSaveChange} 
          onShowToast={onShowToast} 
        />

        {/* 💡 Idea Breakdown Section (Accordion - Matches Reference Design) */}
        <div className="bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-100/90 dark:border-emerald-900/40 rounded-2xl p-3.5 sm:p-4 transition-all">
          <div 
            onClick={handleToggleExpand}
            className="flex items-center justify-between cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <span className="text-base">💡</span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                Idea Breakdown
              </h3>
            </div>
            <button 
              className="text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-white p-1 rounded-full"
              aria-label={isExpanded ? "Collapse breakdown" : "Expand breakdown"}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {/* Short Summary */}
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-2">
            <SpokenWordHighlight
              text={idea.breakdown?.summary || idea.subtitle}
              sectionKey="summary"
              audioState={audioState}
              ideaId={idea.id}
            />
          </p>

          {/* Collapsed "Read More →" Trigger */}
          {!isExpanded && (
            <button
              onClick={handleToggleExpand}
              className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 mt-2.5 transition-all"
            >
              <span>Read More</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {/* INLINE EXPANDED CONTENT (Zero Modals - Pushes Content Down Smoothly) */}
          {isExpanded && (
            <div className="mt-4 pt-3 border-t border-emerald-100/80 dark:border-emerald-900/40 space-y-5 animate-in fade-in duration-200">
              
              {/* 1. How It Works */}
              {idea.breakdown?.howItWorks && (
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider mb-2">
                    How it works:
                  </h4>
                  <ol className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 list-decimal list-inside leading-relaxed">
                    {idea.breakdown.howItWorks.map((hw, hIdx) => (
                      <li key={hIdx} className="pl-1">
                        <span className="font-medium">
                          <SpokenWordHighlight
                            text={typeof hw === 'string' ? hw.replace(/^\d+[.)\s]+/, '').trim() : hw}
                            sectionKey="howItWorks"
                            audioState={audioState}
                            ideaId={idea.id}
                          />
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* 2. Initial Investment, 3. Estimated Profit, 4. Payback Period */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs pt-1">
                <div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 p-2.5 rounded-xl shadow-2xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">Initial Investment</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400 text-sm">
                    <SpokenWordHighlight
                      text={idea.investment}
                      sectionKey="investment"
                      audioState={audioState}
                      ideaId={idea.id}
                    />
                  </span>
                </div>
                <div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 p-2.5 rounded-xl shadow-2xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">Estimated Profit</span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">
                    <SpokenWordHighlight
                      text={idea.estimatedProfit}
                      sectionKey="profit"
                      audioState={audioState}
                      ideaId={idea.id}
                    />
                  </span>
                </div>
                <div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 p-2.5 rounded-xl shadow-2xs col-span-2 sm:col-span-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">Payback Period</span>
                  <span className="font-bold text-teal-700 dark:text-teal-400 text-sm">
                    <SpokenWordHighlight
                      text={idea.paybackPeriod || "Instant"}
                      sectionKey="payback"
                      audioState={audioState}
                      ideaId={idea.id}
                    />
                  </span>
                </div>
              </div>

              {/* Startup Cost Planner (Interactive Budgeting) */}
              <BusinessTools idea={idea} />

              {/* In-Article Ad Unit 1: Inside Read More after Payback Period before Step-by-Step */}
              <AdUnit type="in-article" index={index} className="my-4" />

              {/* 6. Step-by-Step Implementation Guide */}
              {idea.implementationSteps?.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider">
                    Step-by-Step Implementation:
                  </h4>
                  <div className="space-y-2.5">
                    {idea.implementationSteps.map((st) => (
                      <div key={st.step} className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-xl p-3 shadow-2xs">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-extrabold text-[11px] flex items-center justify-center shrink-0">
                            {st.step}
                          </span>
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {st.title}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 pl-7 leading-relaxed">
                          {st.detail}
                        </p>
                        {st.proTip && (
                          <div className="mt-2 ml-7 bg-amber-50/70 dark:bg-amber-950/40 border-l-2 border-amber-400 dark:border-amber-600 p-2 rounded-r-lg text-[11px] text-amber-900 dark:text-amber-200">
                            <strong>💡 Pro Tip:</strong> {st.proTip}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 7. Risks & Reality Check */}
              {idea.risks?.length > 0 && (
                <div className="bg-rose-50/60 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 rounded-2xl p-4">
                  <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-bold text-xs mb-2">
                    <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                    <span>Risks & How to Avoid Them</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    {idea.risks.map((rk, rkIdx) => (
                      <div key={rkIdx} className="bg-white/80 dark:bg-slate-800/80 border border-rose-200/60 dark:border-rose-800/60 p-2.5 rounded-xl">
                        <span className="font-bold text-rose-900 dark:text-rose-300 block mb-0.5">⚠️ {rk.risk}</span>
                        <span className="text-slate-600 dark:text-slate-300 leading-relaxed">
                          <strong>Mitigation:</strong>{" "}
                          <SpokenWordHighlight
                            text={rk.mitigation}
                            sectionKey="risks"
                            audioState={audioState}
                            ideaId={idea.id}
                          />
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Trust Features: Last Updated, Credibility Card, Disclaimer */}
              <TrustFeatures idea={idea} />

              {/* 8. Related Ideas */}
              {relatedIdeas.length > 0 && (
                <div className="pt-2">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider mb-2">
                    Related Student Blueprints:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {relatedIdeas.map((rel) => (
                      <button
                        key={rel.id}
                        onClick={() => onNavigateToIdea && onNavigateToIdea(rel.slug)}
                        className="flex items-center gap-2.5 p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 hover:border-teal-400 dark:hover:border-teal-400 text-left transition-all shadow-2xs group"
                      >
                        <img 
                          src={getOptimizedImageUrl(rel.heroImage, { width: 120, quality: 75 })} 
                          alt={rel.title}
                          className="w-12 h-12 rounded-lg object-cover shrink-0" 
                          loading="lazy"
                          width={48}
                          height={48}
                        />
                        <div className="overflow-hidden">
                          <span className="text-[10px] font-semibold text-teal-700 dark:text-teal-400 block truncate">
                            {rel.category}
                          </span>
                          <span className="text-xs font-bold text-slate-900 dark:text-white block truncate group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">
                            {rel.title}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Bottom Toggle: "Read Less ↑" */}
              <button
                onClick={handleToggleExpand}
                className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 pt-2 transition-all"
              >
                <span>Read Less</span>
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* 2. Restored Original End-of-Article AdSense Placement */}
        <AdUnit type="in-article" index={index} className="mt-4" />
      </div>
    </article>
  );
}
