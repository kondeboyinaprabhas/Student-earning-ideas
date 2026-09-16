// IdeaCard.jsx - Snap-Scroll Idea Card with Dark Mode & Clean Image Indicators (Zero '16:9' Text)
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
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

  const handlePrevImage = (e) => {
    e.stopPropagation();
    setActiveImageIndex(prev => (prev === 0 ? carouselImages.length - 1 : prev - 1));
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    setActiveImageIndex(prev => (prev === carouselImages.length - 1 ? 0 : prev + 1));
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

        {/* 16:9 Hero Image with Multi-Image Carousel (Zero '16:9' text label) */}
        <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 group shadow-2xs">
          <img
            src={carouselImages[activeImageIndex]}
            alt={`${idea.title} showcase photo ${activeImageIndex + 1}`}
            className="w-full h-full object-cover select-none transition-transform duration-500 group-hover:scale-102"
            loading="lazy"
          />

          {/* Carousel Arrows (Swipe & Click Indicators) */}
          {carouselImages.length > 1 && (
            <>
              <button
                onClick={handlePrevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/75 text-white flex items-center justify-center backdrop-blur-xs transition-transform active:scale-90"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/75 text-white flex items-center justify-center backdrop-blur-xs transition-transform active:scale-90"
                aria-label="Next image"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Indicator Dots */}
              <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1.5">
                {carouselImages.map((_, dotIdx) => (
                  <button
                    key={dotIdx}
                    onClick={() => setActiveImageIndex(dotIdx)}
                    className={`h-1.5 rounded-full transition-all ${
                      dotIdx === activeImageIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/50'
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
                            text={hw}
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
                          src={rel.heroImage} 
                          alt={rel.title}
                          className="w-12 h-12 rounded-lg object-cover shrink-0" 
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
