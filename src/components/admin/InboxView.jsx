// src/components/admin/InboxView.jsx - Complete Admin Inbox Management
'use client';

import { useState, useMemo } from 'react';
import { 
  Search, Filter, Mail, CheckCircle2, Clock, Archive, 
  Trash2, Download, Eye, ExternalLink, RefreshCw, X,
  ChevronDown, Calendar, Tag, User, MessageSquare, AlertCircle,
  FileSpreadsheet, FileCode, Check
} from 'lucide-react';
import { 
  SUBMISSION_STATUS, 
  updateSubmissionStatus, 
  markSubmissionRead, 
  softDeleteSubmission,
  exportInboxAsCSV,
  exportInboxAsJSON
} from '@/lib/firestoreStore';

const STATUS_COLORS = {
  [SUBMISSION_STATUS.NEW]: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  [SUBMISSION_STATUS.IN_PROGRESS]: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  [SUBMISSION_STATUS.RESOLVED]: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  [SUBMISSION_STATUS.ARCHIVED]: 'bg-slate-700/50 text-slate-400 border-slate-700',
};

const TYPE_COLORS = {
  Contact: 'bg-teal-500/15 text-teal-300 border-teal-500/30',
  Feedback: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
  Blueprint: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
  Request: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
};

export default function InboxView({
  submissions = [],
  loading = false,
  onRefresh,
  onLogAction,
  adminEmail = ''
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [dateRangeFilter, setDateRangeFilter] = useState('ALL'); // 'ALL' | 'TODAY' | 'WEEK' | 'MONTH'
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [exporting, setExporting] = useState(false);
  const itemsPerPage = 15;

  // Filter and sort submissions
  const filteredSubmissions = useMemo(() => {
    let result = [...submissions].filter(s => !s.deleted);

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(s => 
        (s.name || '').toLowerCase().includes(q) ||
        (s.email || '').toLowerCase().includes(q) ||
        (s.title || '').toLowerCase().includes(q) ||
        (s.type || '').toLowerCase().includes(q) ||
        (s.message || '').toLowerCase().includes(q)
      );
    }

    // Status filter
    if (statusFilter !== 'ALL') {
      result = result.filter(s => s.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== 'ALL') {
      result = result.filter(s => (s.type || '').toLowerCase() === typeFilter.toLowerCase());
    }

    // Date range filter
    if (dateRangeFilter !== 'ALL') {
      const now = new Date();
      result = result.filter(s => {
        let itemDate;
        if (s.createdAt?.toDate) {
          itemDate = s.createdAt.toDate();
        } else if (s.createdAt?.seconds) {
          itemDate = new Date(s.createdAt.seconds * 1000);
        } else if (s.createdAt) {
          itemDate = new Date(s.createdAt);
        } else {
          return true;
        }

        const diffTime = now - itemDate;
        const diffDays = diffTime / (1000 * 60 * 60 * 24);

        if (dateRangeFilter === 'TODAY') return diffDays <= 1;
        if (dateRangeFilter === 'WEEK') return diffDays <= 7;
        if (dateRangeFilter === 'MONTH') return diffDays <= 30;
        return true;
      });
    }

    // Sort newest first
    result.sort((a, b) => {
      const dateA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
      const dateB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
      return dateB - dateA;
    });

    return result;
  }, [submissions, searchQuery, statusFilter, typeFilter, dateRangeFilter]);

  // Pagination slice
  const paginatedSubmissions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredSubmissions.slice(start, start + itemsPerPage);
  }, [filteredSubmissions, currentPage]);

  const totalPages = Math.ceil(filteredSubmissions.length / itemsPerPage) || 1;

  // Handlers
  const handleOpenDetail = async (sub) => {
    setSelectedSubmission(sub);
    if (!sub.read) {
      await markSubmissionRead(sub.id);
      if (onLogAction) {
        onLogAction({
          action: 'Marked Read',
          entityId: sub.id,
          entityType: 'Submission',
          adminEmail,
          details: `Read submission from ${sub.name || sub.email}`
        });
      }
      if (onRefresh) onRefresh();
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    await updateSubmissionStatus(id, newStatus);
    if (onLogAction) {
      onLogAction({
        action: 'Status Change',
        entityId: id,
        entityType: 'Submission',
        adminEmail,
        details: `Changed status to "${newStatus}"`
      });
    }
    if (selectedSubmission && selectedSubmission.id === id) {
      setSelectedSubmission(prev => ({ ...prev, status: newStatus }));
    }
    if (onRefresh) onRefresh();
  };

  const handleSoftDelete = async (id) => {
    await softDeleteSubmission(id);
    if (onLogAction) {
      onLogAction({
        action: 'Soft Delete',
        entityId: id,
        entityType: 'Submission',
        adminEmail,
        details: `Sent submission to trash`
      });
    }
    setDeleteConfirmId(null);
    if (selectedSubmission && selectedSubmission.id === id) {
      setSelectedSubmission(null);
    }
    if (onRefresh) onRefresh();
  };

  const formatDate = (dateField) => {
    if (!dateField) return 'Just now';
    try {
      let d;
      if (dateField.toDate) {
        d = dateField.toDate();
      } else if (dateField.seconds) {
        d = new Date(dateField.seconds * 1000);
      } else {
        d = new Date(dateField);
      }
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header & Export Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Mail className="w-5 h-5 text-teal-400" />
              Submissions Inbox
            </h2>
            <span className="bg-teal-500/20 text-teal-300 text-xs font-bold px-2.5 py-0.5 rounded-full border border-teal-500/30">
              {filteredSubmissions.length} items
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time feed of contact inquiries, blueprint proposals, student feedback, and support tickets
          </p>
        </div>

        {/* Controls & Export Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onRefresh}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors text-xs font-semibold flex items-center gap-1.5"
            title="Refresh submissions list"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={() => exportInboxAsCSV()}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl transition-all text-xs font-bold flex items-center gap-1.5"
            title="Export all submissions to CSV spreadsheet"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>CSV</span>
          </button>

          <button
            onClick={() => exportInboxAsJSON()}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl transition-all text-xs font-bold flex items-center gap-1.5"
            title="Export all submissions to JSON"
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
            placeholder="Search by Name, Title, Email, or Type..."
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
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 outline-none focus:border-teal-500 cursor-pointer"
          >
            <option value="ALL">Status: All</option>
            <option value={SUBMISSION_STATUS.NEW}>New</option>
            <option value={SUBMISSION_STATUS.IN_PROGRESS}>In Progress</option>
            <option value={SUBMISSION_STATUS.RESOLVED}>Resolved</option>
            <option value={SUBMISSION_STATUS.ARCHIVED}>Archived</option>
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
            className="bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 outline-none focus:border-teal-500 cursor-pointer"
          >
            <option value="ALL">Type: All</option>
            <option value="Contact">Contact</option>
            <option value="Feedback">Feedback</option>
            <option value="Blueprint">Blueprint</option>
            <option value="Request">Request</option>
          </select>

          {/* Date Range Filter */}
          <select
            value={dateRangeFilter}
            onChange={(e) => { setDateRangeFilter(e.target.value); setCurrentPage(1); }}
            className="bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 outline-none focus:border-teal-500 cursor-pointer"
          >
            <option value="ALL">Date: All Time</option>
            <option value="TODAY">Today (24h)</option>
            <option value="WEEK">This Week</option>
            <option value="MONTH">This Month</option>
          </select>
        </div>
      </div>

      {/* Submissions Table / Cards */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-400">Loading inbox submissions from Firestore...</p>
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-500 flex items-center justify-center mx-auto">
              <Mail className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-200">No submissions found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {searchQuery || statusFilter !== 'ALL' || typeFilter !== 'ALL'
                ? 'Try adjusting your filters or search keywords.'
                : 'New contact messages, suggestions, and blueprints will appear here in real-time.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-bold bg-slate-950/40">
                  <th className="py-3 px-4">Sender</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Title / Message</th>
                  <th className="py-3 px-3">Date / Time</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {paginatedSubmissions.map((sub) => {
                  const isUnread = !sub.read;
                  const statusClass = STATUS_COLORS[sub.status] || 'bg-slate-800 text-slate-400';
                  const typeClass = TYPE_COLORS[sub.type] || 'bg-slate-800 text-slate-300 border-slate-700';

                  return (
                    <tr 
                      key={sub.id} 
                      className={`hover:bg-slate-800/40 transition-colors group ${
                        isUnread ? 'bg-teal-950/20 font-semibold' : ''
                      }`}
                    >
                      {/* Sender */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          {isUnread && (
                            <span className="w-2 h-2 rounded-full bg-teal-400 flex-shrink-0 animate-pulse" />
                          )}
                          <div className="truncate max-w-[160px]">
                            <div className="text-slate-100 font-bold truncate">
                              {sub.name || 'Anonymous Student'}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono truncate">
                              {sub.email || 'No email provided'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="py-3.5 px-3">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${typeClass}`}>
                          {sub.type || 'Contact'}
                        </span>
                      </td>

                      {/* Title & Preview */}
                      <td className="py-3.5 px-3">
                        <button
                          onClick={() => handleOpenDetail(sub)}
                          className="text-left group-hover:text-teal-300 transition-colors block max-w-xs md:max-w-md"
                        >
                          <div className="font-bold text-slate-200 truncate">
                            {sub.title || sub.message?.slice(0, 40) || 'Untitled Submission'}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate">
                            {sub.message || 'No additional message text'}
                          </div>
                        </button>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-3 text-slate-400 whitespace-nowrap text-[11px]">
                        {formatDate(sub.createdAt)}
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <select
                          value={sub.status || SUBMISSION_STATUS.NEW}
                          onChange={(e) => handleUpdateStatus(sub.id, e.target.value)}
                          className={`text-[11px] font-bold px-2 py-1 rounded-lg border outline-none cursor-pointer ${statusClass}`}
                        >
                          <option value={SUBMISSION_STATUS.NEW} className="bg-slate-900 text-slate-200">New</option>
                          <option value={SUBMISSION_STATUS.IN_PROGRESS} className="bg-slate-900 text-slate-200">In Progress</option>
                          <option value={SUBMISSION_STATUS.RESOLVED} className="bg-slate-900 text-slate-200">Resolved</option>
                          <option value={SUBMISSION_STATUS.ARCHIVED} className="bg-slate-900 text-slate-200">Archived</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View Detail */}
                          <button
                            onClick={() => handleOpenDetail(sub)}
                            className="p-1.5 bg-slate-800 hover:bg-teal-600 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                            title="View Full Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Quick Resolve */}
                          {sub.status !== SUBMISSION_STATUS.RESOLVED && (
                            <button
                              onClick={() => handleUpdateStatus(sub.id, SUBMISSION_STATUS.RESOLVED)}
                              className="p-1.5 bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                              title="Mark as Resolved"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Soft Delete */}
                          <button
                            onClick={() => setDeleteConfirmId(sub.id)}
                            className="p-1.5 bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                            title="Send to Trash"
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

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <div>
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredSubmissions.length)} of {filteredSubmissions.length} submissions
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white rounded-lg transition-colors"
              >
                Previous
              </button>
              <span className="px-2 font-bold text-slate-200">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white rounded-lg transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Submission Detail Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${TYPE_COLORS[selectedSubmission.type] || 'bg-slate-800 text-slate-300'}`}>
                    {selectedSubmission.type || 'Submission'}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${STATUS_COLORS[selectedSubmission.status]}`}>
                    {selectedSubmission.status}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mt-2">
                  {selectedSubmission.title || 'Submission Details'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Received {formatDate(selectedSubmission.createdAt)}
                </p>
              </div>

              <button
                onClick={() => setSelectedSubmission(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sender Info Card */}
            <div className="bg-slate-950 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs border border-slate-800/80">
              <div>
                <span className="text-slate-500 font-bold block">Sender Name</span>
                <span className="text-slate-200 font-bold text-sm">
                  {selectedSubmission.name || 'Anonymous Student'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 font-bold block">Email Address</span>
                <a 
                  href={`mailto:${selectedSubmission.email}`}
                  className="text-teal-400 font-mono hover:underline truncate block"
                >
                  {selectedSubmission.email || 'No email provided'}
                </a>
              </div>
            </div>

            {/* Message Body */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400">Message / Content Body</label>
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs text-slate-200 leading-relaxed max-h-60 overflow-y-auto whitespace-pre-wrap">
                {selectedSubmission.message || 'No message text provided.'}
              </div>
            </div>

            {/* Workflow Actions */}
            <div className="border-t border-slate-800 pt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400">Workflow:</span>
                <button
                  onClick={() => handleUpdateStatus(selectedSubmission.id, SUBMISSION_STATUS.IN_PROGRESS)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                    selectedSubmission.status === SUBMISSION_STATUS.IN_PROGRESS 
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  In Progress
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedSubmission.id, SUBMISSION_STATUS.RESOLVED)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                    selectedSubmission.status === SUBMISSION_STATUS.RESOLVED 
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  Resolved
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedSubmission.id, SUBMISSION_STATUS.ARCHIVED)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                    selectedSubmission.status === SUBMISSION_STATUS.ARCHIVED 
                      ? 'bg-slate-700 text-white' 
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  Archive
                </button>
              </div>

              <div className="flex items-center gap-2">
                {selectedSubmission.email && (
                  <a
                    href={`mailto:${selectedSubmission.email}?subject=Re: ${encodeURIComponent(selectedSubmission.title || 'Your inquiry on Student Earning Ideas')}`}
                    className="bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-1.5"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Reply via Email</span>
                  </a>
                )}
                <button
                  onClick={() => setDeleteConfirmId(selectedSubmission.id)}
                  className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
                  title="Move to trash"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-500/30 rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Move to Trash?</h3>
              <p className="text-xs text-slate-400 mt-1">
                This item will be soft-deleted and moved to the Trash tab. You can restore it anytime.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold py-2.5 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSoftDelete(deleteConfirmId)}
                className="flex-1 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow-md active:scale-95"
              >
                Send to Trash
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
