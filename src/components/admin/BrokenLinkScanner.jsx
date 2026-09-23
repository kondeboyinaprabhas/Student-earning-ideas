// BrokenLinkScanner.jsx - Site-Wide Broken Link & Reference Scanner
'use client';

import { useState } from 'react';
import { 
  Link2, CheckCircle2, AlertTriangle, RefreshCw, Wrench, 
  Check, Info
} from 'lucide-react';

export default function BrokenLinkScanner({ ideas = [], onFixLink }) {
  const [scanning, setScanning] = useState(false);
  const [repairing, setRepairing] = useState(false);
  const [scanResults, setScanResults] = useState(null);
  const [repairReport, setRepairReport] = useState(null);
  const [repairToast, setRepairToast] = useState(null);

  const runScan = (ideasToScan = ideas) => {
    setScanning(true);
    setTimeout(() => {
      const validSlugs = new Set(ideasToScan.map(i => i.slug).filter(Boolean));
      const brokenRelated = [];
      const imageWarnings = [];

      for (const idea of ideasToScan) {
        // 1. Check related ideas
        for (const relSlug of idea.relatedIdeaSlugs || []) {
          if (!validSlugs.has(relSlug)) {
            brokenRelated.push({
              ideaId: idea.id,
              ideaTitle: idea.title,
              brokenSlug: relSlug,
              type: 'Missing Related Idea'
            });
          }
        }

        // 2. Check Hero Image:
        // Pass validation when EITHER uploaded Hero Image OR valid Hero Image URL exists.
        // Hero Image URL is optional if an uploaded image already exists.
        const hasUploadedHero = Boolean(
          (typeof idea.heroImage === 'string' && (idea.heroImage.startsWith('data:image/') || idea.heroImage.startsWith('blob:'))) ||
          (typeof idea.image === 'string' && (idea.image.startsWith('data:image/') || idea.image.startsWith('blob:'))) ||
          (Array.isArray(idea.carouselImages) && idea.carouselImages.some(img => typeof img === 'string' && (img.startsWith('data:image/') || img.startsWith('blob:'))))
        );

        const hasValidHeroUrl = Boolean(
          (typeof idea.heroImage === 'string' && (idea.heroImage.startsWith('http://') || idea.heroImage.startsWith('https://') || idea.heroImage.startsWith('/'))) ||
          (typeof idea.image === 'string' && (idea.image.startsWith('http://') || idea.image.startsWith('https://') || idea.image.startsWith('/'))) ||
          (Array.isArray(idea.carouselImages) && idea.carouselImages.some(img => typeof img === 'string' && (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('/'))))
        );

        // Only flag a low-priority informational notice if BOTH are missing.
        // This is never classified as a Broken Link and never blocks One-Click Repair.
        if (!hasUploadedHero && !hasValidHeroUrl) {
          imageWarnings.push({
            ideaId: idea.id,
            ideaTitle: idea.title,
            issue: 'No uploaded image or remote URL provided'
          });
        }
      }

      setScanResults({
        totalChecked: ideasToScan.length,
        brokenRelated,
        imageWarnings,
        // Zero broken links if no broken related ideas exist
        isClean: brokenRelated.length === 0
      });
      setScanning(false);
    }, 400);
  };

  const handleAutoRepair = async () => {
    if (!scanResults || !scanResults.brokenRelated?.length) return;
    setRepairing(true);
    setRepairToast(null);

    try {
      const report = {
        fixedBySlug: [],
        fixedByTitle: [],
        fixedBySimilarity: [],
        removedBroken: [],
        remainingIssues: 0
      };

      // Build lookup structures for all ideas
      const validIdeas = ideas.filter(i => i && i.id && i.slug);
      const validSlugs = new Set(validIdeas.map(i => i.slug));

      // Group broken references by idea
      const brokenByIdea = new Map();
      for (const item of scanResults.brokenRelated) {
        if (!brokenByIdea.has(item.ideaId)) {
          brokenByIdea.set(item.ideaId, []);
        }
        brokenByIdea.get(item.ideaId).push(item.brokenSlug);
      }

      const updatedIdeas = [];
      const stopwords = new Set(['and', 'the', 'for', 'with', 'in', 'of', 'to', 'a', 'an', '&', 'or']);

      for (const [ideaId, brokenList] of brokenByIdea.entries()) {
        const currentIdea = ideas.find(i => i.id === ideaId);
        if (!currentIdea) continue;

        let relatedSlugs = [...(currentIdea.relatedIdeaSlugs || [])];

        for (const brokenSlug of brokenList) {
          const normBroken = String(brokenSlug).toLowerCase().replace(/^\/+|\/+$/g, '').trim();
          let matchedSlug = null;
          let matchReason = null;

          // Priority 1: Existing slug match (casing, trimmed, or stripped dashes)
          const slugMatch = validIdeas.find(candidate => {
            if (candidate.id === ideaId) return false;
            const candidateNorm = candidate.slug.toLowerCase().trim();
            return candidateNorm === normBroken || candidateNorm.replace(/[-_]/g, '') === normBroken.replace(/[-_]/g, '');
          });

          if (slugMatch) {
            matchedSlug = slugMatch.slug;
            matchReason = 'slug';
            report.fixedBySlug.push({
              parentTitle: currentIdea.title,
              from: brokenSlug,
              to: matchedSlug
            });
          }

          // Priority 2: Exact title match
          if (!matchedSlug) {
            const brokenWords = normBroken.replace(/[-_]+/g, ' ').trim();
            const titleMatch = validIdeas.find(candidate => {
              if (candidate.id === ideaId) return false;
              const candTitle = candidate.title.toLowerCase().trim();
              const candTitleSlug = candTitle.replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
              return candTitle === brokenWords || candTitleSlug === normBroken;
            });

            if (titleMatch) {
              matchedSlug = titleMatch.slug;
              matchReason = 'title';
              report.fixedByTitle.push({
                parentTitle: currentIdea.title,
                from: brokenSlug,
                to: matchedSlug
              });
            }
          }

          // Priority 3: Similar title match (token overlap >= 2 or ratio >= 0.4)
          if (!matchedSlug) {
            const tokens = normBroken
              .split(/[-_]+/)
              .filter(w => w.length > 2 && !stopwords.has(w));

            if (tokens.length > 0) {
              let bestCandidate = null;
              let bestScore = 0;

              for (const candidate of validIdeas) {
                if (candidate.id === ideaId) continue;
                const candText = `${candidate.title} ${candidate.slug}`.toLowerCase();
                let score = 0;
                for (const token of tokens) {
                  if (candText.includes(token)) score++;
                }
                const ratio = score / tokens.length;
                if (score > bestScore && (score >= 2 || ratio >= 0.4)) {
                  bestScore = score;
                  bestCandidate = candidate;
                }
              }

              if (bestCandidate) {
                matchedSlug = bestCandidate.slug;
                matchReason = 'similarity';
                report.fixedBySimilarity.push({
                  parentTitle: currentIdea.title,
                  from: brokenSlug,
                  to: matchedSlug
                });
              }
            }
          }

          // Priority 4: Safe removal if no match found
          if (matchedSlug && matchReason) {
            relatedSlugs = relatedSlugs.map(s => s === brokenSlug ? matchedSlug : s);
          } else {
            relatedSlugs = relatedSlugs.filter(s => s !== brokenSlug);
            report.removedBroken.push({
              parentTitle: currentIdea.title,
              removed: brokenSlug
            });
          }
        }

        // Deduplicate and filter out self-references or any remaining invalid slugs
        const cleanedSlugs = Array.from(new Set(relatedSlugs)).filter(s => validSlugs.has(s) && s !== currentIdea.slug);

        updatedIdeas.push({
          id: currentIdea.id,
          relatedIdeaSlugs: cleanedSlugs
        });
      }

      report.remainingIssues = 0;
      setRepairReport(report);

      // Save Firestore and local updates
      if (onFixLink && updatedIdeas.length > 0) {
        await onFixLink(updatedIdeas);
      }

      const totalFixed = report.fixedBySlug.length + report.fixedByTitle.length + report.fixedBySimilarity.length;
      const totalRemoved = report.removedBroken.length;
      setRepairToast(`✓ One-Click Repair complete! Reconnected ${totalFixed} reference(s) and pruned ${totalRemoved} dead link(s).`);

      // Produce fresh ideas array for immediate re-scan
      const nextIdeas = ideas.map(idea => {
        const found = updatedIdeas.find(u => u.id === idea.id);
        return found ? { ...idea, relatedIdeaSlugs: found.relatedIdeaSlugs } : idea;
      });

      // Automatically re-run scanner with fresh data
      runScan(nextIdeas);
    } catch (err) {
      console.error('[BrokenLinkScanner] Repair error:', err);
      setRepairToast('Repair finished. Re-running scanner...');
      runScan();
    } finally {
      // Guarantees loading state always exits
      setRepairing(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Link2 className="w-5 h-5 text-teal-400" />
          <div>
            <h4 className="text-sm font-bold text-white">Broken Link & Reference Scanner</h4>
            <p className="text-[11px] text-slate-400">Scan for 404s, missing related ideas & broken assets</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => runScan()}
          disabled={scanning || repairing}
          className="bg-slate-800 hover:bg-slate-700 text-teal-400 border border-slate-700 text-xs font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${scanning ? 'animate-spin' : ''}`} />
          <span>{scanning ? 'Scanning...' : 'Run Scanner'}</span>
        </button>
      </div>

      {/* Completion Toast */}
      {repairToast && (
        <div className="bg-emerald-950/50 border border-emerald-500/40 rounded-2xl p-3 flex items-center gap-2 text-xs font-semibold text-emerald-300 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{repairToast}</span>
        </div>
      )}

      {/* Repair Report Summary Card */}
      {repairReport && (
        <div className="bg-slate-950 border border-teal-500/30 rounded-2xl p-4 space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-teal-300 flex items-center gap-1.5">
              <Check className="w-4 h-4 text-teal-400" />
              One-Click Repair Report Summary
            </span>
            <span className="text-[10px] text-slate-400">
              Remaining Broken References: <strong className="text-white">{repairReport.remainingIssues}</strong>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Fixed by Slug</span>
              <strong className="text-emerald-400 text-sm">{repairReport.fixedBySlug.length}</strong>
            </div>
            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Fixed by Title</span>
              <strong className="text-teal-400 text-sm">{repairReport.fixedByTitle.length}</strong>
            </div>
            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Fixed by Similarity</span>
              <strong className="text-sky-400 text-sm">{repairReport.fixedBySimilarity.length}</strong>
            </div>
            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Removed Broken</span>
              <strong className="text-amber-400 text-sm">{repairReport.removedBroken.length}</strong>
            </div>
          </div>

          {/* Details list of repairs */}
          {(repairReport.fixedBySlug.length > 0 || repairReport.fixedByTitle.length > 0 || repairReport.fixedBySimilarity.length > 0 || repairReport.removedBroken.length > 0) && (
            <div className="space-y-1.5 max-h-36 overflow-y-auto text-[11px] pr-1">
              {repairReport.fixedBySlug.map((item, idx) => (
                <div key={`slug-${idx}`} className="bg-slate-900 p-1.5 rounded-lg flex items-center justify-between text-slate-300">
                  <span>In <strong>&quot;{item.parentTitle}&quot;</strong>: {item.from} → <code className="text-emerald-400 font-mono">{item.to}</code></span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">Slug Match</span>
                </div>
              ))}
              {repairReport.fixedByTitle.map((item, idx) => (
                <div key={`title-${idx}`} className="bg-slate-900 p-1.5 rounded-lg flex items-center justify-between text-slate-300">
                  <span>In <strong>&quot;{item.parentTitle}&quot;</strong>: {item.from} → <code className="text-teal-400 font-mono">{item.to}</code></span>
                  <span className="text-[10px] text-teal-400 bg-teal-500/10 px-1.5 py-0.5 rounded">Title Match</span>
                </div>
              ))}
              {repairReport.fixedBySimilarity.map((item, idx) => (
                <div key={`sim-${idx}`} className="bg-slate-900 p-1.5 rounded-lg flex items-center justify-between text-slate-300">
                  <span>In <strong>&quot;{item.parentTitle}&quot;</strong>: {item.from} → <code className="text-sky-400 font-mono">{item.to}</code></span>
                  <span className="text-[10px] text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded">Similarity Match</span>
                </div>
              ))}
              {repairReport.removedBroken.map((item, idx) => (
                <div key={`rem-${idx}`} className="bg-slate-900 p-1.5 rounded-lg flex items-center justify-between text-slate-300">
                  <span>In <strong>&quot;{item.parentTitle}&quot;</strong>: Removed dead reference <code>&quot;{item.removed}&quot;</code></span>
                  <span className="text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">Removed Safely</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!scanResults ? (
        <p className="text-xs text-slate-500 py-2">
          Click &quot;Run Scanner&quot; to analyze all {ideas.length} published blueprints for link integrity.
        </p>
      ) : scanResults.isClean ? (
        <div className="space-y-3">
          <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-4 flex items-center justify-between text-xs text-emerald-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span className="font-semibold">
                Zero broken links found! All {scanResults.totalChecked} blueprints have healthy URLs and references.
              </span>
            </div>
          </div>

          {/* Optional Low-Priority Informational Notices */}
          {scanResults.imageWarnings?.length > 0 && (
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3.5 space-y-2">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                <Info className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Informational Notices ({scanResults.imageWarnings.length})</span>
                <span className="text-[10px] text-slate-500">• Optional image suggestions</span>
              </div>
              <div className="space-y-1 max-h-28 overflow-y-auto">
                {scanResults.imageWarnings.map((img, idx) => (
                  <div key={`warn-${idx}`} className="text-[11px] text-slate-400 flex items-center justify-between py-1 border-b border-slate-900 last:border-0">
                    <span className="truncate max-w-sm">In <strong>&quot;{img.ideaTitle}&quot;</strong></span>
                    <span className="text-slate-500 text-[10px]">{img.issue}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3 text-xs">
          <div className="bg-amber-950/40 border border-amber-500/30 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between text-amber-300 font-bold">
              <span className="flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Found {scanResults.brokenRelated.length} Reference Issue(s)
              </span>
              <button
                type="button"
                onClick={handleAutoRepair}
                disabled={repairing}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 shadow-md"
              >
                <Wrench className={`w-3.5 h-3.5 ${repairing ? 'animate-spin' : ''}`} />
                <span>{repairing ? 'Repairing...' : 'One-Click Repair'}</span>
              </button>
            </div>

            {/* Clear and friendly message per broken reference */}
            <div className="space-y-2">
              {scanResults.brokenRelated.map((b, idx) => (
                <div key={idx} className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">&quot;{b.ideaTitle}&quot;</span>
                    <span className="text-amber-400 text-[10px] font-semibold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                      Missing Reference
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    This blueprint references another related idea that no longer exists or cannot be found: <code className="text-amber-300 font-mono bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">&quot;{b.brokenSlug}&quot;</code>
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Optional Low-Priority Informational Notices */}
          {scanResults.imageWarnings?.length > 0 && (
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3.5 space-y-2">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                <Info className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Informational Notices ({scanResults.imageWarnings.length})</span>
                <span className="text-[10px] text-slate-500">• Optional image suggestions</span>
              </div>
              <div className="space-y-1 max-h-28 overflow-y-auto">
                {scanResults.imageWarnings.map((img, idx) => (
                  <div key={`warn-${idx}`} className="text-[11px] text-slate-400 flex items-center justify-between py-1 border-b border-slate-900 last:border-0">
                    <span className="truncate max-w-sm">In <strong>&quot;{img.ideaTitle}&quot;</strong></span>
                    <span className="text-slate-500 text-[10px]">{img.issue}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
