// LiveSeoIntelligence.jsx - Real-Time Search Engine Optimization Score & Heuristics
'use client';

import { useMemo } from 'react';
import { Search, CheckCircle2, AlertTriangle, XCircle, Sparkles } from 'lucide-react';

export default function LiveSeoIntelligence({ ideaData }) {
  const audit = useMemo(() => {
    const checks = [];
    let score = 100;

    // 1. Title length (ideal: 40–65 characters)
    const titleLen = ideaData.title?.length || 0;
    if (titleLen >= 35 && titleLen <= 65) {
      checks.push({ id: 'title', label: `Title length (${titleLen} chars)`, status: 'green', suggestion: 'Optimal length for Google search results.' });
    } else if (titleLen > 0) {
      score -= 15;
      checks.push({ id: 'title', label: `Title length (${titleLen} chars)`, status: 'yellow', suggestion: titleLen < 35 ? 'A bit short. Aim for 40–60 characters.' : 'Too long; may get truncated in SERPs.' });
    } else {
      score -= 30;
      checks.push({ id: 'title', label: 'Title is missing', status: 'red', suggestion: 'Add an engaging primary title with student keyword.' });
    }

    // 2. Meta description (ideal: 120–160 characters)
    const metaLen = ideaData.metaDescription?.length || ideaData.subtitle?.length || 0;
    if (metaLen >= 110 && metaLen <= 165) {
      checks.push({ id: 'meta', label: `Meta description (${metaLen} chars)`, status: 'green', suggestion: 'Perfect snippet length for mobile search.' });
    } else if (metaLen > 0) {
      score -= 10;
      checks.push({ id: 'meta', label: `Meta description (${metaLen} chars)`, status: 'yellow', suggestion: metaLen < 110 ? 'Expand description to at least 120 characters.' : 'Trim slightly below 160 characters.' });
    } else {
      score -= 20;
      checks.push({ id: 'meta', label: 'Meta description missing', status: 'red', suggestion: 'Provide meta description for search click-through rate.' });
    }

    // 3. Category & Keyword Presence
    const hasCategory = !!ideaData.category;
    if (hasCategory) {
      checks.push({ id: 'category', label: `Assigned Category: ${ideaData.category}`, status: 'green', suggestion: 'Correctly siloed for thematic site architecture.' });
    } else {
      score -= 15;
      checks.push({ id: 'category', label: 'Missing Category', status: 'red', suggestion: 'Select one of the 7 verified categories.' });
    }

    // 4. Hero Image & 16:9 Alt Text
    const hasHero = !!ideaData.heroImage;
    if (hasHero) {
      checks.push({ id: 'media', label: '16:9 Hero Media configured', status: 'green', suggestion: 'Rich Open Graph card & social share preview ready.' });
    } else {
      score -= 20;
      checks.push({ id: 'media', label: 'No hero image uploaded', status: 'red', suggestion: 'Upload a 16:9 hero image for visual search & social snippet.' });
    }

    // 5. Structured Data & Implementation Steps
    const stepCount = ideaData.implementationSteps?.length || 0;
    if (stepCount >= 4) {
      checks.push({ id: 'schema', label: `Schema.org HowTo Steps (${stepCount} steps)`, status: 'green', suggestion: 'Eligible for Google rich snippet carousels.' });
    } else {
      score -= 15;
      checks.push({ id: 'schema', label: `Only ${stepCount} action steps`, status: 'yellow', suggestion: 'Include at least 4-5 numbered implementation steps.' });
    }

    // 6. Internal Linking & Related Ideas
    const relCount = ideaData.relatedIdeaSlugs?.length || 0;
    if (relCount >= 2) {
      checks.push({ id: 'links', label: `${relCount} Related Ideas linked`, status: 'green', suggestion: 'Strong internal link equity for crawler retention.' });
    } else {
      score -= 10;
      checks.push({ id: 'links', label: 'Few internal links', status: 'yellow', suggestion: 'Link at least 2 related earning blueprints.' });
    }

    const finalScore = Math.max(10, Math.min(100, score));
    const scoreColor = finalScore >= 80 ? 'emerald' : finalScore >= 50 ? 'amber' : 'rose';

    return { score: finalScore, scoreColor, checks };
  }, [ideaData]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Search className="w-5 h-5 text-teal-400" />
          <h4 className="text-sm font-bold text-white">Live SEO Intelligence & Snippet Audit</h4>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-black px-3 py-1 rounded-full border ${
            audit.scoreColor === 'emerald'
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
              : audit.scoreColor === 'amber'
              ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
              : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
          }`}>
            SEO Score: {audit.score}/100
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${
            audit.scoreColor === 'emerald' ? 'bg-emerald-400' : audit.scoreColor === 'amber' ? 'bg-amber-400' : 'bg-rose-500'
          }`}
          style={{ width: `${audit.score}%` }}
        />
      </div>

      {/* Checklist items */}
      <div className="space-y-2 text-xs">
        {audit.checks.map((chk) => (
          <div
            key={chk.id}
            className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800"
          >
            {chk.status === 'green' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : chk.status === 'yellow' ? (
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <span className="font-bold text-slate-200 block">{chk.label}</span>
              <span className="text-slate-400 text-[11px]">{chk.suggestion}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
