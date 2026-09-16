// StudentLogo.jsx - Exact SVG & Typography recreation from reference image
'use client';

export default function StudentLogo({ size = "md", showTagline = true, className = "" }) {
  const isSmall = size === "sm";
  const isLarge = size === "lg";

  const iconWidth = isSmall ? 32 : isLarge ? 56 : 42;
  const iconHeight = isSmall ? 32 : isLarge ? 56 : 42;

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* SVG Icon matching reference logo */}
      <svg
        width={iconWidth}
        height={iconHeight}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 drop-shadow-sm transition-transform hover:scale-105 duration-200"
        aria-label="Student Earning Ideas Logo"
      >
        <defs>
          <linearGradient id="bookLeft" x1="20" y1="50" x2="60" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0284C7" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>
          <linearGradient id="bookRight" x1="100" y1="50" x2="60" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0D9488" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>
          <linearGradient id="bulbGlow" x1="60" y1="35" x2="60" y2="70" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FDE047" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
          <linearGradient id="arrowGrad" x1="65" y1="75" x2="105" y2="30" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#22C55E" />
          </linearGradient>
          <linearGradient id="coinGrad" x1="85" y1="70" x2="95" y2="90" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FDE047" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
        </defs>

        {/* Graduation Mortarboard Cap */}
        <polygon points="60,6 102,23 60,37 18,23" fill="#0F172A" />
        {/* Cap Base */}
        <path d="M38,29 L38,36 C38,44 82,44 82,36 L82,29 Z" fill="#1E293B" />
        {/* Tassel Button & String */}
        <circle cx="60" cy="21" r="2.5" fill="#38BDF8" />
        <path d="M60,21 Q88,24 88,38" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" fill="none" />
        <rect x="86" y="38" width="4" height="7" rx="1.5" fill="#38BDF8" />

        {/* Open Book Wings / Petals */}
        {/* Left Wing Layers */}
        <path d="M60,78 C42,66 22,50 24,35 C32,46 48,60 60,78 Z" fill="url(#bookLeft)" />
        <path d="M60,86 C40,74 28,62 30,52 C38,62 50,72 60,86 Z" fill="#0369A1" />

        {/* Right Wing Layers */}
        <path d="M60,78 C78,66 98,50 96,35 C88,46 72,60 60,78 Z" fill="url(#bookRight)" />
        <path d="M60,86 C80,74 92,62 90,52 C82,62 70,72 60,86 Z" fill="#0F766E" />

        {/* Glowing Center Light Bulb */}
        <path d="M52,50 C52,44 55,40 60,40 C65,40 68,44 68,50 C68,54 65,57 64,60 L56,60 C55,57 52,54 52,50 Z" fill="url(#bulbGlow)" />
        <path d="M56,62 L64,62 M57,65 L63,65" stroke="#0F172A" strokeWidth="1.8" strokeLinecap="round" />
        {/* Filament lines inside bulb */}
        <path d="M58,48 L58,54 M62,48 L62,54" stroke="#78350F" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />

        {/* Upward Growth Arrow */}
        <path d="M58,80 Q76,68 96,34" stroke="url(#arrowGrad)" strokeWidth="6" strokeLinecap="round" fill="none" />
        <polygon points="102,28 92,34 98,42" fill="#10B981" />

        {/* Stack of Rupee Coins */}
        {/* Bottom coin */}
        <ellipse cx="94" cy="82" rx="14" ry="7" fill="#B45309" />
        <ellipse cx="94" cy="80" rx="14" ry="7" fill="url(#coinGrad)" />
        {/* Middle coin */}
        <ellipse cx="94" cy="74" rx="14" ry="7" fill="#B45309" />
        <ellipse cx="94" cy="72" rx="14" ry="7" fill="url(#coinGrad)" />
        {/* Top coin with Rupee symbol */}
        <ellipse cx="88" cy="65" rx="13" ry="13" fill="#F59E0B" />
        <ellipse cx="88" cy="65" rx="11" ry="11" fill="url(#coinGrad)" />
        <text x="88" y="70" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#78350F" fontFamily="Arial, sans-serif">₹</text>
      </svg>

      {/* Brand Typography */}
      <div className="flex flex-col justify-center">
        <span
          className={`font-black tracking-tight uppercase text-slate-900 dark:text-white leading-none ${
            isSmall ? "text-sm" : isLarge ? "text-xl" : "text-base"
          }`}
          style={{ letterSpacing: "-0.03em" }}
        >
          Student
        </span>
        <span
          className={`font-black tracking-tight uppercase leading-tight bg-gradient-to-r from-teal-600 via-cyan-600 to-sky-600 bg-clip-text text-transparent ${
            isSmall ? "text-[11px]" : isLarge ? "text-base" : "text-xs"
          }`}
          style={{ letterSpacing: "-0.01em" }}
        >
          Earning Ideas
        </span>
        {showTagline && (
          <span className="text-[10px] font-semibold text-emerald-600 tracking-wide mt-0.5">
            100+ Ways to Earn
          </span>
        )}
      </div>
    </div>
  );
}
