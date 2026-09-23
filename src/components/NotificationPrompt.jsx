// src/components/NotificationPrompt.jsx - Push Notification Opt‑In Prompt
"use client";

import { useState } from "react";
import { Bell, Check, X, Loader2 } from "lucide-react";
import { subscribeUserToPush } from "@/lib/pushSubscription";

/**
 * Shows a non-intrusive banner inviting the user to enable push notifications.
 * The banner appears once the user has scrolled through 3–5 real business ideas in the feed.
 * "Maybe Later" dismisses only for the current session via sessionStorage.
 * Successful enablement permanently saves in localStorage to prevent re-display.
 */
export default function NotificationPrompt({ isVisible, onClose }) {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handleDismiss = () => {
    if (typeof window !== "undefined") {
      window.__sei_notification_dismissed = true;
      sessionStorage.setItem("notification_session_dismissed", "true");
    }
    if (onClose) onClose();
  };

  const handleEnable = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const res = await subscribeUserToPush();
      if (res.success) {
        setFeedback({ type: "success", message: "Notifications enabled!" });
        if (typeof window !== "undefined") {
          localStorage.setItem("notification_prompt_shown", "true");
          window.__sei_notification_dismissed = true;
        }
        setTimeout(() => {
          if (onClose) onClose();
        }, 800);
      } else {
        setFeedback({ type: "error", message: res.error || "Failed to enable notifications." });
      }
    } catch (e) {
      setFeedback({ type: "error", message: "Unexpected error occurred." });
    } finally {
      setLoading(false);
    }
  };

  if (!isVisible) return null;

  return (
    <aside
      role="dialog"
      aria-label="Notification permission prompt"
      className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] w-[92%] sm:w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200/90 dark:border-slate-800 p-4 animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-auto"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-teal-500/10 dark:bg-teal-500/20 flex items-center justify-center text-teal-600 dark:text-teal-400 shrink-0">
            <Bell className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
            Never Miss the Next Earning Idea
          </h3>
        </div>
        <button
          onClick={handleDismiss}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg transition-colors cursor-pointer shrink-0"
          aria-label="Maybe Later"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
        Get notified whenever a new earning blueprint is published.
      </p>
      {feedback && (
        <div
          className={`mt-2.5 p-2 rounded-xl text-xs flex items-center gap-1.5 font-medium ${
            feedback.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20"
              : "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-500/20"
          }`}
        >
          {feedback.type === "success" ? <Check className="w-3.5 h-3.5 shrink-0" /> : null}
          <span>{feedback.message}</span>
        </div>
      )}
      <div className="mt-3.5 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={handleDismiss}
          className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all cursor-pointer disabled:opacity-50"
        >
          Maybe Later
        </button>
        <button
          type="button"
          onClick={handleEnable}
          disabled={loading}
          className="inline-flex items-center gap-1.5 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
          <span>{loading ? "Enabling..." : "Enable Notifications"}</span>
        </button>
      </div>
    </aside>
  );
}
