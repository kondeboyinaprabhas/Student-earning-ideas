// src/components/admin/BlueprintsListView.jsx - Complete Blueprints & Draft/Publish Workflow
'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, Filter, Plus, Edit3, Eye, Trash2, History, 
  Send, Archive, RefreshCw, FileSpreadsheet, FileCode,
  Layers, CheckCircle2, Clock, Calendar, ChevronRight, X
} from 'lucide-react';
import { exportBlueprintsAsCSV, exportBlueprintsAsJSON } from '@/lib/firestoreStore';
import { CATEGORIES } from '@/lib/seedData';

export default function BlueprintsListView({
  publishedIdeas = [],
  draftIdeas = [],
  scheduledIdeas = [],
  onNewIdea,
  onEditIdea,
  onOpenVersions,
  onUnpublishIdea,
  onPublishDraft,
  onSoftDeleteIdea,
  onRefresh
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'PUBLISHED' | 'DRAFT' | 'SCHEDULED'
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [difficultyFilter, setDifficultyFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Combine blueprints with explicit status
  const allBlueprints = useMemo(() => {
    const pub = publishedIdeas.map(i => ({ ...i, status: 'Published' }));
    const dft = draftIdeas.map(i => ({ ...i, status: 'Draft' }));
    const sch = scheduledIdeas.map(i => ({ ...i, status: 'Scheduled' }));
    return [...pub, ...dft, ...sch];
  }, [publishedIdeas, draftIdeas, scheduledIdeas]);

  // Filtered list
  const filtered = useMemo(() => {
    let list = [...allBlueprints];

    // Status filter
    if (statusFilter !== 'ALL') {
      list = list.filter(i => i.status.toUpperCase() === statusFilter);
    }

    // Category filter
    if (categoryFilter !== 'ALL') {
      list = list.filter(i => i.category === categoryFilter);
    }

    // Difficulty filter
    if (difficultyFilter !== 'ALL') {
      list = list.filter(i => (i.difficulty || '').toLowerCase() === difficultyFilter.toLowerCase());
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(i => 
        (i.title || '').toLowerCase().includes(q) ||
        (i.subtitle || '').toLowerCase().includes(q) ||
        (i.category || '').toLowerCase().includes(q) ||
        (i.tags || []).some(t => t.toLowerCase().includes(q))
      );
    }

    return list;
  }, [allBlueprints, statusFilter, categoryFilter, difficultyFilter, searchQuery]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState(null);

  const handleConfirmDelete = () => {
    if (deleteConfirmTarget) {
      onSoftDeleteIdea(deleteConfirmTarget.id, deleteConfirmTarget.status === 'Published' ? 'published' : 'draft');
      setDeleteConfirmTarget(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-teal-400" />
              Blueprints Studio
            </h2>
            <span className="bg-teal-500/20 text-teal-300 text-xs font-bold px-2.5 py-0.5 rounded-full border border-teal-500/30">
              {allBlueprints.length} total
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage live feed blueprints, save & revise drafts, publish or unpublish without data loss
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onNewIdea}
            className="bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>New Blueprint</span>
          </button>

          <button
            onClick={() => exportBlueprintsAsCSV(allBlueprints)}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl transition-all text-xs font-bold flex items-center gap-1.5"
            title="Export blueprints to CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>CSV</span>
          </button>

          <button
            onClick={() => exportBlueprintsAsJSON(allBlueprints)}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl transition-all text-xs font-bold flex items-center gap-1.5"
            title="Export blueprints to JSON"
          >
            <FileCode className="w-3.5 h-3.5 text-amber-400" />
            <span>JSON</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            placeholder="Search blueprints by Title, Subtitle, Tags, Category..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-slate-200 placeholder-slate-500 outline-none focus:border-teal-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 outline-none focus:border-teal-500 cursor-pointer"
          >
            <option value="ALL">Status: All ({allBlueprints.length})</option>
            <option value="PUBLISHED">Published ({publishedIdeas.length})</option>
            <option value="DRAFT">Drafts ({draftIdeas.length})</option>
            <option value="SCHEDULED">Scheduled ({scheduledIdeas.length})</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
            className="bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 outline-none focus:border-teal-500 cursor-pointer"
          >
            <option value="ALL">Category: All</option>
            {CATEGORIES.filter(c => c !== 'All').map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={difficultyFilter}
            onChange={(e) => { setDifficultyFilter(e.target.value); setCurrentPage(1); }}
            className="bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 outline-none focus:border-teal-500 cursor-pointer"
          >
            <option value="ALL">Difficulty: All</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
      </div>

      {/* Blueprints Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Layers className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-slate-200">No blueprints match your filter</h3>
            <p className="text-xs text-slate-400">
              Try resetting your search query or status filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-bold bg-slate-950/40">
                  <th className="py-3 px-4">Blueprint Title</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Investment</th>
                  <th className="py-3 px-3">Monthly Profit</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {paginated.map((idea) => {
                  const isPublished = idea.status === 'Published';
                  const isDraft = idea.status === 'Draft';
                  const isScheduled = idea.status === 'Scheduled';

                  return (
                    <tr key={idea.id} className="hover:bg-slate-800/40 transition-colors">
                      {/* Title & Subtitle */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-200 max-w-sm truncate">
                          {idea.title || 'Untitled Blueprint'}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate max-w-sm">
                          {idea.subtitle || idea.summary}
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        {isPublished && (
                          <span className="inline-flex items-center gap-1 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            Published
                          </span>
                        )}
                        {isDraft && (
                          <span className="inline-flex items-center gap-1 bg-amber-500/15 text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                            <Clock className="w-3 h-3" />
                            Draft
                          </span>
                        )}
                        {isScheduled && (
                          <span className="inline-flex items-center gap-1 bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                            <Calendar className="w-3 h-3" />
                            Scheduled
                          </span>
                        )}
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-3 text-teal-400 font-semibold whitespace-nowrap">
                        {idea.category}
                      </td>

                      {/* Investment */}
                      <td className="py-3.5 px-3 text-emerald-400 font-mono font-bold whitespace-nowrap">
                        {idea.investment}
                      </td>

                      {/* Profit */}
                      <td className="py-3.5 px-3 text-slate-300 font-mono whitespace-nowrap">
                        {idea.estimatedProfit}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Preview Link */}
                          <Link
                            href={`/preview/${idea.id}`}
                            target="_blank"
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                            title="Preview Blueprint"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>

                          {/* Edit Button */}
                          <button
                            onClick={() => onEditIdea(idea)}
                            className="p-1.5 bg-slate-800 hover:bg-teal-700 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                            title="Edit Blueprint Details"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>


                          {/* Version History Button */}
                          <button
                            onClick={() => onOpenVersions(idea)}
                            className="p-1.5 bg-slate-800 hover:bg-amber-600 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                            title="Version History & Rollback"
                          >
                            <History className="w-3.5 h-3.5" />
                          </button>

                          {/* Publish / Unpublish Toggle */}
                          {isPublished ? (
                            <button
                              onClick={() => onUnpublishIdea(idea.id)}
                              className="p-1.5 bg-slate-800 hover:bg-amber-600 text-amber-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                              title="Unpublish (move to drafts without deleting)"
                            >
                              <Archive className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => onPublishDraft(idea)}
                              className="p-1.5 bg-slate-800 hover:bg-emerald-600 text-emerald-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                              title="Publish Live"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Soft Delete */}
                          <button
                            onClick={() => setDeleteConfirmTarget(idea)}
                            className="p-1.5 bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                            title="Move to Trash"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <div>
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length} blueprints
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white rounded-lg transition-colors cursor-pointer"
              >
                Previous
              </button>
              <span className="px-2 font-bold text-slate-200">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white rounded-lg transition-colors cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmTarget && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-500/30 rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Move to Trash?</h3>
              <p className="text-xs text-slate-400 mt-1">
                "<strong className="text-slate-200">{deleteConfirmTarget.title}</strong>" will be removed from the active list and sent to the Trash tab. You can restore it anytime.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmTarget(null)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
              >
                Move to Trash
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
