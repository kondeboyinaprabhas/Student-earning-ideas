// src/app/preview/[id]/page.js - Secure Draft Preview System
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, ShieldAlert } from 'lucide-react';
import Header from '@/components/Header';
import IdeaCard from '@/components/IdeaCard';
import { getDraftIdeas, getPublishedIdeas } from '@/lib/ideasStore';

function DraftPreviewContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [draft, setDraft] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(true);

  useEffect(() => {
    const exp = searchParams.get('exp');
    if (exp && Date.now() > parseInt(exp, 10)) {
      setIsAuthorized(false);
    }
  }, [searchParams]);

  useEffect(() => {
    const targetId = params?.id;
    if (!targetId) return;

    (async () => {
      const drafts = getDraftIdeas();
      const published = await getPublishedIdeas();
      let matched = drafts.find(d => d.id === targetId || d.slug === targetId)
                 || published.find(p => p.id === targetId || p.slug === targetId);

      // Fallback: check session storage draft from active admin editor
      if (!matched && typeof window !== 'undefined') {
        try {
          const temp = sessionStorage.getItem('sei_preview_temp_draft');
          if (temp) {
            const parsed = JSON.parse(temp);
            if (parsed && (parsed.id === targetId || parsed.slug === targetId || targetId === 'current-draft')) {
              matched = parsed;
            }
          }
        } catch (err) {
          console.warn('Error reading preview temp draft:', err);
        }
      }

      if (matched) {
        setDraft(matched);
      }
    })();
  }, [params]);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 text-center max-w-sm">
          <ShieldAlert className="w-10 h-10 text-rose-500 mx-auto mb-2" />
          <h2 className="text-base font-bold text-slate-900">Preview Link Expired</h2>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            This internal draft preview link has expired for security reasons. Please generate a new link from the Founder Studio.
          </p>
          <Link href="/admin" className="bg-slate-900 text-white font-bold text-xs px-4 py-2 rounded-xl">
            Go to Admin Studio
          </Link>
        </div>
      </div>
    );
  }

  if (!draft) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-base font-bold text-slate-800">Draft Not Found</h2>
          <p className="text-xs text-slate-500 mt-1 mb-3">The requested blueprint draft could not be loaded.</p>
          <Link href="/admin" className="text-xs text-teal-700 font-bold underline">
            Return to Admin Studio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Draft Watermark Bar */}
      <div className="bg-amber-500 text-slate-950 px-4 py-2 text-xs font-bold flex items-center justify-between shadow-xs sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4" />
          <span>DRAFT PREVIEW • PREVIEW BEFORE PUBLISHING</span>
        </div>
        <Link
          href="/admin"
          className="bg-slate-950 text-white text-[11px] px-3 py-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          Return to Editor
        </Link>
      </div>

      <Header savedCount={0} />

      <main className="flex-1 w-full max-w-xl mx-auto py-4">
        <IdeaCard
          idea={draft}
          index={0}
          allIdeas={[draft]}
          showAds={false}
        />
      </main>
    </div>
  );
}

export default function DraftPreviewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="text-xs font-medium text-slate-500">Loading preview...</div>
      </div>
    }>
      <DraftPreviewContent />
    </Suspense>
  );
}
