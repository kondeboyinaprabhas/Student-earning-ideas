// CookieConsent.jsx - GDPR & ePrivacy Compliant Notice
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';
import { getCookieConsent, setCookieConsent } from '../lib/ideasStore';

export default function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const accepted = getCookieConsent();
    if (!accepted) {
      const t = setTimeout(() => setShow(true), 2000);
      return () => clearTimeout(t);
    }
  }, []);

  const handleAccept = () => {
    setCookieConsent(true);
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-3 sm:p-4 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-2xl animate-in slide-in-from-bottom">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 text-slate-700 text-center sm:text-left">
          <ShieldCheck className="w-5 h-5 text-teal-600 shrink-0 hidden sm:block" />
          <span>
            We use anonymous analytics and compliant cookies to enhance your experience and support student creator resources. Review our{' '}
            <Link href="/privacy" className="text-teal-700 font-bold underline hover:text-teal-800">
              Privacy Policy
            </Link>.
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleAccept}
            className="bg-teal-700 hover:bg-teal-800 active:scale-95 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-xs"
          >
            Accept & Continue
          </button>
        </div>
      </div>
    </div>
  );
}
