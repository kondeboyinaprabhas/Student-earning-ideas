// BusinessTools.jsx - Startup Cost Planner (Zero Fluff, 100% Student-Friendly)
'use client';

import { useState } from 'react';
import { Layers } from 'lucide-react';

export default function BusinessTools({ idea }) {
  // Startup Cost Planner state
  const [plannerItems, setPlannerItems] = useState(
    idea.startupPlanner || [
      { item: "Essential Free Tools (Canva, Notion)", cost: 0, isFree: true, essential: true },
      { item: "Smartphone / Laptop with Internet", cost: 0, isFree: true, essential: true },
      { item: "UPI / Payment Setup", cost: 0, isFree: true, essential: true }
    ]
  );
  const [selectedPlannerItems, setSelectedPlannerItems] = useState(
    plannerItems.map(p => p.essential)
  );

  const togglePlannerItem = (idx) => {
    const next = [...selectedPlannerItems];
    next[idx] = !next[idx];
    setSelectedPlannerItems(next);
  };

  const totalStartupCost = plannerItems.reduce((acc, curr, idx) => {
    return acc + (selectedPlannerItems[idx] ? curr.cost : 0);
  }, 0);

  return (
    <div className="space-y-4 pt-1">
      {/* Startup Cost Planner */}
      <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 rounded-2xl p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center text-teal-700 dark:text-teal-300">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Startup Cost Planner</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Free tools vs optional upgrades</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Cost</span>
            <span className="text-sm font-bold text-teal-700 dark:text-teal-400">
              {totalStartupCost === 0 ? "₹0 (100% Free)" : `₹${totalStartupCost.toLocaleString('en-IN')}`}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          {plannerItems.map((item, idx) => (
            <div
              key={idx}
              onClick={() => togglePlannerItem(idx)}
              className={`flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                selectedPlannerItems[idx]
                  ? 'bg-white dark:bg-slate-900 border-teal-200 dark:border-teal-700/60 shadow-2xs'
                  : 'bg-slate-100/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-400 line-through'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={selectedPlannerItems[idx]}
                  onChange={() => {}}
                  className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4 cursor-pointer"
                />
                <span className={`font-medium ${selectedPlannerItems[idx] ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400 dark:text-slate-600'}`}>
                  {item.item}
                </span>
              </div>
              <span className={`font-bold px-2 py-0.5 rounded-md text-[11px] ${
                item.isFree
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                  : 'bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}>
                {item.isFree ? "Free (₹0)" : `₹${item.cost}`}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
