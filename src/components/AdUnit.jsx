// AdUnit.jsx - Clean, AdSense-Safe Banner and Feed Containers
'use client';

import { useState } from 'react';
import { ExternalLink, Info, X } from 'lucide-react';

export default function AdUnit({ type = "in-article", index = 0, className = "" }) {
  const [collapsed, setCollapsed] = useState(false);

  if (collapsed) return null;

  if (type === "header-banner") {
    return (
      <div className={`w-full bg-gradient-to-r from-sky-50 via-slate-50 to-indigo-50 border border-slate-200/80 rounded-2xl p-3 my-2 shadow-2xs relative overflow-hidden ${className}`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="bg-slate-200/80 text-slate-700 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
              Ad
            </span>
            <div>
              <h5 className="text-xs font-bold text-slate-900 leading-tight">
                Grow Your Business with Google AdSense
              </h5>
              <p className="text-[10px] text-slate-500">Monetize your student side hustle</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://adsense.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
            >
              Learn More
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (type === "in-feed") {
    return (
      <div className={`w-full bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm relative my-4 ${className}`}>
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">Sponsored</span>
            <span>•</span>
            <span>Google AdSense</span>
          </div>
          <button
            onClick={() => setCollapsed(true)}
            className="text-slate-400 hover:text-slate-600 text-xs p-1"
            title="Hide ad"
            aria-label="Hide advertisement"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white text-2xl font-black shrink-0 shadow-inner">
            📈
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h4 className="text-sm font-bold text-slate-900 leading-snug">
              Build Your Future with Smart Investing & Digital Tools
            </h4>
            <p className="text-xs text-slate-600 mt-0.5">
              Start small from ₹100. Zero commission for student accounts on verified platforms.
            </p>
          </div>
          <a
            href="https://groww.in"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm active:scale-95 whitespace-nowrap"
          >
            Explore Free →
          </a>
        </div>
      </div>
    );
  }

  // Default: In-Article Ad unit
  return (
    <div className={`w-full bg-slate-50/80 border border-dashed border-slate-300 rounded-2xl p-3.5 my-4 relative ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] uppercase font-bold text-slate-400 bg-white border border-slate-200 px-1.5 py-0.5 rounded">
          Ad
        </span>
        <div className="flex items-center gap-1 text-[10px] text-slate-400">
          <Info className="w-3 h-3" />
          <span>Ads by Google</span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs font-bold text-slate-800">
            Learn Tech Skills & AI Free with Certification
          </div>
          <div className="text-[11px] text-slate-500">
            Special student cohorts for prompt engineering & web development.
          </div>
        </div>
        <a
          href="https://grow.google"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-semibold px-3 py-1.5 rounded-lg shrink-0 flex items-center gap-1 transition-colors"
        >
          <span>Visit</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}
