// src/lib/notifications.js - Audio & Web Notification Manager
'use client';

const MUTE_KEY = 'sei_admin_sound_muted';

export function isSoundMuted() {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(MUTE_KEY) === 'true';
  } catch (e) {
    return false;
  }
}

export function setSoundMuted(muted) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(MUTE_KEY, muted ? 'true' : 'false');
  } catch (e) {
    console.warn('[Notifications] Storage error:', e);
  }
}

/**
 * Synthesize a clean, pleasant notification chime using Web Audio API.
 * Never fails with missing asset files or 404 network errors.
 */
export function playNotificationSound() {
  if (typeof window === 'undefined') return;
  if (isSoundMuted()) return;

  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    // Browser autoplay policy requires resumed state
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    // First tone (E5 - 659.25Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now);
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.12);

    gain1.gain.setValueAtTime(0.12, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.4);

    // Second chime harmonic (B5 - 987.77Hz to E6 - 1318.51Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(987.77, now + 0.08);
    osc2.frequency.exponentialRampToValueAtTime(1318.51, now + 0.22);

    gain2.gain.setValueAtTime(0.001, now);
    gain2.gain.setValueAtTime(0.15, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.6);
  } catch (err) {
    console.warn('[Notification Audio Error]', err);
  }
}

/**
 * Request Web Notification permission from the browser.
 */
export async function requestNotificationPermission() {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (e) {
    console.warn('[Notifications] Permission request error:', e);
    return 'denied';
  }
}

/**
 * Dispatch desktop / tab browser notification if permission granted.
 */
export function sendBrowserNotification(title, options = {}) {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission === 'granted') {
    try {
      new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options,
      });
    } catch (e) {
      console.warn('[Notifications] Notification error:', e);
    }
  }
}
