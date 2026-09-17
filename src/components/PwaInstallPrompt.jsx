'use client';

import { useState } from 'react';
import {
  Download,
  X,
  Smartphone,
  Share,
  PlusSquare,
  CheckCircle,
} from 'lucide-react';

export default function PwaInstallPrompt({
  isVisible,
  isIos,
  onInstall,
  onDismiss,
}) {
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  if (!isVisible) {
    return null;
  }

  const handleInstall = async () => {
    if (isIos) {
      setShowIosGuide(true);
      return;
    }

    setIsInstalling(true);

    try {
      const result = await onInstall?.();

      if (result?.isIos) {
        setShowIosGuide(true);
      }
    } finally {
      setIsInstalling(false);
    }
  };

  return (
    <aside
      aria-label="Install EarnIdeas"
      className="fixed top-3 left-3 right-3 z-50 mx-auto max-w-xl"
    >
      <div className="relative rounded-2xl border border-teal-500/30 bg-slate-900/95 p-3.5 text-white shadow-2xl backdrop-blur-md">
        <button
          type="button"
          onClick={onDismiss}
          className="absolute right-2.5 top-2.5 rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
          aria-label="Dismiss install prompt"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-3 pr-6">
          <img
            src="/icons/icon-192.png"
            alt="EarnIdeas"
            className="h-11 w-11 shrink-0 rounded-xl object-cover"
          />

          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-bold leading-tight sm:text-base">
              Install EarnIdeas
            </h2>

            <p className="mt-1 text-[11px] leading-relaxed text-slate-300 sm:text-xs">
              Install it on your home screen to easily access new earning ideas
              and receive notifications.
            </p>
          </div>
        </div>

        {showIosGuide && (
          <div className="mt-3 rounded-xl border border-slate-700 bg-slate-800/70 p-3">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-teal-300">
              <Smartphone className="h-3.5 w-3.5" />
              How to install
            </p>

            <ol className="space-y-1.5 text-[11px] text-slate-300">
              <li className="flex items-start gap-2">
                <span className="shrink-0 font-bold text-teal-400">1.</span>
                <span>
                  Tap the <strong className="text-white">Share</strong> icon{' '}
                  <Share className="inline h-3.5 w-3.5 text-teal-400" />.
                </span>
              </li>

              <li className="flex items-start gap-2">
                <span className="shrink-0 font-bold text-teal-400">2.</span>
                <span>
                  Tap <strong className="text-white">Add to Home Screen</strong>{' '}
                  <PlusSquare className="inline h-3.5 w-3.5 text-teal-400" />.
                </span>
              </li>

              <li className="flex items-start gap-2">
                <span className="shrink-0 font-bold text-teal-400">3.</span>
                <span>
                  Tap <strong className="text-white">Add</strong>.
                </span>
              </li>
            </ol>
          </div>
        )}

        <div className="mt-3 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onDismiss}
            className="rounded-lg px-3 py-2 text-[11px] font-semibold text-slate-400 transition-colors hover:text-white"
          >
            Not now
          </button>

          {!showIosGuide ? (
            <button
              type="button"
              onClick={handleInstall}
              disabled={isInstalling}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3.5 py-2 text-[11px] font-bold text-slate-950 transition-transform hover:bg-emerald-400 active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <Download className="h-3.5 w-3.5" />
              {isInstalling ? 'Installing...' : 'Install App'}
            </button>
          ) : (
            <button
              type="button"
              onClick={onDismiss}
              className="inline-flex items-center gap-1.5 rounded-lg bg-teal-500 px-3.5 py-2 text-[11px] font-bold text-slate-950 hover:bg-teal-400"
            >
              <CheckCircle className="h-3.5 w-3.5" />
              Got it
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
