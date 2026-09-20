'use client';

import { useState, useEffect } from 'react';

/**
 * PremiumRefreshOverlay – True Concurrent Page Loader
 * Luxury Matte-Black + Champagne-Gold aesthetic.
 *
 * Runs concurrently while ideas and resources load.
 * Dismisses cleanly with a 220ms fade-out the moment both
 * data loading and minimum duration (1.7s) are complete.
 */
export default function PremiumRefreshOverlay({ visible }) {
  const [mounted, setMounted] = useState(visible);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      setIsExiting(false);
    } else if (mounted) {
      setIsExiting(true);
      const timer = setTimeout(() => {
        setMounted(false);
        setIsExiting(false);
      }, 220);
      return () => clearTimeout(timer);
    }
  }, [visible, mounted]);

  // Lock body scroll while overlay is active or fading out
  useEffect(() => {
    if (mounted) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [mounted]);

  if (!mounted) return null;

  return (
    <>
      <style>{`
        /* ── Overlay In & Out (220ms) ───────────────────────────── */
        @keyframes lx-overlay-in {
          0%   { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes lx-overlay-exit {
          0%   { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-8px); }
        }

        /* ── Thin Champagne Gold Ring Entrance & Organic Breathe ── */
        @keyframes lx-ring-in {
          0%   { opacity: 0; transform: scale(0.72); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes lx-ring-breathe {
          0% {
            transform: scale(1);
            box-shadow: 0 0 16px rgba(214, 192, 141, 0.20), inset 0 0 8px rgba(214, 192, 141, 0.10);
          }
          100% {
            transform: scale(1.04);
            box-shadow: 0 0 28px rgba(214, 192, 141, 0.36), inset 0 0 14px rgba(214, 192, 141, 0.18);
          }
        }

        /* ── Opportunity Symbols Rotation ───────────────────────── */
        @keyframes lx-rotate-symbols {
          0%   { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* ── Staggered Word Reveal (80ms interval) ──────────────── */
        @keyframes lx-word-in {
          0% {
            opacity: 0;
            transform: translateY(8px);
            filter: blur(4px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0);
          }
        }

        /* ── Center Convergence on Exit (220ms) ─────────────────── */
        @keyframes lx-converge-exit {
          0% {
            opacity: 1;
            transform: scale(1);
            filter: blur(0px);
          }
          100% {
            opacity: 0;
            transform: scale(0.92);
            filter: blur(3px);
          }
        }

        /* ── Floating Micro-Particles ───────────────────────────── */
        @keyframes lx-drift-1 { 0%,100% { transform: translate(0, 0); } 50% { transform: translate(8px, -10px); } }
        @keyframes lx-drift-2 { 0%,100% { transform: translate(0, 0); } 50% { transform: translate(-10px, -6px); } }
        @keyframes lx-drift-3 { 0%,100% { transform: translate(0, 0); } 50% { transform: translate(6px, 8px); } }
        @keyframes lx-drift-4 { 0%,100% { transform: translate(0, 0); } 50% { transform: translate(-8px, 9px); } }
        @keyframes lx-drift-5 { 0%,100% { transform: translate(0, 0); } 50% { transform: translate(10px, 4px); } }
        @keyframes lx-drift-6 { 0%,100% { transform: translate(0, 0); } 50% { transform: translate(-6px, -8px); } }

        /* ── Reduced Motion Fallback ────────────────────────────── */
        @media (prefers-reduced-motion: reduce) {
          .lx-anim-root,
          .lx-anim-converge,
          .lx-anim-ring,
          .lx-anim-symbols,
          .lx-anim-particle,
          .lx-anim-word,
          .lx-anim-sub {
            animation: none !important;
            transition: none !important;
            opacity: 1 !important;
            transform: none !important;
            filter: none !important;
          }
        }
      `}</style>

      {/* Full-Screen Matte Black Canvas with Edge Vignette & Backdrop Blur */}
      <div
        className="lx-anim-root fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden select-none"
        style={{
          backgroundColor: '#080808',
          backgroundImage:
            'radial-gradient(circle at 50% 45%, #181818 0%, #0d0d0d 50%, #080808 100%)',
          boxShadow: 'inset 0 0 140px rgba(0,0,0,0.96), inset 0 0 50px rgba(0,0,0,0.92)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          pointerEvents: 'all',
          animation: isExiting
            ? 'lx-overlay-exit 220ms cubic-bezier(0.16,1,0.3,1) forwards'
            : 'lx-overlay-in 220ms ease-out forwards',
        }}
        aria-live="polite"
        aria-label="Loading verified opportunities"
      >
        {/* Faint Cinematic Center Glow */}
        <div
          className="absolute pointer-events-none"
          style={{
            width: 360,
            height: 360,
            borderRadius: '50%',
            background:
              'radial-gradient(circle at center, rgba(214,192,141,0.08) 0%, rgba(214,192,141,0.02) 40%, transparent 70%)',
            filter: 'blur(18px)',
          }}
        />

        {/* 6 Tiny Gold Micro-Particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[
            { id: 1, top: '41%', left: '43%', s: 2.8, c: '#D6C08D', anim: 'lx-drift-1 2.2s infinite ease-in-out' },
            { id: 2, top: '39%', left: '57%', s: 2.4, c: '#E8D7B0', anim: 'lx-drift-2 2.6s infinite ease-in-out' },
            { id: 3, top: '48%', left: '41%', s: 2.8, c: '#C4AC75', anim: 'lx-drift-3 2.4s infinite ease-in-out' },
            { id: 4, top: '47%', left: '59%', s: 2.4, c: '#D6C08D', anim: 'lx-drift-4 2.8s infinite ease-in-out' },
            { id: 5, top: '36%', left: '50%', s: 2.2, c: '#E8D7B0', anim: 'lx-drift-5 2.1s infinite ease-in-out' },
            { id: 6, top: '51%', left: '49%', s: 2.6, c: '#C4AC75', anim: 'lx-drift-6 2.5s infinite ease-in-out' },
          ].map((p) => (
            <div
              key={p.id}
              className="lx-anim-particle absolute rounded-full"
              style={{
                top: p.top,
                left: p.left,
                width: p.s,
                height: p.s,
                backgroundColor: p.c,
                boxShadow: `0 0 6px ${p.c}99`,
                filter: 'blur(0.3px)',
                animation: `${p.anim}, lx-overlay-in 300ms 200ms ease-out both`,
              }}
            />
          ))}
        </div>

        {/* Converging Core: Ring + Rotating Opportunity Symbols + Typography */}
        <div
          className="lx-anim-converge relative flex flex-col items-center justify-center"
          style={{
            animation: isExiting
              ? 'lx-converge-exit 220ms cubic-bezier(0.16,1,0.3,1) forwards'
              : 'none',
          }}
        >
          {/* Champagne Gold Ring with Smoothly Rotating Opportunity Symbols */}
          <div
            className="lx-anim-ring relative flex items-center justify-center mb-7"
            style={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              border: '1px solid rgba(214, 192, 141, 0.72)',
              boxShadow: '0 0 18px rgba(214, 192, 141, 0.22), inset 0 0 10px rgba(214, 192, 141, 0.12)',
              animation:
                'lx-ring-in 350ms 250ms cubic-bezier(0.16,1,0.3,1) both, ' +
                'lx-ring-breathe 1.2s 600ms ease-in-out infinite alternate',
            }}
          >
            {/* Rotating Opportunity Icons & Symbols */}
            <svg
              className="lx-anim-symbols absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 60 60"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{
                animation: 'lx-rotate-symbols 4s linear infinite',
              }}
            >
              {/* Top: Ascending arrow glyph */}
              <path
                d="M30 7L30 14M27 10L30 7L33 10"
                stroke="#D6C08D"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Right: Tiny diamond spark */}
              <path d="M53 30L51 31.5L53 33L55 31.5Z" fill="#D6C08D" />
              {/* Bottom: Opportunity node */}
              <circle cx="30" cy="52" r="1.8" fill="#D6C08D" />
              {/* Left: Star spark */}
              <path d="M7 30L9 31.5L7 33L5 31.5Z" fill="#D6C08D" />
            </svg>

            {/* Centered Minimal Luxury Diamond Spark */}
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ filter: 'drop-shadow(0 0 4px rgba(214,192,141,0.5))' }}
            >
              <path
                d="M6 0.5L7.4 4.6L11.5 6L7.4 7.4L6 11.5L4.6 7.4L0.5 6L4.6 4.6L6 0.5Z"
                fill="#D6C08D"
              />
            </svg>
          </div>

          {/* Staggered Headline & Subtitle */}
          <div className="relative z-10 flex flex-col items-center text-center px-6">
            {/* Headline with 80ms Stagger per Word */}
            <h2
              className="flex items-center gap-[0.35em] text-center"
              style={{
                fontFamily: "'Playfair Display', Didot, 'Cinzel', 'Bodoni MT', Georgia, serif",
                fontSize: '1.75rem',
                fontWeight: 500,
                letterSpacing: '0.06em',
                color: '#F8FAFC',
                lineHeight: 1.25,
                margin: 0,
                textShadow: '0 0 24px rgba(214,192,141,0.32), 0 2px 8px rgba(0,0,0,0.8)',
              }}
            >
              <span
                className="lx-anim-word inline-block"
                style={{
                  animation: 'lx-word-in 280ms 700ms cubic-bezier(0.16,1,0.3,1) both',
                }}
              >
                Life
              </span>
              <span
                className="lx-anim-word inline-block"
                style={{
                  animation: 'lx-word-in 280ms 780ms cubic-bezier(0.16,1,0.3,1) both',
                }}
              >
                Changing
              </span>
              <span
                className="lx-anim-word inline-block"
                style={{
                  animation: 'lx-word-in 280ms 860ms cubic-bezier(0.16,1,0.3,1) both',
                }}
              >
                Ideas
              </span>
            </h2>

            {/* Subtitle: Verified ideas. Real opportunities. */}
            <p
              className="lx-anim-sub"
              style={{
                fontSize: '0.74rem',
                fontWeight: 400,
                color: 'rgba(214, 192, 141, 0.72)',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                lineHeight: 1.5,
                marginTop: '0.65rem',
                animation: 'lx-word-in 300ms 1050ms cubic-bezier(0.16,1,0.3,1) both',
              }}
            >
              Verified ideas. Real opportunities.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
