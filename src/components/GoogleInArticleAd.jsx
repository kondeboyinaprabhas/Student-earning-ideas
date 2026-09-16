// GoogleInArticleAd.jsx - Real Responsive Google AdSense In-Article Ad Unit
'use client';

import { useEffect, useRef, useState } from 'react';

export default function GoogleInArticleAd({
  client = "ca-pub-XXXXXXXXXXXXXXXX",
  slot = "1234567890",
  className = ""
}) {
  const adRef = useRef(null);
  const [adFailed, setAdFailed] = useState(false);

  useEffect(() => {
    // Only attempt in browser environment
    if (typeof window === 'undefined') return;

    try {
      // Ensure Google AdSense script is present
      const scriptId = 'adsbygoogle-script';
      if (!document.getElementById(scriptId)) {
        const script = document.createElement('script');
        script.id = scriptId;
        script.async = true;
        script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=" + client;
        script.crossOrigin = "anonymous";
        script.onerror = () => setAdFailed(true);
        document.head.appendChild(script);
      }

      // Push ad request to Google AdSense queue
      ((window.adsbygoogle = window.adsbygoogle || [])).push({});
    } catch (err) {
      // Gracefully collapse space if push fails or ad blocker blocks
      setAdFailed(true);
    }

    // Observe unfilled status to collapse space if unfilled
    const checkUnfilled = setTimeout(() => {
      if (adRef.current) {
        const status = adRef.current.getAttribute('data-ad-status');
        if (status === 'unfilled' || adRef.current.clientHeight === 0) {
          // If unfilled after timeout, collapse space
          setAdFailed(true);
        }
      }
    }, 2500);

    return () => clearTimeout(checkUnfilled);
  }, [client]);

  // If ad failed to load or ad blocker blocked, collapse space completely
  if (adFailed) return null;

  return (
    <div className={`w-full my-6 sm:my-8 transition-all overflow-hidden ${className}`}>
      {/* Real Responsive Google AdSense In-Article Ad Slot */}
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block', textAlign: 'center', minHeight: '90px' }}
        data-ad-layout="in-article"
        data-ad-format="fluid"
        data-ad-client={client}
        data-ad-slot={slot}
      />
    </div>
  );
}
