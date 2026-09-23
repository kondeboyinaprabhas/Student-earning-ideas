// AnonymousAnalyticsView.jsx - Privacy-Friendly Telemetry Insights
'use client';

import { useState, useEffect } from 'react';
import { BarChart3, Search, Bookmark, Heart, Share2, Eye } from 'lucide-react';
import { getAnalyticsReport } from '@/lib/analytics';

export default function AnonymousAnalyticsView() {
  const [report, setReport] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setReport(getAnalyticsReport());
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  if (!report) return null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-5">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-teal-400" />
          <div>
            <h4 className="text-sm font-bold text-white">Anonymous Telemetry & Reader Insights</h4>
            <p className="text-[11px] text-slate-400">Zero PII collected • Fully privacy & GDPR compliant</p>
          </div>
        </div>
        <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
          Live Real-Time
        </span>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span>Likes Recorded</span>
            <Heart className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <span className="text-xl font-extrabold text-white">{report.likesCount}</span>
        </div>

        <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span>Ideas Bookmarked</span>
            <Bookmark className="w-3.5 h-3.5 text-teal-500" />
          </div>
          <span className="text-xl font-extrabold text-white">{report.savesCount}</span>
        </div>

        <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span>Blueprints Expanded</span>
            <Eye className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <span className="text-xl font-extrabold text-white">
            {report.readExpandsCount || (report.mostReadIdeas || []).reduce((acc, curr) => acc + curr[1], 0)}
          </span>
        </div>

        <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span>Shares Recorded</span>
            <Share2 className="w-3.5 h-3.5 text-sky-500" />
          </div>
          <span className="text-xl font-extrabold text-white">{report.sharesCount || 0}</span>
        </div>
      </div>

      {/* Top Search Keywords & Most Read Ideas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        {/* Keywords */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-slate-300 font-bold border-b border-slate-800 pb-2">
            <Search className="w-4 h-4 text-teal-400" />
            <span>Top Student Search Queries</span>
          </div>
          {report.topKeywords.length === 0 ? (
            <p className="text-[11px] text-slate-500 py-2">No queries logged yet.</p>
          ) : (
            <div className="space-y-1.5">
              {report.topKeywords.map(([kw, count], idx) => (
                <div key={idx} className="flex items-center justify-between text-slate-400 text-[11px]">
                  <span className="font-mono text-slate-200">&quot;{kw}&quot;</span>
                  <span className="bg-slate-800 px-2 py-0.5 rounded text-teal-300 font-bold">{count} searches</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Most Read */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-slate-300 font-bold border-b border-slate-800 pb-2">
            <Eye className="w-4 h-4 text-emerald-400" />
            <span>Most Expanded Blueprints</span>
          </div>
          {report.mostReadIdeas.length === 0 ? (
            <p className="text-[11px] text-slate-500 py-2">No expand events logged yet.</p>
          ) : (
            <div className="space-y-1.5">
              {report.mostReadIdeas.map(([id, count], idx) => (
                <div key={idx} className="flex items-center justify-between text-slate-400 text-[11px]">
                  <span className="text-slate-200 truncate max-w-[180px]">{id}</span>
                  <span className="bg-slate-800 px-2 py-0.5 rounded text-emerald-300 font-bold">{count} reads</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
