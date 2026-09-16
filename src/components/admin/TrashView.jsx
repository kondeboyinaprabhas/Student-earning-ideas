// src/components/admin/TrashView.jsx - Soft-Delete & Trash Recovery Center
'use client';

import { useState } from 'react';
import { 
  Trash2, RotateCcw, AlertTriangle, RefreshCw, 
  FileText, Mail, ShieldAlert, CheckCircle2, X 
} from 'lucide-react';
import { restoreSubmission, permanentDeleteSubmission } from '@/lib/firestoreStore';

export default function TrashView({
  trashIdeas = [],
  trashSubmissions = [],
  onRestoreIdea,
  onPermanentDeleteIdea,
  onRefresh,
  onLogAction,
  adminEmail = ''
}) {
  const [activeSubTab, setActiveSubTab] = useState('blueprints'); // 'blueprints' | 'submissions'
  const [permanentDeleteTarget, setPermanentDeleteTarget] = useState(null); // { type, id, title }

  const handleRestoreSub = async (sub) => {
    await restoreSubmission(sub.id);
    if (onLogAction) {
      onLogAction({
        action: 'Restore',
        entityId: sub.id,
        entityType: 'Submission',
        adminEmail,
        details: `Restored submission from ${sub.name || sub.email}`
      });
    }
    if (onRefresh) onRefresh();
  };

  const handlePermanentDeleteSub = async (id) => {
    await permanentDeleteSubmission(id);
    if (onLogAction) {
      onLogAction({
        action: 'Permanent Delete',
        entityId: id,
        entityType: 'Submission',
        adminEmail,
        details: `Permanently destroyed submission`
      });
    }
    setPermanentDeleteTarget(null);
    if (onRefresh) onRefresh();
  };

  const handleConfirmPermanentDelete = () => {
    if (!permanentDeleteTarget) return;
    if (permanentDeleteTarget.type === 'blueprint') {
      onPermanentDeleteIdea(permanentDeleteTarget.id);
    } else {
      handlePermanentDeleteSub(permanentDeleteTarget.id);
    }
    setPermanentDeleteTarget(null);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
            <Trash2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Trash & Soft-Delete Recovery
              <span className="bg-slate-800 text-slate-400 text-[10px] font-mono px-2 py-0.5 rounded-full">
                {trashIdeas.length + trashSubmissions.length} items in trash
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Recover accidentally deleted blueprints or user inquiries, or permanently purge them
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveSubTab('blueprints')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'blueprints'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Blueprints ({trashIdeas.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('submissions')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'submissions'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Submissions ({trashSubmissions.length})</span>
          </button>
        </div>
      </div>

      {/* Main List */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5">
        {activeSubTab === 'blueprints' ? (
          trashIdeas.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-slate-600 mx-auto" />
              <h3 className="text-sm font-bold text-slate-300">Trash is empty</h3>
              <p className="text-xs text-slate-500">No deleted blueprints currently in trash.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {trashIdeas.map((idea) => (
                <div
                  key={idea.id}
                  className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-200 text-sm">{idea.title}</span>
                      <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
                        {idea.category}
                      </span>
                    </div>
                    <div className="text-slate-400 text-[11px] truncate max-w-lg">
                      {idea.subtitle || idea.summary}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Deleted on: {idea.deletedAt ? new Date(idea.deletedAt).toLocaleString() : 'Recently'}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => onRestoreIdea(idea.id)}
                      className="bg-teal-600/20 hover:bg-teal-600 text-teal-300 hover:text-white border border-teal-500/30 px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restore</span>
                    </button>
                    <button
                      onClick={() => setPermanentDeleteTarget({ type: 'blueprint', id: idea.id, title: idea.title })}
                      className="bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/20 px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Forever</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          trashSubmissions.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-slate-600 mx-auto" />
              <h3 className="text-sm font-bold text-slate-300">Trash is empty</h3>
              <p className="text-xs text-slate-500">No deleted submissions currently in trash.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {trashSubmissions.map((sub) => (
                <div
                  key={sub.id}
                  className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-200 text-sm">
                        {sub.name || 'Anonymous Student'}
                      </span>
                      <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
                        {sub.type || 'Submission'}
                      </span>
                    </div>
                    <div className="text-slate-400 text-[11px] truncate max-w-lg">
                      {sub.title || sub.message}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {sub.email}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => handleRestoreSub(sub)}
                      className="bg-teal-600/20 hover:bg-teal-600 text-teal-300 hover:text-white border border-teal-500/30 px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restore</span>
                    </button>
                    <button
                      onClick={() => setPermanentDeleteTarget({ type: 'submission', id: sub.id, title: sub.name || sub.email })}
                      className="bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/20 px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Forever</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {/* Double Confirmation Modal for Permanent Delete */}
      {permanentDeleteTarget && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-500/40 rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Permanent Deletion</h3>
              <p className="text-xs text-rose-300/80 font-semibold mt-1">
                This action is irreversible.
              </p>
              <p className="text-xs text-slate-400 mt-2">
                Are you absolutely sure you want to permanently delete: <br />
                <strong className="text-white font-bold">{permanentDeleteTarget.title}</strong>?
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setPermanentDeleteTarget(null)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold py-2.5 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPermanentDelete}
                className="flex-1 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow-lg active:scale-95 cursor-pointer"
              >
                Permanently Purge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
