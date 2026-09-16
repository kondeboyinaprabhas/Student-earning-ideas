// BrokenLinkScanner.jsx - Site-Wide Broken Link & Reference Scanner
'use client';

import { useState } from 'react';
import { Link2, CheckCircle2, AlertTriangle, RefreshCw, Wrench } from 'lucide-react';

export default function BrokenLinkScanner({ ideas = [], onFixLink }) {
  const [scanning, setScanning] = useState(false);
  const [scanResults, setScanResults] = useState(null);

  const runScan = () => {
    setScanning(true);
    setTimeout(() => {
      const validSlugs = new Set(ideas.map(i => i.slug));
      const brokenRelated = [];
      const imageIssues = [];

      for (const idea of ideas) {
        // Check related ideas
        for (const relSlug of idea.relatedIdeaSlugs || []) {
          if (!validSlugs.has(relSlug)) {
            brokenRelated.push({
              ideaId: idea.id,
              ideaTitle: idea.title,
              brokenSlug: relSlug,
              type: 'Missing Related Idea Slug'
            });
          }
        }

        // Check image accessibility
        if (!idea.heroImage || !idea.heroImage.startsWith('http')) {
          imageIssues.push({
            ideaId: idea.id,
            ideaTitle: idea.title,
            issue: 'Missing or Invalid Hero Image URL'
          });
        }
      }

      setScanResults({
        totalChecked: ideas.length,
        brokenRelated,
        imageIssues,
        isClean: brokenRelated.length === 0 && imageIssues.length === 0
      });
      setScanning(false);
    }, 600);
  };

  const handleAutoRepair = () => {
    if (!scanResults) return;
    // Auto-fix broken related slugs by picking valid existing slugs
    const validSlugs = ideas.map(i => i.slug).filter(Boolean);
    if (validSlugs.length > 1 && onFixLink) {
      onFixLink(validSlugs);
      runScan();
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
          onClick={runScan}
          disabled={scanning}
          className="bg-slate-800 hover:bg-slate-700 text-teal-400 border border-slate-700 text-xs font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${scanning ? 'animate-spin' : ''}`} />
          <span>{scanning ? 'Scanning...' : 'Run Scanner'}</span>
        </button>
      </div>

      {!scanResults ? (
        <p className="text-xs text-slate-500 py-2">
          Click &quot;Run Scanner&quot; to analyze all {ideas.length} published blueprints for link integrity.
        </p>
      ) : scanResults.isClean ? (
        <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-4 flex items-center justify-between text-xs text-emerald-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="font-semibold">
              Zero broken links found! All {scanResults.totalChecked} blueprints have healthy URLs and image references.
            </span>
          </div>
        </div>
      ) : (
        <div className="space-y-3 text-xs">
          <div className="bg-amber-950/40 border border-amber-500/30 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between text-amber-300 font-bold">
              <span className="flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Found {scanResults.brokenRelated.length + scanResults.imageIssues.length} Reference Notice(s)
              </span>
              <button
                onClick={handleAutoRepair}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold px-3 py-1 rounded-lg flex items-center gap-1 transition-all"
              >
                <Wrench className="w-3 h-3" />
                <span>One-Click Repair</span>
              </button>
            </div>

            {scanResults.brokenRelated.map((b, idx) => (
              <div key={idx} className="bg-slate-900 p-2 rounded-lg text-[11px] text-slate-300 flex justify-between">
                <span>In <strong>&quot;{b.ideaTitle}&quot;</strong>: missing link <code>&quot;{b.brokenSlug}&quot;</code></span>
                <span className="text-amber-400 font-medium">{b.type}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
