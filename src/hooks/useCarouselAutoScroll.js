// src/hooks/useCarouselAutoScroll.js
// Viewport-aware carousel auto-scroll hook using IntersectionObserver.
// - Auto-advances every `intervalMs` only while the container is ≥1% visible.
// - Pauses completely when off-screen (zero CPU usage).
// - Resumes from current index without resetting.
// - Works independently for every mounted instance.

import { useEffect, useRef } from 'react';

/**
 * @param {React.RefObject<HTMLElement>} containerRef - Ref to the element to observe.
 * @param {number} imageCount - Total number of images in the carousel.
 * @param {React.Dispatch<React.SetStateAction<number>>} setIndex - State setter from the parent.
 * @param {number} [intervalMs=1000] - Auto-scroll interval in milliseconds.
 */
export function useCarouselAutoScroll(containerRef, imageCount, setIndex, intervalMs = 1000) {
  // Track visibility so the interval callback can read it synchronously.
  const isVisibleRef = useRef(false);
  const timerRef = useRef(null);

  useEffect(() => {
    // Single image (or none) — nothing to do.
    if (imageCount < 2) return;

    const el = containerRef.current;
    if (!el) return;

    // --- Interval logic ---
    const startTicking = () => {
      if (timerRef.current) return; // already running
      timerRef.current = setInterval(() => {
        if (isVisibleRef.current) {
          setIndex(prev => (prev + 1) % imageCount);
        }
      }, intervalMs);
    };

    const stopTicking = () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };

    // --- IntersectionObserver ---
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
        if (entry.isIntersecting) {
          startTicking();
        } else {
          stopTicking();
        }
      },
      { threshold: 0.01 } // fire as soon as 1% of the element is visible
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      stopTicking();
    };
  }, [containerRef, imageCount, setIndex, intervalMs]);
}
