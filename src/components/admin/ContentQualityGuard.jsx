// ContentQualityGuard.jsx - Quality & Pre-Publish Validation Shield
'use client';

import { useMemo } from 'react';
import { ShieldCheck, ShieldAlert, CheckCircle2, AlertOctagon, Info } from 'lucide-react';
import { checkContentDuplication } from '@/lib/duplicateDetector';

export function runQualityGuardCheck(ideaData, existingIdeas = []) {
  const issues = [];
  let canPublish = true;

  // 1. Missing Title
  if (!ideaData.title || ideaData.title.trim().length < 5) {
    issues.push({ id: 'title', message: 'Title is required (at least 5 characters).', critical: true });
    canPublish = false;
  }

  // 2. Missing Subtitle
  if (!ideaData.subtitle || ideaData.subtitle.trim().length < 10) {
    issues.push({ id: 'subtitle', message: 'Subtitle / summary line is required.', critical: true });
    canPublish = false;
  }

  // 3. Missing Hero Image
  if (!ideaData.heroImage) {
    issues.push({ id: 'hero', message: '16:9 Hero Image is required before publishing.', critical: true });
    canPublish = false;
  }

  // 4. Missing Investment Data
  if (!ideaData.investment) {
    issues.push({ id: 'investment', message: 'Initial investment data must be specified (e.g. ₹0 or ₹500).', critical: true });
    canPublish = false;
  }

  // 5. Missing Checklist
  if (!ideaData.checklist || ideaData.checklist.length < 3) {
    issues.push({ id: 'checklist', message: 'Business Starter Checklist must have at least 3 actionable items.', critical: true });
    canPublish = false;
  }

  // 6. Missing Calculator
  if (!ideaData.calculator || !ideaData.calculator.unitLabel) {
    issues.push({ id: 'calculator', message: 'Earnings Calculator parameters must be configured.', critical: true });
    canPublish = false;
  }

  // 7. Missing SEO Fields
  if (!ideaData.seoTitle || !ideaData.metaDescription) {
    issues.push({ id: 'seo', message: 'SEO Title and Meta Description are required.', critical: true });
    canPublish = false;
  }

  // 8. Unrealistic Earning Claims (e.g. > ₹2,00,000 without verified flag)
  const earningsText = (ideaData.estimatedProfit || '').replace(/[^\d]/g, '');
  const numValue = parseInt(earningsText, 10);
  if (numValue > 200000) {
    issues.push({
      id: 'unrealistic',
      message: 'Earning claim exceeds ₹2,00,000/mo. Please ensure realistic student expectations or add caveat.',
      critical: false
    });
  }

  // 9. Article Content Length Check
  const totalLength = `${ideaData.breakdown?.summary || ''} ${JSON.stringify(ideaData.implementationSteps || '')}`.length;
  if (totalLength < 150) {
    issues.push({ id: 'short', message: 'Article content is too brief. Provide actionable step-by-step guidance.', critical: true });
    canPublish = false;
  }

  // 10. Duplicate Content Detection
  const dup = checkContentDuplication(ideaData, existingIdeas);
  if (dup.isDuplicate) {
    issues.push({
      id: 'duplicate',
      message: dup.message,
      critical: dup.level === 'critical'
    });
    if (dup.level === 'critical') canPublish = false;
  }

  return { canPublish, issues, duplicateReport: dup };
}

export default function ContentQualityGuard({ ideaData, existingIdeas = [] }) {
  const { canPublish, issues, duplicateReport } = useMemo(
    () => runQualityGuardCheck(ideaData, existingIdeas),
    [ideaData, existingIdeas]
  );

  return (
    <div className={`border rounded-3xl p-5 space-y-3 ${
      canPublish ? 'bg-slate-900 border-emerald-500/30' : 'bg-slate-900 border-rose-500/30'
    }`}>
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          {canPublish ? (
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          ) : (
            <ShieldAlert className="w-5 h-5 text-rose-400" />
          )}
          <h4 className="text-sm font-bold text-white">Content Quality Guard</h4>
        </div>
        <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
          canPublish
            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
        }`}>
          {canPublish ? 'Ready to Publish' : 'Action Required'}
        </span>
      </div>

      {issues.length === 0 ? (
        <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium py-1">
          <CheckCircle2 className="w-4 h-4" />
          <span>All 10 quality checks passed! High originality & completeness.</span>
        </div>
      ) : (
        <div className="space-y-1.5 text-xs">
          {issues.map((iss) => (
            <div
              key={iss.id}
              className={`p-2.5 rounded-xl border flex items-start gap-2 ${
                iss.critical
                  ? 'bg-rose-950/40 border-rose-800/60 text-rose-300'
                  : 'bg-amber-950/40 border-amber-800/60 text-amber-300'
              }`}
            >
              {iss.critical ? (
                <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              ) : (
                <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              )}
              <span className="leading-relaxed">
                <strong>{iss.critical ? 'Blocking Issue:' : 'Recommendation:'}</strong> {iss.message}
              </span>
            </div>
          ))}
        </div>
      )}

      {duplicateReport && duplicateReport.highestMatchTitle && (
        <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800 flex items-center justify-between">
          <span>Similarity with &quot;{duplicateReport.highestMatchTitle}&quot;:</span>
          <span className={`font-mono font-bold ${
            duplicateReport.score > 40 ? 'text-rose-400' : 'text-emerald-400'
          }`}>
            {duplicateReport.score}%
          </span>
        </div>
      )}
    </div>
  );
}
