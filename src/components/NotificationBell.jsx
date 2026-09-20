// src/components/NotificationBell.jsx - User-initiated Push Notification Subscription Control
'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, BellRing, Check, X, Loader2, Sparkles } from 'lucide-react';
import { getPushStatus, subscribeUserToPush, unsubscribeUserFromPush } from '@/lib/pushSubscription';

export default function NotificationBell() {
  const [status, setStatus] = useState({ isSupported: false, permission: 'default', isSubscribed: false });
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const popoverRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    getPushStatus().then((s) => {
      if (mounted) setStatus(s);
    });
    return () => { mounted = false; };
  }, []);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Don't render if browser doesn't support Web Push
  if (!status.isSupported) {
    return null;
  }

  const handleSubscribe = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const res = await subscribeUserToPush();
      if (res.success) {
        setStatus((prev) => ({ ...prev, isSubscribed: true, permission: 'granted' }));
        setFeedback({ type: 'success', message: 'Subscribed! You will receive updates for new blueprints.' });
        setTimeout(() => setIsOpen(false), 2000);
      } else {
        setFeedback({ type: 'error', message: res.error || 'Failed to enable notifications.' });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: 'An unexpected error occurred.' });
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const res = await unsubscribeUserFromPush();
      if (res.success) {
        setStatus((prev) => ({ ...prev, isSubscribed: false }));
        setFeedback({ type: 'info', message: 'You have unsubscribed from notifications.' });
        setTimeout(() => setIsOpen(false), 1800);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative" ref={popoverRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setFeedback(null);
        }}
        className={`relative flex items-center justify-center w-9 h-9 rounded-full transition-all cursor-pointer ${
          status.isSubscribed
            ? 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60'
            : 'text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95'
        }`}
        aria-label="Push notifications settings"
        title={status.isSubscribed ? 'Notifications Enabled' : 'Enable Notifications'}
      >
        {status.isSubscribed ? (
          <BellRing className="w-5 h-5 text-teal-600 dark:text-teal-400" />
        ) : (
          <Bell className="w-5 h-5" />
        )}
        {status.isSubscribed && (
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-teal-500 ring-2 ring-white dark:ring-slate-900" />
        )}
      </button>

      {/* Popover Card */}
      {isOpen && (
        <div className="absolute right-0 top-12 z-50 w-72 sm:w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-4 text-slate-800 dark:text-white animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-start justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-teal-500/10 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                {status.isSubscribed ? <BellRing className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              </div>
              <h3 className="text-xs font-bold">
                {status.isSubscribed ? 'Notifications Active' : 'Enable Push Alerts'}
              </h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 -mr-1 -mt-1 rounded-lg transition-colors cursor-pointer"
              aria-label="Close notification settings"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
            {status.isSubscribed
              ? 'You receive instant alerts when new student blueprints, earning calculators, and curated tools are published.'
              : 'Be the first to discover newly researched student business ideas and weekly zero-investment blueprints.'}
          </p>

          {/* Feedback messages */}
          {feedback && (
            <div
              className={`mb-3 p-2 rounded-xl text-[11px] leading-tight flex items-center gap-1.5 ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60'
                  : feedback.type === 'error'
                  ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              {feedback.type === 'success' && <Check className="w-3.5 h-3.5 shrink-0" />}
              <span>{feedback.message}</span>
            </div>
          )}

          {/* Action button */}
          <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
            {status.isSubscribed ? (
              <button
                onClick={handleUnsubscribe}
                disabled={loading}
                className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 px-3 py-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
              >
                {loading ? 'Updating...' : 'Unsubscribe'}
              </button>
            ) : (
              <button
                onClick={handleSubscribe}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold text-xs py-2 px-3.5 rounded-xl shadow-md transition-all active:scale-98 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Enabling...</span>
                  </>
                ) : (
                  <>
                    <Bell className="w-3.5 h-3.5" />
                    <span>Enable Notifications</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
