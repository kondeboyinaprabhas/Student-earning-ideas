// Toast.jsx - Lightweight Floating Feedback Alert
'use client';

export default function Toast({ message }) {
  if (!message) return null;

  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 backdrop-blur-md text-white px-4 py-2 rounded-full shadow-lg border border-slate-700/80 text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
      <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
      <span>{message}</span>
    </div>
  );
}
