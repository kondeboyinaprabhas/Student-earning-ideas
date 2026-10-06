// src/components/admin/CreatorTrackingManager.jsx - Creator Referral & Attribution Studio
'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Sparkles, Plus, Copy, Check, ExternalLink, Power,
  Trash2, RefreshCw, BarChart3, Users, MousePointerClick,
  Video, Camera, Send, Globe, AlertCircle, Loader2, Link2
} from 'lucide-react';
import { generateSafeSlug } from '@/lib/firestoreStore';
import { auth } from '@/lib/firebaseAuth';
import { getIdToken } from 'firebase/auth';

const PROD_ORIGIN = 'https://studentearningideas.in';

// ─── API helpers (talk to /api/admin/creator-referrals, which uses Firebase Admin SDK) ───

async function getAdminIdToken() {
  const user = auth?.currentUser;
  if (!user) throw new Error('Not authenticated');
  return getIdToken(user, /* forceRefresh= */ false);
}

async function apiRequest(method, body = null) {
  const token = await getAdminIdToken();
  const opts = {
    method,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };
  if (body !== null) opts.body = JSON.stringify(body);
  const res = await fetch('/api/admin/creator-referrals', opts);
  return res.json();
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CreatorTrackingManager({ showToast, adminEmail = 'Admin' }) {
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState(null);

  // Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [creatorName, setCreatorName] = useState('');
  const [platform, setPlatform] = useState('youtube');
  const [campaignName, setCampaignName] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [isSlugManual, setIsSlugManual] = useState(false);

  // ─── Data Loading ───────────────────────────────────────────────────────────

  const loadData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      const data = await apiRequest('GET');
      if (data.success) {
        setReferrals(data.referrals || []);
      } else {
        console.error('[CreatorTracking] Load error:', data.error);
        showToast?.(`Failed to load: ${data.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('[CreatorTracking] Load exception:', err);
      showToast?.('Failed to load creator referrals.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showToast]);

  useEffect(() => {
    // Wait for auth state to be ready before loading
    const user = auth?.currentUser;
    if (user) {
      loadData();
    } else if (auth) {
      // If auth hasn't resolved yet, wait for onAuthStateChanged
      const { onAuthStateChanged } = require('firebase/auth');
      const unsub = onAuthStateChanged(auth, (u) => {
        if (u) {
          loadData();
          unsub();
        }
      });
      return () => unsub();
    }
  }, [loadData]);

  // Auto-generate slug when creator name or campaign changes
  useEffect(() => {
    if (!isSlugManual) {
      const combined = campaignName ? `${creatorName}-${campaignName}` : creatorName;
      setCustomSlug(generateSafeSlug(combined));
    }
  }, [creatorName, campaignName, isSlugManual]);

  // ─── Form handlers ──────────────────────────────────────────────────────────

  const handleSlugChange = (e) => {
    setIsSlugManual(true);
    setCustomSlug(generateSafeSlug(e.target.value));
  };

  const handleResetForm = () => {
    setCreatorName('');
    setPlatform('youtube');
    setCampaignName('');
    setCustomSlug('');
    setIsSlugManual(false);
    setShowAddForm(false);
  };

  const handleCreateReferral = async (e) => {
    e.preventDefault();
    if (!creatorName.trim()) {
      showToast?.('Creator name is required.');
      return;
    }

    setSaving(true);
    try {
      const res = await apiRequest('POST', {
        creatorName,
        platform,
        campaignName,
        customSlug,
        createdBy: adminEmail,
      });

      if (res.success) {
        showToast?.(`Creator link created! Slug: /r/${res.slug}`);
        handleResetForm();
        await loadData(true);
      } else {
        showToast?.(`Error: ${res.error || 'Could not create referral'}`);
      }
    } catch (err) {
      showToast?.(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (item) => {
    try {
      const res = await apiRequest('PATCH', { id: item.id, action: 'toggle' });
      if (res.success) {
        setReferrals((prev) =>
          prev.map((r) => (r.id === item.id ? { ...r, active: res.newStatus } : r))
        );
        showToast?.(res.newStatus ? 'Referral link activated.' : 'Referral link paused.');
      } else {
        showToast?.(`Failed to toggle: ${res.error || 'Unknown error'}`);
      }
    } catch (err) {
      showToast?.(`Error: ${err.message}`);
    }
  };

  const handleDelete = async (item) => {
    const ok = window.confirm(
      `Permanently delete referral tracking for "${item.creatorName}" (/r/${item.slug})? This cannot be undone.`
    );
    if (!ok) return;

    try {
      const res = await apiRequest('DELETE', { id: item.id });
      if (res.success) {
        setReferrals((prev) => prev.filter((r) => r.id !== item.id));
        showToast?.('Referral link deleted.');
      } else {
        showToast?.(`Failed to delete: ${res.error || 'Unknown error'}`);
      }
    } catch (err) {
      showToast?.(`Error: ${err.message}`);
    }
  };

  const handleCopyLink = (slug) => {
    const fullUrl = `${PROD_ORIGIN}/r/${slug}`;
    navigator.clipboard.writeText(fullUrl).then(() => {
      setCopiedSlug(slug);
      showToast?.('Referral link copied to clipboard!');
      setTimeout(() => setCopiedSlug(null), 2500);
    }).catch(() => {
      showToast?.('Copy failed — please copy manually.');
    });
  };

  // ─── Aggregated Stats ───────────────────────────────────────────────────────

  const totalActive = referrals.filter((r) => r.active).length;
  const totalClicks = referrals.reduce((sum, r) => sum + (r.totalClicks || 0), 0);
  const totalUnique = referrals.reduce((sum, r) => sum + (r.uniqueVisitors || 0), 0);

  // ─── Utilities ──────────────────────────────────────────────────────────────

  const getPlatformIcon = (plt) => {
    switch (plt) {
      case 'youtube': return <Video className="w-4 h-4 text-rose-500" />;
      case 'instagram': return <Camera className="w-4 h-4 text-pink-500" />;
      case 'telegram': return <Send className="w-4 h-4 text-sky-400" />;
      default: return <Globe className="w-4 h-4 text-indigo-400" />;
    }
  };

  const formatLastClick = (ts) => {
    if (!ts) return 'No clicks yet';
    try {
      // ts is millis from the API (already converted from Firestore Timestamp)
      const date = typeof ts === 'number' ? new Date(ts) : new Date(ts);
      return date.toLocaleDateString('en-IN', {
        month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });
    } catch {
      return 'Recently';
    }
  };

  const getReferralUrl = (slug) => `${PROD_ORIGIN}/r/${slug}`;

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* ── Top Header Card ─────────────────────────────────────────────────── */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <span className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
                <Sparkles className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight">Creator Referral &amp; Attribution</h2>
            </div>
            <p className="text-xs text-slate-400 max-w-xl">
              Create customized tracking links for YouTubers, Instagram creators, and campus ambassadors.
              Attribution is recorded server-side without changing the homepage experience.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => loadData(true)}
              disabled={refreshing}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all border border-slate-700 disabled:opacity-50"
              title="Refresh stats"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-indigo-400' : ''}`} />
            </button>

            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/20"
            >
              <Plus className="w-4 h-4" />
              {showAddForm ? 'Close Form' : 'New Creator Link'}
            </button>
          </div>
        </div>

        {/* KPI Stats Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800 flex items-center gap-3.5">
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <Power className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Active Links</p>
              <p className="text-2xl font-bold text-white tracking-tight">
                {totalActive} <span className="text-xs font-normal text-slate-500">/ {referrals.length}</span>
              </p>
            </div>
          </div>

          <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800 flex items-center gap-3.5">
            <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
              <MousePointerClick className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Total Clicks</p>
              <p className="text-2xl font-bold text-white tracking-tight">{totalClicks.toLocaleString()}</p>
            </div>
          </div>

          <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800 flex items-center gap-3.5">
            <div className="p-2.5 bg-sky-500/10 text-sky-400 rounded-xl border border-sky-500/20">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Unique Visitors</p>
              <p className="text-2xl font-bold text-white tracking-tight">{totalUnique.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Create Form (collapsible) ────────────────────────────────────────── */}
      {showAddForm && (
        <form
          onSubmit={handleCreateReferral}
          className="bg-slate-900 border border-indigo-500/30 rounded-2xl p-6 shadow-xl space-y-5 animate-in fade-in"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Add New Creator / Influencer Link
            </h3>
            <span className="text-xs text-slate-400">All fields are sanitized automatically</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Creator / Channel Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={creatorName}
                onChange={(e) => setCreatorName(e.target.value)}
                placeholder="e.g. Study With Rahul"
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Platform</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="youtube">YouTube</option>
                <option value="instagram">Instagram</option>
                <option value="telegram">Telegram</option>
                <option value="other">Other / Website</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Campaign / Video Name <span className="text-slate-500 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                placeholder="e.g. Top 5 Student Side Hustles"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Referral Slug <span className="text-slate-500 font-normal">(Auto-generated or custom)</span>
              </label>
              <div className="flex items-center">
                <span className="bg-slate-800 border border-r-0 border-slate-700 rounded-l-xl px-3 py-2.5 text-xs text-slate-400 select-none">
                  /r/
                </span>
                <input
                  type="text"
                  value={customSlug}
                  onChange={handleSlugChange}
                  placeholder="study-with-rahul"
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-r-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Live URL Preview */}
          <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="text-xs text-slate-400 shrink-0">Final Public URL:</span>
              <span className="text-xs font-mono text-indigo-300 truncate">
                {getReferralUrl(customSlug || '...')}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {customSlug && (
                <button
                  type="button"
                  onClick={() => handleCopyLink(customSlug)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-300 hover:border-indigo-500 hover:text-indigo-300 transition-colors"
                >
                  {copiedSlug === customSlug ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  Copy
                </button>
              )}
              <span className="text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                Collision safe
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleResetForm}
              className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center gap-2 transition-all shadow-md shadow-indigo-600/30 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {saving ? 'Creating Link...' : 'Create Referral Link'}
            </button>
          </div>
        </form>
      )}

      {/* ── Referrals List ───────────────────────────────────────────────────── */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm">
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-400" />
            Configured Creator Links ({referrals.length})
          </h3>
          <span className="text-xs text-slate-400">Clicks recorded server-side</span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-400 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-500" />
            <p className="text-xs">Loading creator referrals...</p>
          </div>
        ) : referrals.length === 0 ? (
          <div className="py-16 text-center text-slate-500 space-y-3">
            <AlertCircle className="w-8 h-8 mx-auto text-slate-600" />
            <p className="text-sm font-medium text-slate-400">No creator referral links yet.</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Click &quot;New Creator Link&quot; above to create your first trackable influencer URL.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {referrals.map((item) => {
              const fullUrl = getReferralUrl(item.slug);
              const isCopied = copiedSlug === item.slug;

              return (
                <div
                  key={item.id}
                  className={`p-4 sm:p-5 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 ${item.active ? 'hover:bg-slate-800/40' : 'bg-slate-950/40 opacity-75'
                    }`}
                >
                  {/* Left: Creator Info */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 shrink-0">
                        {getPlatformIcon(item.platform)}
                      </span>
                      <h4 className="text-sm font-bold text-white truncate">{item.creatorName}</h4>
                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md border ${item.active
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}
                      >
                        {item.active ? 'Active' : 'Paused'}
                      </span>
                    </div>

                    {item.campaignName && (
                      <p className="text-xs text-slate-400 truncate">
                        Campaign: <span className="text-slate-300 font-medium">{item.campaignName}</span>
                      </p>
                    )}

                    {/* URL row with Copy + Open buttons */}
                    <div className="flex items-center gap-2 pt-1 flex-wrap">
                      {/* Slug pill — click to copy */}
                      <button
                        onClick={() => handleCopyLink(item.slug)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-700 text-xs font-mono text-indigo-300 hover:border-indigo-500 transition-colors group"
                        title="Copy referral URL"
                      >
                        {isCopied ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-400" />
                        )}
                        <span>/r/{item.slug}</span>
                      </button>

                      {/* Explicit "Copy Link" button */}
                      <button
                        onClick={() => handleCopyLink(item.slug)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${isCopied
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-indigo-500 hover:text-indigo-300'
                          }`}
                        title={`Copy ${fullUrl}`}
                      >
                        {isCopied ? (
                          <><Check className="w-3 h-3" /> Copied!</>
                        ) : (
                          <><Link2 className="w-3 h-3" /> Copy Link</>
                        )}
                      </button>

                      {/* Open / Test link */}
                      <a
                        href={fullUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs text-slate-400 border border-slate-700 hover:text-sky-400 hover:border-sky-500/40 transition-colors bg-slate-800"
                        title={`Open ${fullUrl} in new tab`}
                      >
                        <ExternalLink className="w-3 h-3" />
                        Test
                      </a>
                    </div>

                    {/* Full URL display (small, truncated) */}
                    <p className="text-[10px] font-mono text-slate-600 truncate pl-0.5">{fullUrl}</p>
                  </div>

                  {/* Middle: Stats */}
                  <div className="flex items-center gap-6 sm:gap-8 border-t border-b md:border-t-0 md:border-b-0 border-slate-800/80 py-3 md:py-0 shrink-0">
                    <div>
                      <p className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Clicks</p>
                      <p className="text-lg font-bold text-white">{(item.totalClicks || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Unique</p>
                      <p className="text-lg font-bold text-sky-400">{(item.uniqueVisitors || 0).toLocaleString()}</p>
                    </div>
                    <div className="hidden sm:block">
                      <p className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Last Click</p>
                      <p className="text-xs text-slate-300 font-medium">{formatLastClick(item.lastClickAt)}</p>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    <button
                      onClick={() => handleToggleStatus(item)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors flex items-center gap-1.5 ${item.active
                          ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        }`}
                      title={item.active ? 'Pause this referral link' : 'Activate this referral link'}
                    >
                      <Power className="w-3.5 h-3.5" />
                      {item.active ? 'Pause' : 'Activate'}
                    </button>

                    <button
                      onClick={() => handleDelete(item)}
                      className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all"
                      title="Delete referral link"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
