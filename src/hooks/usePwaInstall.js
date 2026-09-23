// src/hooks/usePwaInstall.js - Strict PWA Installation Hook with Idea #2 and #10 Triggers
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

const STORAGE_KEYS = {
  DISMISSED_AT: 'pwa_install_dismissed_at',
  SHOWN_AT: 'pwa_install_shown_at',
  ACCEPTED: 'pwa_install_accepted',
  COMPLETED: 'pwa_install_completed',
  LAST_PROMPT_IDEA: 'pwa_last_prompt_idea',
};

export function usePwaInstall() {
  const [isVisible, setIsVisible] = useState(false);
  const [promptIdea, setPromptIdea] = useState(null); // 2 or 10
  const [isIos, setIsIos] = useState(false);
  const [canInstallNative, setCanInstallNative] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const deferredPromptRef = useRef(null);

  // Safe localStorage helper
  const getStorage = useCallback((key) => {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  }, []);

  const setStorage = useCallback((key, value) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn('[PWA] LocalStorage error:', e);
    }
  }, []);

  // Check standalone / installed mode
  const checkIsStandalone = useCallback(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true ||
      document.referrer.includes('android-app://')
    );
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Detect standalone
    const standalone = checkIsStandalone();
    setIsStandalone(standalone);

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isAppleDevice);

    if (process.env.NODE_ENV === 'development') {
      console.log('[PWA Diagnostics] Initial state:', {
        isStandalone: standalone,
        canInstallNative: false,
        isIos: isAppleDevice,
        hasDeferredPrompt: false,
      });
    }

    // Listen for beforeinstallprompt (Chrome / Android / Edge)
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      deferredPromptRef.current = e;
      setCanInstallNative(true);
      if (process.env.NODE_ENV === 'development') {
        console.log('[PWA Diagnostics] beforeinstallprompt event captured! canInstallNative = true');
      }
    };

    // Listen for appinstalled
    const handleAppInstalled = () => {
      setStorage(STORAGE_KEYS.COMPLETED, 'true');
      setStorage(STORAGE_KEYS.ACCEPTED, 'true');
      setIsVisible(false);
      deferredPromptRef.current = null;
      setCanInstallNative(false);
      if (process.env.NODE_ENV === 'development') {
        console.log('[PWA Diagnostics] appinstalled event fired.');
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [checkIsStandalone, setStorage]);

  /**
   * Main Trigger: Called when an Idea is viewed in the feed.
   * ideaNumber is 1-based (Idea #1, Idea #2, etc.)
   */
  const triggerOnIdeaView = useCallback((ideaNumber) => {
    if (typeof window === 'undefined') return;

    // 1. ACTIVE PWA SUPPRESSION: If already running as standalone / installed, NEVER show.
    if (checkIsStandalone()) {
      return;
    }

    // Check if already installed or accepted
    if (getStorage(STORAGE_KEYS.COMPLETED) === 'true' || getStorage(STORAGE_KEYS.ACCEPTED) === 'true') {
      return;
    }

    const dismissedAt = getStorage(STORAGE_KEYS.DISMISSED_AT);
    const lastPromptIdea = getStorage(STORAGE_KEYS.LAST_PROMPT_IDEA);

    // TRIGGER 1: IDEA #2
    if (ideaNumber === 2) {
      // If already dismissed at Idea #2 or #10, do not show at #2
      if (dismissedAt === '2' || dismissedAt === '10') {
        return;
      }
      // If already shown for Idea #2, do not re-show
      if (lastPromptIdea === '2') {
        return;
      }

      setPromptIdea(2);
      setIsVisible(true);
      setStorage(STORAGE_KEYS.LAST_PROMPT_IDEA, '2');
      setStorage(STORAGE_KEYS.SHOWN_AT, Date.now().toString());
      return;
    }

    // TRIGGER 2: IDEA #10
    if (ideaNumber === 10) {
      // If already dismissed at Idea #10, do not show again
      if (dismissedAt === '10') {
        return;
      }
      // If already shown for Idea #10, do not re-show
      if (lastPromptIdea === '10') {
        return;
      }
      // Show if previously dismissed at Idea #2, or if not shown yet
      if (dismissedAt === '2' || !lastPromptIdea) {
        setPromptIdea(10);
        setIsVisible(true);
        setStorage(STORAGE_KEYS.LAST_PROMPT_IDEA, '10');
        setStorage(STORAGE_KEYS.SHOWN_AT, Date.now().toString());
      }
    }
  }, [checkIsStandalone, getStorage, setStorage]);

  /**
   * User clicked "Install App"
   */
  const handleInstall = useCallback(async () => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[PWA Diagnostics] handleInstall called:', {
        hasDeferredPrompt: !!deferredPromptRef.current,
        canInstallNative,
        isIos,
        isStandalone,
      });
    }

    // If native install prompt is available (Chrome / Edge / Android)
    if (deferredPromptRef.current) {
      const promptEvent = deferredPromptRef.current;
      deferredPromptRef.current = null; // Prevent multiple prompt() invocations on same event
      setCanInstallNative(false);

      try {
        await promptEvent.prompt();
        const choice = await promptEvent.userChoice;

        if (choice?.outcome === 'accepted') {
          setStorage(STORAGE_KEYS.ACCEPTED, 'true');
          setStorage(STORAGE_KEYS.COMPLETED, 'true');
          setIsVisible(false);
          return { success: true, outcome: 'accepted' };
        } else {
          // User cancelled native dialog
          const currentIdea = promptIdea ? String(promptIdea) : '2';
          setStorage(STORAGE_KEYS.DISMISSED_AT, currentIdea);
          setIsVisible(false);
          return { success: false, outcome: 'dismissed' };
        }
      } catch (err) {
        console.warn('[PWA] Prompt error:', err);
        setIsVisible(false);
        return { success: false, error: err };
      }
    }

    // For iOS / browsers without beforeinstallprompt (e.g. localhost testing or unsupported browsers)
    return { success: false, isIos, fallback: true };
  }, [promptIdea, isIos, isStandalone, canInstallNative, setStorage]);

  /**
   * User clicked "Dismiss" / "Not now"
   */
  const handleDismiss = useCallback(() => {
    const currentIdea = promptIdea ? String(promptIdea) : '2';
    setStorage(STORAGE_KEYS.DISMISSED_AT, currentIdea);
    // Clear last prompted idea to allow retry at Idea #10
    setStorage(STORAGE_KEYS.LAST_PROMPT_IDEA, '');
    setIsVisible(false);
  }, [promptIdea, setStorage]);

  return {
    isVisible,
    promptIdea,
    isIos,
    isStandalone,
    canInstallNative,
    triggerOnIdeaView,
    handleInstall,
    handleDismiss,
  };
}
