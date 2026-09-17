// src/components/admin/AdminPushBroadcast.jsx - Founder Admin Push Broadcast Studio
'use client';

import { useState, useEffect } from 'react';
import { Send, Bell, Users, CheckCircle2, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { COLLECTIONS } from '@/lib/firestoreStore';

export default function AdminPushBroadcast({ adminEmail = 'kondeboyinaprabhas@gmail.com', showToast }) {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [url, setUrl] = useState('/');
  const [type, setType] = useState('announcement');
  const [isSending, setIsSending] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [loadingSubscribers, setLoadingSubscribers] = useState(true);
  const [lastResult, setLastResult] = useState(null);

  // Subscribe to real-time active subscriber count
  useEffect(() => {
    if (!db) return;

    try {
      const q = query(
        collection(db, COLLECTIONS.PUSH_SUBSCRIPTIONS || 'pushSubscriptions'),
        where('active', '==', true)
      );

      const unsub = onSnapshot(q, (snap) => {
        setSubscriberCount(snap.size);
        setLoadingSubscribers(false);
      }, (err) => {
        console.warn('[Push Broadcast] Subscriber count listener error:', err);
        setLoadingSubscribers(false);
      });

      return () => unsub();
    } catch (e) {
      setLoadingSubscribers(false);
    }
  }, []);

  const handleApplyTemplate = (templateType) => {
    if (templateType === 'idea') {
      setTitle('🔥 New Student Earning Blueprint Live!');
      setMessage('A brand-new zero-investment micro-startup guide with calculator and checklist was just published.');
      setUrl('/');
      setType('blueprint');
    } else if (templateType === 'resource') {
      setTitle('🛠️ New Recommended Student Tool Added!');
      setMessage('Discover a verified platform to automate client outreach and scale your freelancing.');
      setUrl('/#recommended-resources');
      setType('resource');
    } else {
      setTitle('📢 Weekly Student Founder Announcement');
      setMessage('New college micro-gigs and verified earning strategies have been updated for this week.');
      setUrl('/');
      setType('announcement');
    }
  };

  const handleSendPush = async (e) => {
    e.preventDefault();

    if (!title.trim() || !message.trim()) {
      alert('Please provide both a notification title and message.');
      return;
    }

    setIsSending(true);
    setLastResult(null);

    try {
      const res = await fetch('/api/admin/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          message: message.trim(),
          url: url.trim() || '/',
          type,
          adminEmail,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setLastResult({
          success: true,
          sentCount: data.sentCount,
          failedCount: data.failedCount,
          prunedCount: data.prunedCount,
          total: data.totalSubscribers,
        });
        if (showToast) {
          showToast(`🚀 Push sent to ${data.sentCount} subscriber${data.sentCount === 1 ? '' : 's'}!`);
        }
        // Reset inputs
        setTitle('');
        setMessage('');
        setUrl('/');
      } else {
        setLastResult({
          success: false,
          error: data.error || 'Failed to dispatch notifications.',
        });
      }
    } catch (err) {
      console.error('[Admin Push] Dispatch error:', err);
      setLastResult({
        success: false,
        error: err.message || 'Network error occurred.',
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" /> Web Push Dispatcher
            </div>
            <h1 className="text-xl font-bold text-white">Direct Push Broadcast Studio</h1>
            <p className="text-xs text-slate-400">
              Send instant device notifications to all subscribed students and college entrepreneurs.
            </p>
          </div>

          {/* Real-time Subscriber Pill */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex items-center gap-3.5 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-black text-white font-mono leading-none">
                {loadingSubscribers ? '...' : subscriberCount}
              </div>
              <div className="text-[11px] text-slate-400 font-medium mt-1 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Active Subscribers</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Templates */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Quick Fill Templates:</span>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleApplyTemplate('idea')}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-medium border border-slate-700/60 transition-colors cursor-pointer"
          >
            🔥 New Blueprint Live
          </button>
          <button
            type="button"
            onClick={() => handleApplyTemplate('resource')}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-medium border border-slate-700/60 transition-colors cursor-pointer"
          >
            🛠️ Recommended Resource
          </button>
          <button
            type="button"
            onClick={() => handleApplyTemplate('announcement')}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-medium border border-slate-700/60 transition-colors cursor-pointer"
          >
            📢 Weekly Founder Announcement
          </button>
        </div>
      </div>

      {/* Broadcast Form */}
      <form onSubmit={handleSendPush} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Notification Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 🔥 3 New Zero-Capital Digital Ideas Added!"
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-teal-500 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Category / Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500 transition-colors cursor-pointer"
            >
              <option value="blueprint">Blueprint Update</option>
              <option value="resource">Recommended Resource</option>
              <option value="announcement">General Announcement</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300">Notification Body / Message *</label>
          <textarea
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Actionable, exciting copy that compels students to tap and read the blueprint..."
            required
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-teal-500 transition-colors"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300">Target Click URL (Optional)</label>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="e.g. / or /idea/campus-print-on-demand"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-teal-500 transition-colors"
          />
          <span className="text-[10px] text-slate-500">
            Tapping the push notification on desktop or mobile opens this path. Defaults to homepage (/).
          </span>
        </div>

        {/* Live Preview Box */}
        <div className="pt-2">
          <span className="text-xs font-semibold text-slate-400">Device Notification Preview:</span>
          <div className="mt-2 bg-slate-950 border border-slate-800 rounded-2xl p-3.5 flex items-start gap-3 max-w-md shadow-inner">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5" />
            </div>
            <div className="space-y-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] uppercase font-bold text-teal-400">Student Earning Ideas</span>
                <span className="text-[10px] text-slate-500">now</span>
              </div>
              <h4 className="text-xs font-bold text-white truncate">
                {title || '🔥 New Student Earning Blueprint Live!'}
              </h4>
              <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                {message || 'A brand-new zero-investment micro-startup guide with calculator and checklist was just published.'}
              </p>
            </div>
          </div>
        </div>

        {/* Status result alert */}
        {lastResult && (
          <div
            className={`p-3.5 rounded-2xl text-xs flex items-center gap-2.5 ${
              lastResult.success
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
            }`}
          >
            {lastResult.success ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            )}
            <div className="space-y-0.5">
              {lastResult.success ? (
                <>
                  <strong className="font-bold">Broadcast Complete!</strong> Successfully delivered to{' '}
                  <span className="font-mono font-bold text-white">{lastResult.sentCount}</span> subscribers
                  {lastResult.failedCount > 0 && ` (${lastResult.failedCount} failed, ${lastResult.prunedCount} stale pruned)`}.
                </>
              ) : (
                <>
                  <strong className="font-bold">Broadcast Failed:</strong> {lastResult.error}
                </>
              )}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-2 flex items-center justify-end gap-3">
          <button
            type="submit"
            disabled={isSending || subscriberCount === 0}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg transition-all cursor-pointer ${
              subscriberCount === 0
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 shadow-teal-500/20 active:scale-95'
            }`}
          >
            {isSending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Broadcasting to Devices...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Send Push to {subscriberCount} Subscriber{subscriberCount === 1 ? '' : 's'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
