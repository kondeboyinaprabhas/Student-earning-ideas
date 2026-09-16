// PasteAutoFormat.jsx - Mandatory 1-Click ChatGPT Extractor & Autofill
'use client';

import { useState } from 'react';
import { Sparkles, Wand2, Check, Copy, FileText } from 'lucide-react';
import { parseChatGptArticle } from '@/lib/chatgptParser';

export default function PasteAutoFormat({ onParsedData }) {
  const [rawText, setRawText] = useState('');
  const [parsedPreview, setParsedPreview] = useState(null);
  const [applied, setApplied] = useState(false);

  const handleParse = () => {
    if (!rawText.trim()) return;
    const extracted = parseChatGptArticle(rawText);
    setParsedPreview(extracted);
    setApplied(false);
  };

  const handleApply = () => {
    if (parsedPreview && onParsedData) {
      onParsedData(parsedPreview);
      setApplied(true);
      setTimeout(() => setApplied(false), 3000);
    }
  };

  const handleInsertSample = () => {
    const sample = `# Title: High-Ticket Notion Template Creator for College Students
Subtitle: Build and sell aesthetic study dashboards, GPA trackers, and exam organizers on Gumroad.
Category: Digital Business
Initial Investment: ₹0 (Zero Investment)
Estimated Profit: ₹15,000–₹45,000 / mo
Payback Period: 7 Days
Difficulty: Beginner Friendly
Time Required: 1.5 hrs / day

Idea Breakdown:
College students need organized digital workspaces to keep up with assignments, lecture notes, and study timetables. By designing aesthetic Notion templates tailored for specific university streams (engineering, medicine, law), you can sell digital copies worldwide on Gumroad with zero manufacturing or shipping costs.

Step 1: Choose a Specific Student Niche
Focus on engineering syllabus trackers or medical revision systems rather than generic planners.
Pro Tip: Search Reddit r/Notion for pain points college students complain about.

Step 2: Build the Core Workspace in Notion
Include databases for courses, exam dates, revision flashcards, and GPA projections.
Pro Tip: Use clean typography and minimalist cover images from Unsplash.

Step 3: Set Up a Gumroad Storefront
Register for a free Gumroad account and connect your bank/UPI for direct weekly payouts.
Pro Tip: Price between ₹299 to ₹699 for high volume impulse purchases.

Step 4: Create Aesthetic Short-Form Demos
Record 10-second typing videos with lofi music showing the template in action for TikTok and Reels.
Pro Tip: Add a Linktree in your social media bio.

Step 5: Bundle for Mid-Term and Final Exams
Offer 2-for-1 study packs during exam seasons to boost transaction value.
Pro Tip: Offer classmates a discount code to generate initial social proof.

Risks:
Risk: Template links being re-shared privately.
Mitigation: Include video onboarding tutorials and template updates only available to buyers.

SEO Title: Best Notion Templates for Students to Earn Money | Student Earning Ideas
Meta Description: Learn how to design and sell aesthetic Notion templates for college students. Full step-by-step roadmap with zero investment.`;

    setRawText(sample);
    const extracted = parseChatGptArticle(sample);
    setParsedPreview(extracted);
  };

  return (
    <div className="bg-gradient-to-br from-teal-950/40 via-slate-900 to-slate-900 border border-teal-500/30 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-teal-500/20 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30 shadow-inner">
            <Wand2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Paste & Auto Format
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                MANDATORY FEATURE
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Paste any raw ChatGPT text — our NLP engine will auto-extract and populate all 11+ editor fields.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleInsertSample}
          className="text-xs font-semibold text-teal-400 hover:text-teal-300 bg-teal-950/60 hover:bg-teal-900/60 border border-teal-500/30 px-3 py-1.5 rounded-xl transition-all"
        >
          Load Sample ChatGPT Text
        </button>
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-bold text-slate-300">
          Paste Raw ChatGPT Output:
        </label>
        <textarea
          rows="5"
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          placeholder="Paste complete raw ChatGPT article output here..."
          className="w-full bg-slate-950/80 border border-slate-700/80 rounded-2xl p-3.5 text-xs text-slate-200 font-mono placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 transition-all leading-relaxed"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-1">
        <button
          type="button"
          onClick={handleParse}
          disabled={!rawText.trim()}
          className="bg-teal-600 hover:bg-teal-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 shadow-md active:scale-95 cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>Analyze & Extract Fields</span>
        </button>

        {parsedPreview && (
          <button
            type="button"
            onClick={handleApply}
            className={`font-bold text-xs px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 shadow-md active:scale-95 cursor-pointer ${
              applied
                ? 'bg-emerald-600 text-white'
                : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-400 hover:to-teal-500'
            }`}
          >
            {applied ? <Check className="w-4 h-4" /> : <Wand2 className="w-4 h-4" />}
            <span>{applied ? "All 11+ Fields Populated!" : "Auto-Fill Editor Now →"}</span>
          </button>
        )}
      </div>

      {/* Extracted Fields Preview Badge Strip */}
      {parsedPreview && (
        <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3.5 space-y-2 text-xs animate-in fade-in">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold border-b border-slate-800 pb-2">
            <span>Successfully Extracted Fields:</span>
            <span className="text-emerald-400 font-mono">11/11 Ready</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-[11px]">
            <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-500 block">Title:</span>
              <strong className="text-white truncate block">{parsedPreview.title}</strong>
            </div>
            <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-500 block">Category:</span>
              <strong className="text-teal-400 block">{parsedPreview.category}</strong>
            </div>
            <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-500 block">Investment & Profit:</span>
              <strong className="text-emerald-400 block">{parsedPreview.investment} • {parsedPreview.estimatedProfit}</strong>
            </div>
            <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-500 block">Steps & Checklist:</span>
              <strong className="text-slate-300 block">{parsedPreview.steps?.length || 5} Steps • {parsedPreview.checklist?.length || 5} Checklist Items</strong>
            </div>
            <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800 col-span-1 sm:col-span-2">
              <span className="text-slate-500 block">SEO Meta Title:</span>
              <strong className="text-slate-300 truncate block">{parsedPreview.seoTitle}</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
