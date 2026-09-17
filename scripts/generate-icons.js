const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const outDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const getSvg = (isMaskable = false) => {
  const transform = isMaskable
    ? 'translate(96, 96) scale(2.66)'
    : 'translate(56, 56) scale(3.33)';
  const bg = isMaskable
    ? '<rect width="512" height="512" fill="url(#bgGrad)" />'
    : '<rect width="512" height="512" rx="112" fill="url(#bgGrad)" />';

  return `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#0F172A" />
      <stop offset="100%" stop-color="#020617" />
    </linearGradient>
    <linearGradient id="bookLeft" x1="100" y1="220" x2="256" y2="400" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#0284C7" />
      <stop offset="100%" stop-color="#0F172A" />
    </linearGradient>
    <linearGradient id="bookRight" x1="412" y1="220" x2="256" y2="400" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#0D9488" />
      <stop offset="100%" stop-color="#0F172A" />
    </linearGradient>
    <linearGradient id="bulbGlow" x1="256" y1="150" x2="256" y2="300" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#FDE047" />
      <stop offset="100%" stop-color="#F59E0B" />
    </linearGradient>
    <linearGradient id="arrowGrad" x1="270" y1="320" x2="440" y2="130" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#10B981" />
      <stop offset="100%" stop-color="#22C55E" />
    </linearGradient>
    <linearGradient id="coinGrad" x1="360" y1="300" x2="400" y2="380" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#FDE047" />
      <stop offset="100%" stop-color="#D97706" />
    </linearGradient>
  </defs>

  ${bg}

  <g transform="${transform}">
    <!-- Graduation Mortarboard Cap -->
    <polygon points="60,8 102,24 60,38 18,24" fill="#1E293B" stroke="#38BDF8" stroke-width="1.5" />
    <!-- Cap Base -->
    <path d="M38,30 L38,37 C38,45 82,45 82,37 L82,30 Z" fill="#0F172A" />
    <!-- Tassel Button and String -->
    <circle cx="60" cy="22" r="3" fill="#38BDF8" />
    <path d="M60,22 Q88,25 88,39" stroke="#38BDF8" stroke-width="2.5" stroke-linecap="round" fill="none" />
    <rect x="86" y="39" width="4.5" height="8" rx="1.5" fill="#38BDF8" />

    <!-- Open Book Wings -->
    <path d="M60,78 C42,66 22,50 24,35 C32,46 48,60 60,78 Z" fill="url(#bookLeft)" />
    <path d="M60,86 C40,74 28,62 30,52 C38,62 50,72 60,86 Z" fill="#0369A1" />

    <path d="M60,78 C78,66 98,50 96,35 C88,46 72,60 60,78 Z" fill="url(#bookRight)" />
    <path d="M60,86 C80,74 92,62 90,52 C82,62 70,72 60,86 Z" fill="#0F766E" />

    <!-- Center Light Bulb -->
    <path d="M52,50 C52,44 55,40 60,40 C65,40 68,44 68,50 C68,54 65,57 64,60 L56,60 C55,57 52,54 52,50 Z" fill="url(#bulbGlow)" />
    <path d="M56,62 L64,62 M57,65 L63,65" stroke="#0F172A" stroke-width="2" stroke-linecap="round" />

    <!-- Growth Arrow -->
    <path d="M58,80 Q76,68 96,34" stroke="url(#arrowGrad)" stroke-width="6" stroke-linecap="round" fill="none" />
    <polygon points="102,28 92,34 98,42" fill="#10B981" />

    <!-- Rupee Coins -->
    <ellipse cx="94" cy="82" rx="14" ry="7" fill="#B45309" />
    <ellipse cx="94" cy="80" rx="14" ry="7" fill="url(#coinGrad)" />
    <ellipse cx="94" cy="74" rx="14" ry="7" fill="#B45309" />
    <ellipse cx="94" cy="72" rx="14" ry="7" fill="url(#coinGrad)" />
    <ellipse cx="88" cy="65" rx="13" ry="13" fill="#F59E0B" />
    <ellipse cx="88" cy="65" rx="11" ry="11" fill="url(#coinGrad)" />
    <text x="88" y="70" text-anchor="middle" font-size="11" font-weight="bold" fill="#78350F" font-family="Arial, sans-serif">&#x20B9;</text>
  </g>
</svg>`;
};

async function generate() {
  const stdBuf = Buffer.from(getSvg(false));
  const maskBuf = Buffer.from(getSvg(true));

  await sharp(stdBuf).resize(512, 512).png().toFile(path.join(outDir, 'icon-512.png'));
  await sharp(stdBuf).resize(192, 192).png().toFile(path.join(outDir, 'icon-192.png'));
  await sharp(stdBuf).resize(180, 180).png().toFile(path.join(outDir, 'apple-touch-icon.png'));
  await sharp(maskBuf).resize(512, 512).png().toFile(path.join(outDir, 'icon-maskable-512.png'));
  await sharp(maskBuf).resize(192, 192).png().toFile(path.join(outDir, 'icon-maskable-192.png'));

  // Also root copies for crawlers & browsers
  await sharp(stdBuf).resize(180, 180).png().toFile(path.join(__dirname, '..', 'public', 'apple-touch-icon.png'));
  await sharp(stdBuf).resize(32, 32).png().toFile(path.join(__dirname, '..', 'public', 'favicon.ico'));

  console.log('All PWA and favicon icons generated successfully in public/icons and public/');
}

generate().catch(err => {
  console.error('Icon generation failed:', err);
  process.exit(1);
});
