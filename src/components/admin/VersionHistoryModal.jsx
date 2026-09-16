// VersionHistoryModal.jsx - Version History & 1-Click Rollback Modal
'use client';

import { useState, useEffect } from 'react';
import { History, RotateCcw, X, Clock, Check } from 'lucide-react';
import { getVersionHistory } from '@/lib/ideasStore';

export default function VersionHistoryModal({ isOpen, onClose, ideaId, onRollback }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (ideaId && isOpen) {
      const timer = setTimeout(() => {
        const records = getVersionHistory(ideaId);
        setHistory(records);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [ideaId, isOpen]);

  if (!isOpen) return null;

  const handleRevert = (snapshot) => {
    if (confirm('Are you sure you want to rollback to this previous version?')) {
      onRollback(snapshot);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-teal-400" />
            <h3 className="text-base font-bold text-white">Version History & Rollback</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {history.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500">
            No previous versions recorded for this idea yet. Every published update will automatically snapshot here.
          </div>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {history.map((ver, idx) => (
              <div
                key={ver.versionId}
                className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-200">
                      {idx === 0 ? "Current Version" : `Revision #${history.length - idx}`}
                    </span>
                    <span className="text-[10px] bg-slate-800 text-teal-300 font-mono px-2 py-0.5 rounded">
                      {new Date(ver.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px] mt-1 truncate max-w-xs">
                    Title: {ver.snapshot.title}
                  </p>
                </div>

                {idx > 0 && (
                  <button
                    onClick={() => handleRevert(ver.snapshot)}
                    className="bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 shrink-0 active:scale-95"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Rollback</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="pt-2 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold px-4 py-2 rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
