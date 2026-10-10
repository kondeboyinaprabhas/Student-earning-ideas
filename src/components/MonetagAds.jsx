// src/components/MonetagAds.jsx - Monetag Ad Network Management
'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

/**
 * =============================================================================
 * MONETAG AD CONFIGURATION
 * =============================================================================
 * - Vignette Banner (Zone: 11942624): ACTIVE site-wide on public pages.
 * - In-Page Push (Zone: 11942486): TEMPORARILY PAUSED site-wide.
 * - Admin Portal Exclusion: ALL Monetag ads are completely blocked on /admin routes.
 * =============================================================================
 * 
 * HOW TO TOGGLE AD FORMATS:
 * - Vignette Ads: Toggle `ENABLE_VIGNETTE_ADS` (true = active, false = paused).
 * - In-Page Push: Toggle `ENABLE_IN_PAGE_PUSH_ADS` (true = active, false = paused).
 * =============================================================================
 */
export const ENABLE_VIGNETTE_ADS = true;
export const ENABLE_IN_PAGE_PUSH_ADS = false;

const IN_PAGE_PUSH_ZONE = '11942486';
const IN_PAGE_PUSH_SRC = 'https://nap5k.com/tag.min.js';

const VIGNETTE_ZONE = '11942624';
const VIGNETTE_SRC = 'https://n6wxm.com/vignette.min.js';

/**
 * Comprehensive DOM cleanup of all Monetag scripts, iframes, floating boxes, and overlays.
 * Invoked whenever any /admin route is active.
 */
function cleanupMonetagAds() {
  try {
    // 1. Remove all Monetag script tags (by URL, zone attribute, or ID)
    const scripts = document.querySelectorAll(
      'script[src*="nap5k.com"], script[src*="n6wxm.com"], script[data-zone="11942486"], script[data-zone="11942624"], #monetag-inpage-push, #monetag-vignette'
    );
    scripts.forEach((el) => el.remove());

    // 2. Remove any injected ad containers, floating prompts, banners, or iframes
    const adElements = document.querySelectorAll(
      '[id*="monetag"], [class*="monetag"], [id*="11942486"], [id*="11942624"], [data-zone="11942486"], [data-zone="11942624"], iframe[src*="nap5k.com"], iframe[src*="n6wxm.com"], iframe[src*="omg10.com"]'
    );
    adElements.forEach((el) => el.remove());
  } catch (err) {
    console.warn('[MonetagAds] Error during ad cleanup:', err);
  }
}

export default function MonetagAds() {
  const pathname = usePathname();
  const isAdminRoute = Boolean(pathname?.startsWith('/admin'));

  useEffect(() => {
    // ─── ADMIN ROUTES: STRICT TOTAL EXCLUSION ─────────────────────────────────
    if (isAdminRoute) {
      cleanupMonetagAds();
      return;
    }

    // ─── PUBLIC ROUTES: SCHEDULED INITIALIZATION WITH DUPLICATE GUARDS ────────
    let idleId = null;
    let timerId = null;

    const injectAds = () => {
      // Re-verify that the user has not navigated to an admin route before execution
      if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
        cleanupMonetagAds();
        return;
      }

      // 1. In-Page Push Injection (Zone 11942486) — TEMPORARILY PAUSED
      if (ENABLE_IN_PAGE_PUSH_ADS) {
        const existingPush = document.querySelector(
          `script[src*="nap5k.com"], script[data-zone="${IN_PAGE_PUSH_ZONE}"]`
        );
        if (!existingPush) {
          const pushScript = document.createElement('script');
          pushScript.id = 'monetag-inpage-push';
          pushScript.dataset.zone = IN_PAGE_PUSH_ZONE;
          pushScript.src = IN_PAGE_PUSH_SRC;
          pushScript.async = true;
          (document.body || document.documentElement).appendChild(pushScript);
        }
      } else {
        // Ensure any stray In-Page Push scripts are purged while paused
        const strayPush = document.querySelectorAll(
          `script[src*="nap5k.com"], script[data-zone="${IN_PAGE_PUSH_ZONE}"], #monetag-inpage-push`
        );
        strayPush.forEach((el) => el.remove());
      }

      // 2. Vignette Banner Injection (Zone 11942624) — ACTIVE site-wide
      if (ENABLE_VIGNETTE_ADS) {
        const existingVignette = document.querySelector(
          `script[src*="n6wxm.com"], script[data-zone="${VIGNETTE_ZONE}"]`
        );
        if (!existingVignette) {
          const vigScript = document.createElement('script');
          vigScript.id = 'monetag-vignette';
          vigScript.dataset.zone = VIGNETTE_ZONE;
          vigScript.src = VIGNETTE_SRC;
          vigScript.async = true;
          (document.body || document.documentElement).appendChild(vigScript);
        }
      } else {
        // Ensure any stray Vignette scripts are purged if the flag is disabled
        const strayVignette = document.querySelectorAll(
          `script[src*="n6wxm.com"], script[data-zone="${VIGNETTE_ZONE}"], #monetag-vignette`
        );
        strayVignette.forEach((el) => el.remove());
      }
    };

    // Schedule ad injection during browser idle time (lazyOnload equivalent)
    if ('requestIdleCallback' in window) {
      idleId = window.requestIdleCallback(injectAds, { timeout: 2000 });
    } else {
      timerId = setTimeout(injectAds, 1000);
    }

    return () => {
      if (idleId && 'cancelIdleCallback' in window) {
        window.cancelIdleCallback(idleId);
      }
      if (timerId) {
        clearTimeout(timerId);
      }
    };
  }, [isAdminRoute]);

  // Renders nothing in the React virtual DOM; all script lifecycles are explicitly managed
  return null;
}
