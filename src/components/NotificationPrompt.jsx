// src/components/NotificationPrompt.jsx - Push Notification Opt‑In Prompt
"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Check, X, Loader2 } from "lucide-react";
import { subscribeUserToPush } from "@/lib/pushSubscription";

/**
 * Shows a non‑intrusive banner inviting the user to enable push notifications.
 * The banner appears once the user has viewed at least three ideas in the feed.
 * It is stored in localStorage under "notification_prompt_shown" to avoid repeat displays.
 */
export default function NotificationPrompt({ isVisible, onClose }) {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handleEnable = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const res = await subscribeUserToPush();
      if (res.success) {
        setFeedback({ type: "success", message: "Notifications enabled!" });
        localStorage.setItem("notification_prompt_shown", "true");
        if (onClose) onClose();
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
    <div className="fixed bottom-4 right-4 z-50 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-4 animate-in fade-in">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-teal-500/10 dark:bg-teal-500/20 flex items-center justify-center text-teal-600 dark:text-teal-400">
            <Bell className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold">Never miss new earning ideas</h3>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-md" aria-label="Close notification prompt">
          <X className="w-4 h-4" />
        </button>
      </div>
      <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">
        Enable notifications to get updates when new ideas, resources, and announcements are published.
      </p>
      {feedback && (
        <div className={`mt-2 p-2 rounded text-xs flex items-center gap-1 ${feedback.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
          {feedback.type === "success" ? <Check className="w-3 h-3" /> : null}
          <span>{feedback.message}</span>
        </div>
      )}
      <div className="mt-3 flex justify-between gap-2">
        <button
          onClick={onClose}
          className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 bg-slate-200 hover:bg-slate-300 rounded disabled:opacity-50"
        >
          Not now
        </button>
        <button
          onClick={handleEnable}
          disabled={loading}
          className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white font-medium text-xs px-3 py-1.5 rounded disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
          {loading ? "Enabling..." : "Enable Notifications"}
        </button>
      </div>
    </div>
  );
}
