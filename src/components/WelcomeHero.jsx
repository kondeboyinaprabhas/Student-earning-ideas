// src/components/WelcomeHero.jsx - Welcome Blueprint Card Architecture (Permanent Platform Introduction)
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { 
  Compass, Sparkles, ChevronDown, ChevronUp, ArrowRight, 
  CheckCircle2, Download, Smartphone, Share, PlusSquare,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { WELCOME_HERO_IMAGE_DEFAULT } from '@/lib/firestoreStore';

/**
 * Welcome Blueprint Card – Permanent introduction to Student Earning Ideas.
 * Visually and structurally matches IdeaCard.jsx while remaining a permanent platform introduction.
 * Supports multiple images (carousel) configured by the admin in Firestore settings.
 * It is NOT an earning idea and never counts as Idea #1.
 */
export default function WelcomeHero({ config, onInstall, isStandalone, canInstallNative, isIos }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [showIosSheet, setShowIosSheet] = useState(false);
  const [showFallbackGuide, setShowFallbackGuide] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  if (!config || config.enabled === false || config.heroEnabled === false) {
    return null;
  }

  const title = config.title || 'Real Business Blueprints for Indian Students';
  const tagline = config.tagline || 'Learn practical earning ideas with complete step-by-step plans.';
  const description = config.description || 'Tested, actionable ways to earn in college with zero upfront capital. Every blueprint is reviewed for feasibility, realistic time commitments, and honest profit margins.';
  
  // Multi-image gallery with backward-compatible single-image fallback
  const rawImages = Array.isArray(config.images) && config.images.length > 0
    ? config.images.filter(Boolean)
    : [];
  const fallbackImage = config.imageUrl || config.heroImage || WELCOME_HERO_IMAGE_DEFAULT;
  const carouselImages = rawImages.length > 0 ? rawImages : [fallbackImage];

  const scrollHintText = config.scrollHintText || "Explore today's latest blueprints";
  const rawInstallText = config.installButtonText || '';
  const installButtonText = (rawInstallText && !rawInstallText.toLowerCase().includes('offline'))
    ? rawInstallText
    : 'Install Student Earning Ideas';

  const trustBadges = Array.isArray(config.trustBadges) && config.trustBadges.length > 0
    ? config.trustBadges
    : ['Zero Investment Options', 'Step-by-Step Plans', 'Action Tools', 'Regular Updates'];

  const handlePrevImage = (e) => {
    e?.stopPropagation();
    setCurrentSlide((prev) => (prev > 0 ? prev - 1 : carouselImages.length - 1));
  };

  const handleNextImage = (e) => {
    e?.stopPropagation();
    setCurrentSlide((prev) => (prev < carouselImages.length - 1 ? prev + 1 : 0));
  };

  const blueprintFeatures = [
    'Idea Breakdown & Target Audience',
    'How It Works Workflow',
    'Transparent Investment Plan',
    'Interactive Startup Cost Planner',
    'Step-by-Step Implementation Guide',
    'Risks & Honest Reality Check',
    'Profit Potential Calculations',
    'Essential Free Software Tools',
    'Action Checklist & Audio Readout'
  ];

  return (
    <article 
      id="welcome-blueprint-card" 
      className="snap-start w-full max-w-xl mx-auto py-2 px-3 sm:px-4 transition-all duration-300"
    >
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden p-4 sm:p-5 transition-colors">
        
        {/* Category Pill & Trust Badges */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span className="text-xs font-bold px-3 py-1 rounded-full border bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border-teal-200/60 dark:border-teal-800/60 inline-flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            Platform Blueprint
          </span>
          <div className="flex items-center gap-1.5">
            {trustBadges.slice(0, 2).map((badge, bIdx) => (
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

        {/* Main Title & Tagline */}
        <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-snug tracking-tight mb-1">
          {title}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
          {tagline}
        </p>

        {/* 16:9 Hero Image Showcase — Official LCP Element on Slide 0, with multi-image carousel support */}
        <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 shadow-2xs select-none mb-3">
          <div
            className="flex h-full w-full transition-transform duration-500 ease-out will-change-transform"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {carouselImages.map((img, i) => {
              const isLcp = i === 0;
              return (
                <div key={i} className="relative w-full h-full shrink-0">
                  <Image
                    src={img}
                    alt={`${title} blueprint photo ${i + 1}`}
                    fill
                    priority={isLcp}
                    loading={isLcp ? 'eager' : 'lazy'}
                    fetchPriority={isLcp ? 'high' : 'auto'}
                    decoding="async"
                    unoptimized={isLcp}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 580px, 600px"
                    className="object-cover select-none pointer-events-none"
                    draggable={false}
                  />
                </div>
              );
            })}
          </div>

          {/* Carousel Controls — visible only when multiple images exist */}
          {carouselImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrevImage}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/75 text-white flex items-center justify-center backdrop-blur-xs transition-transform active:scale-90 z-10 cursor-pointer"
                aria-label="Previous showcase photo"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNextImage}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/75 text-white flex items-center justify-center backdrop-blur-xs transition-transform active:scale-90 z-10 cursor-pointer"
                aria-label="Next showcase photo"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Dot Indicators */}
              <div 
                className="absolute bottom-2.5 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1.5 z-10"
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
              >
                {carouselImages.map((_, dotIdx) => (
                  <button
                    key={dotIdx}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentSlide(dotIdx);
                    }}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      dotIdx === currentSlide ? 'w-4 bg-white' : 'w-1.5 bg-white/50'
                    }`}
                    aria-label={`Go to slide ${dotIdx + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Introduction */}
        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
          {description}
        </p>

        {/* Trust Badges Ribbon */}
        <div className="flex flex-wrap gap-1.5 mb-3.5">
          {trustBadges.map((badge, idx) => (
            <span 
              key={idx} 
              className="inline-flex items-center gap-1 text-[10px] font-semibold bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200/50 dark:border-teal-800/50 px-2.5 py-1 rounded-lg"
            >
              <CheckCircle2 className="w-3 h-3 text-teal-600 dark:text-teal-400" />
              {badge}
            </span>
          ))}
        </div>

        {/* 💡 Blueprint Preview Section (Accordion matching IdeaCard's Idea Breakdown) */}
        <div className="bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-100/90 dark:border-emerald-900/40 rounded-2xl p-3.5 sm:p-4 transition-all">
          <div 
            onClick={() => setIsExpanded(prev => !prev)}
            className="flex items-center justify-between cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <span className="text-base">💡</span>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                Blueprint Architecture & Structure
              </h2>
            </div>
            <button 
              type="button"
              className="text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-white p-1 rounded-full"
              aria-label={isExpanded ? "Collapse blueprint preview" : "Expand blueprint preview"}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {/* Short Preview Intro */}
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-2">
            {config.blueprintPreviewText || "Every blueprint in our collection is thoroughly researched and comes structured with everything you need to start:"}
          </p>

          {/* Collapsed "Explore Sections →" Trigger */}
          {!isExpanded && (
            <button
              type="button"
              onClick={() => setIsExpanded(true)}
              className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 mt-2.5 transition-all"
            >
              <span>Explore Blueprint Sections</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {/* INLINE EXPANDED CONTENT */}
          {isExpanded && (
            <div className="mt-4 pt-3 border-t border-emerald-100/80 dark:border-emerald-900/40 space-y-4 animate-in fade-in duration-200">
              {/* 1. How It Works Summary */}
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider mb-1.5">
                  How our blueprints work:
                </h3>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {config.howItWorksSummary || "Browse verified blueprints, pick one matching your schedule and skills, use our calculators to budget, and follow actionable launch steps."}
                </p>
              </div>

              {/* 2. Key Metrics Preview */}
              <div className="grid grid-cols-3 gap-2 text-xs pt-1">
                <div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 p-2.5 rounded-xl shadow-2xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">Typical Capital</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400 text-xs sm:text-sm">
                    {config.investmentPreview || "₹0 – ₹1,000"}
                  </span>
                </div>
                <div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 p-2.5 rounded-xl shadow-2xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">Startup Model</span>
                  <span className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm truncate block" title={config.startupPreview}>
                    {config.startupPreview || "Zero-Inventory"}
                  </span>
                </div>
                <div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 p-2.5 rounded-xl shadow-2xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">Risk Profile</span>
                  <span className="font-bold text-teal-700 dark:text-teal-400 text-xs sm:text-sm">
                    {config.riskPreview || "Zero-Debt"}
                  </span>
                </div>
              </div>

              {/* 3. The 9 Core Elements */}
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider mb-2">
                  What every blueprint includes:
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-700 dark:text-slate-300">
                  {blueprintFeatures.map((feature, fIdx) => (
                    <div key={fIdx} className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700/60 p-2 rounded-lg">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                      <span className="text-[11px] font-medium text-slate-800 dark:text-slate-200">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 pt-1 transition-all"
              >
                <span>Collapse Preview</span>
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Permanent Install CTA — hidden when already running as standalone PWA */}
        {!isStandalone && (
          <div className="mt-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 rounded-2xl p-3 space-y-2.5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                  <Download className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {installButtonText}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">
                    Never miss the next earning idea.
                  </div>
                </div>
              </div>
              <button
                type="button"
                disabled={isInstalling}
                onClick={async () => {
                  if (isIos) {
                    setShowIosSheet(prev => !prev);
                    return;
                  }
                  setIsInstalling(true);
                  setShowFallbackGuide(false);
                  try {
                    const result = await onInstall?.();
                    if (result?.isIos) {
                      setShowIosSheet(true);
                    } else if (!result?.success && result?.outcome !== 'accepted') {
                      setShowFallbackGuide(true);
                    }
                  } finally {
                    setIsInstalling(false);
                  }
                }}
                className="shrink-0 bg-teal-600 hover:bg-teal-500 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all shadow-xs cursor-pointer"
              >
                {isInstalling ? 'Opening…' : 'Install App'}
              </button>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed">
              Get new earning ideas faster with one tap from your home screen.
            </p>

            {/* Browser menu fallback guide when native prompt is unavailable (e.g. localhost or browser without beforeinstallprompt) */}
            {showFallbackGuide && (
              <div className="bg-teal-50/90 dark:bg-teal-950/40 border border-teal-200/70 dark:border-teal-800/60 rounded-xl p-3 space-y-1 animate-in fade-in duration-200 text-left">
                <p className="text-xs font-bold text-teal-800 dark:text-teal-300">
                  Install is available from your browser menu.
                </p>
                <p className="text-[11px] text-teal-700/90 dark:text-teal-400/90 leading-relaxed">
                  Tap your browser menu (<strong>⋮</strong> or <strong>⋯</strong> in Chrome/Edge, or <strong>Share</strong> in Safari) and choose <strong>Install app</strong> or <strong>Add to Home screen</strong>.
                </p>
              </div>
            )}

            {/* iOS Add-to-Home-Screen inline guide */}
            {showIosSheet && (
              <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 space-y-2 animate-in fade-in duration-200">
                <p className="text-[11px] font-semibold text-teal-700 dark:text-teal-300 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5" />
                  How to install on iPhone / iPad
                </p>
                <ol className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="shrink-0 font-bold text-teal-600 dark:text-teal-400">1.</span>
                    <span>Tap the <strong className="text-slate-900 dark:text-white">Share</strong> icon <Share className="inline w-3.5 h-3.5 text-teal-500" /> in Safari.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="shrink-0 font-bold text-teal-600 dark:text-teal-400">2.</span>
                    <span>Tap <strong className="text-slate-900 dark:text-white">Add to Home Screen</strong> <PlusSquare className="inline w-3.5 h-3.5 text-teal-500" />.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="shrink-0 font-bold text-teal-600 dark:text-teal-400">3.</span>
                    <span>Tap <strong className="text-slate-900 dark:text-white">Add</strong>.</span>
                  </li>
                </ol>
              </div>
            )}
          </div>
        )}

        {/* Scroll CTA: 👇 Explore today's latest blueprints */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
          <a
            href="#feed"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-600 dark:text-teal-400 hover:text-teal-500 py-1.5 px-4 rounded-full bg-teal-50 dark:bg-teal-950/40 border border-teal-200/50 dark:border-teal-800/50 transition-all hover:scale-105 active:scale-95 shadow-2xs"
          >
            <span>👇 {scrollHintText}</span>
          </a>
        </div>
      </div>
    </article>
  );
}
