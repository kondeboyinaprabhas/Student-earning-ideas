// LiveMobilePreview.jsx - Real-Time Smartphone Frame Mockup
'use client';

import { Smartphone, RotateCw } from 'lucide-react';
import IdeaCard from '../IdeaCard';

export default function LiveMobilePreview({ ideaData, allIdeas = [] }) {
  // Normalize idea data with defaults for live rendering
  const previewIdea = {
    id: ideaData.id || "preview-live",
    slug: ideaData.slug || "preview-idea",
    title: ideaData.title || "Your Earning Idea Title Will Appear Here",
    subtitle: ideaData.subtitle || "Your compelling subtitle and overview description will appear here in the live feed.",
    category: ideaData.category || "Online Business",
    categoryColor: ideaData.categoryColor || "emerald",
    trustBadges: ideaData.trustBadges?.length ? ideaData.trustBadges : ["Verified Blueprint", "Student Friendly"],
    heroImage: ideaData.heroImage || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80",
    carouselImages: ideaData.carouselImages?.length ? ideaData.carouselImages : [ideaData.heroImage || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80"],
    likes: typeof ideaData.likes === 'number' ? ideaData.likes : 0,
    shares: typeof ideaData.shares === 'number' ? ideaData.shares : 0,
    saves: typeof ideaData.saves === 'number' ? ideaData.saves : 0,
    investment: ideaData.investment || "₹0–₹500",
    estimatedProfit: ideaData.estimatedProfit || "₹15,000–₹40,000 / mo",
    profitMargin: ideaData.profitMargin || "40–80%",
    paybackPeriod: ideaData.paybackPeriod || "7 Days",
    difficulty: ideaData.difficulty || "Beginner",
    timeRequired: ideaData.timeRequired || "1–2 hrs / day",
    tags: ideaData.tags || ["Online", "Beginner"],
    lastUpdated: "Live Preview",
    credibility: {
      verifiedBy: "Student Earning Ideas Editorial Desk",
      methodology: "Simulated Live Mobile Preview Mode",
      confidenceScore: "100% Interactive"
    },
    disclaimer: "Real-time preview mode simulates actual smartphone viewport and inline accordion expansion.",
    breakdown: {
      summary: ideaData.summary || ideaData.breakdown?.summary || "Summary breakdown will display here. Tap Read More to expand all steps, tools, and calculators.",
      howItWorks: (Array.isArray(ideaData.howItWorks) && ideaData.howItWorks.length)
        ? ideaData.howItWorks.map(h => typeof h === 'string' ? h.replace(/^\d+[.)\s]+/, '').trim() : h).filter(Boolean)
        : (ideaData.breakdown?.howItWorks?.length
            ? ideaData.breakdown.howItWorks.map(h => typeof h === 'string' ? h.replace(/^\d+[.)\s]+/, '').trim() : h).filter(Boolean)
            : [
                "Understand student customer demand and identify a niche.",
                "Set up free digital tools and create initial proof of concept.",
                "Connect with buyers and collect direct UPI payments."
              ])
    },
    implementationSteps: ideaData.implementationSteps?.length ? ideaData.implementationSteps : [
      { step: 1, title: "Initial Setup Phase", detail: "Description of first step.", proTip: "Pro tip preview." },
      { step: 2, title: "Outreach & Launch", detail: "Description of second step.", proTip: "Execution tip." }
    ],
    calculator: ideaData.calculator || {
      unitLabel: "Items / Clients Per Month",
      defaultUnits: 20,
      minUnits: 2,
      maxUnits: 100,
      avgProfitPerUnit: 500,
      currency: "₹"
    },
    startupPlanner: ideaData.startupPlanner || [
      { item: "Essential Free Tools", cost: 0, isFree: true, essential: true },
      { item: "Sample / Domain (Optional)", cost: 499, isFree: false, essential: false }
    ],
    checklist: ideaData.checklist || [
      { id: "p1", text: "Preview task 1 from checklist", completed: false },
      { id: "p2", text: "Preview task 2 from checklist", completed: false }
    ],
    relatedIdeaSlugs: []
  };

  return (
    <div className="flex flex-col items-center sticky top-6">
      {/* Phone Header Indicator */}
      <div className="flex items-center justify-between w-full max-w-[380px] px-2 mb-2 text-xs text-slate-400">
        <div className="flex items-center gap-1.5 font-bold text-slate-300">
          <Smartphone className="w-4 h-4 text-teal-400" />
          <span>Live iPhone / Mobile Frame</span>
        </div>
        <span className="text-[10px] bg-slate-800 text-teal-300 px-2 py-0.5 rounded-full font-mono">
          390 × 844 px
        </span>
      </div>

      {/* Realistic Mobile Device Frame */}
      <div className="w-full max-w-[380px] h-[780px] bg-slate-900 rounded-[48px] p-3 shadow-2xl border-4 border-slate-700 flex flex-col relative overflow-hidden">
        {/* Notch / Dynamic Island */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-950 rounded-full z-30 flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-900" />
        </div>

        {/* Mobile Viewport Screen */}
        <div className="w-full h-full bg-slate-100 rounded-[36px] overflow-y-auto overflow-x-hidden pt-6 pb-8 scrollbar-none flex flex-col">
          {/* Mock Browser Status Bar */}
          <div className="px-5 py-2 flex items-center justify-between text-[11px] font-bold text-slate-800 bg-white/80 backdrop-blur-xs border-b border-slate-200/60 sticky top-0 z-20">
            <span>9:41</span>
            <div className="flex items-center gap-1.5 text-[10px]">
              <span>5G</span>
              <span>100%</span>
            </div>
          </div>

          {/* Render Actual Real Card inside phone */}
          <div className="flex-1 py-2">
            <IdeaCard
              idea={previewIdea}
              index={0}
              allIdeas={allIdeas}
            />
          </div>

          {/* Bottom Home Indicator bar */}
          <div className="w-32 h-1 bg-slate-400/80 rounded-full mx-auto my-1 shrink-0" />
        </div>
      </div>
    </div>
  );
}
