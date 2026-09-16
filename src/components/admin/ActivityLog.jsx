// src/components/admin/ActivityLog.jsx - Admin Audit Trail & History
'use client';

import { useState } from 'react';
import { 
  History, User, Clock, ShieldCheck, RefreshCw, 
  PlusCircle, Edit3, Send, Archive, Trash2, RotateCcw, 
  CheckCircle2, FileText, Mail
} from 'lucide-react';

const ACTION_ICONS = {
  'Create': { icon: PlusCircle, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  'Edit': { icon: Edit3, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  'Publish': { icon: Send, color: 'text-teal-400 bg-teal-500/10 border-teal-500/20' },
  'Unpublish': { icon: Archive, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
  'Soft Delete': { icon: Trash2, color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
  'Permanent Delete': { icon: Trash2, color: 'text-rose-500 bg-rose-500/20 border-rose-500/40' },
  'Restore': { icon: RotateCcw, color: 'text-teal-400 bg-teal-500/10 border-teal-500/20' },
  'Status Change': { icon: CheckCircle2, color: 'text-sky-400 bg-sky-500/10 border-sky-500/20' },
  'Marked Read': { icon: Mail, color: 'text-slate-400 bg-slate-800 border-slate-700' },
};

export default function ActivityLog({
  activities = [],
  loading = false,
  onRefresh
}) {
  const [filterAction, setFilterAction] = useState('ALL');

  const filtered = activities.filter(act => {
    if (filterAction === 'ALL') return true;
    return (act.action || '').toLowerCase().includes(filterAction.toLowerCase());
  });

  const formatTimestamp = (ts) => {
    if (!ts) return 'Just now';
    try {
      let d;
      if (ts.toDate) d = ts.toDate();
      else if (ts.seconds) d = new Date(ts.seconds * 1000);
      else d = new Date(ts);

      return d.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Founder Audit Trail & Activity Log
              <span className="bg-slate-800 text-slate-400 text-[10px] font-mono px-2 py-0.5 rounded-full">
                {filtered.length} entries
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Immutable record of publishing, editorial revisions, status modifications, and deletions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 outline-none"
          >
            <option value="ALL">All Actions</option>
            <option value="Publish">Publish / Unpublish</option>
            <option value="Edit">Edits</option>
            <option value="Delete">Deletions</option>
            <option value="Restore">Restores</option>
            <option value="Status">Status Changes</option>
          </select>

          <button
            onClick={onRefresh}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors text-xs font-semibold"
            title="Refresh logs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Log Feed */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5">
        {loading ? (
          <div className="p-8 text-center space-y-2">
            <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-400">Loading audit trail...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No logged admin actions recorded yet.
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((item, idx) => {
              const config = ACTION_ICONS[item.action] || {
                icon: FileText,
                color: 'text-slate-400 bg-slate-800 border-slate-700'
              };
              const Icon = config.icon;

              return (
                <div
                  key={item.id || idx}
                  className="bg-slate-950 border border-slate-800/80 rounded-2xl p-3.5 flex items-start justify-between gap-3 text-xs hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-xl border flex-shrink-0 mt-0.5 ${config.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-200">
                          {item.action || 'Admin Event'}
                        </span>
                        <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-mono">
                          {item.entityType || 'Blueprint'}
                        </span>
                      </div>

                      <p className="text-slate-300 text-[11px]">
                        {item.details || item.entityId || 'Action processed'}
                      </p>

                      <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                        <User className="w-3 h-3 text-teal-500/70" />
                        <span>{item.adminEmail || 'Founder Admin'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right text-[11px] text-slate-500 whitespace-nowrap flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-600" />
                    <span>{formatTimestamp(item.timestamp)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
