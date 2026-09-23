// src/app/idea/[slug]/page.js - Deep-Linked SEO Article Page
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Share2, Sparkles } from 'lucide-react';
import Header from '@/components/Header';
import IdeaCard from '@/components/IdeaCard';
import Footer from '@/components/Footer';
import Toast from '@/components/Toast';
import SearchModal from '@/components/SearchModal';
import { getPublishedIdeas, getSavedIds } from '@/lib/ideasStore';
import { SEED_IDEAS } from '@/lib/seedData';

export default function IdeaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [ideas, setIdeas] = useState(SEED_IDEAS);
  const [savedIds, setSavedIds] = useState([]);
  const [currentIdea, setCurrentIdea] = useState(() => {
    return SEED_IDEAS.find(i => i.slug === params?.slug || i.id === params?.slug) || null;
  });
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    (async () => {
      const all = await getPublishedIdeas();
      setIdeas(all);
      setSavedIds(getSavedIds());
      const matched = all.find(i => i.slug === params.slug || i.id === params.slug);
      if (matched) {
        setCurrentIdea(matched);
        // Update page title & meta tags dynamically
        document.title = `${matched.title} | Student Earning Ideas`;
      }
    })();
  }, [params.slug]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  if (!currentIdea) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <h2 className="text-lg font-bold text-slate-800 mb-2">Finding Idea Blueprint...</h2>
        <Link href="/" className="text-xs text-teal-700 font-bold underline">
          ← Return to Student Earning Ideas Feed
        </Link>
      </div>
    );
  }

  // JSON-LD Schema.org Structured Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": currentIdea.title,
    "description": currentIdea.subtitle,
    "image": currentIdea.heroImage,
    "estimatedCost": {
      "@type": "MonetaryAmount",
      "currency": "INR",
      "value": currentIdea.investment
    },
    "step": currentIdea.implementationSteps?.map((s) => ({
      "@type": "HowToStep",
      "name": s.title,
      "text": s.detail,
      "position": s.step
    })) || []
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Header 
        savedCount={savedIds.length} 
        onOpenSearch={() => setIsSearchOpen(true)} 
      />
      
      <Toast message={toastMessage} />

      <div className="max-w-xl mx-auto w-full px-4 pt-3 pb-1 flex items-center justify-between">
        <Link 
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white px-3 py-1.5 rounded-full border border-slate-200/80 shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>All 100+ Ideas</span>
        </Link>
        <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
          Verified Student Blueprint
        </span>
      </div>

      <main className="flex-1 w-full max-w-xl mx-auto py-2">
        <IdeaCard
          idea={currentIdea}
          index={0}
          allIdeas={ideas}
          onSaveChange={() => setSavedIds(getSavedIds())}
          onShowToast={showToast}
          onNavigateToIdea={(slug) => router.push(`/idea/${slug}`)}
        />
      </main>

      <Footer />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        ideas={ideas}
        onSelectIdea={(idea) => router.push(`/idea/${idea.slug}`)}
      />
    </div>
  );
}
