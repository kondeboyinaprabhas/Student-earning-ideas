// src/app/saved/page.js - Saved Ideas Feed View
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bookmark, ArrowLeft, Search } from 'lucide-react';
import Header from '@/components/Header';
import IdeaCard from '@/components/IdeaCard';
import SearchModal from '@/components/SearchModal';
import Toast from '@/components/Toast';
import { getPublishedIdeas, getSavedIds } from '@/lib/ideasStore';

export default function SavedPage() {
  const [ideas, setIdeas] = useState([]);
  const [savedIds, setSavedIds] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    (async () => {
      const all = await getPublishedIdeas();
      const saved = getSavedIds();
      setIdeas(all);
      setSavedIds(saved);
    })();
  }, []);

  const savedIdeas = ideas.filter(i => savedIds.includes(i.id));

  const handleSaveChange = () => {
    const nextSaved = getSavedIds();
    setSavedIds(nextSaved);
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <Header 
        savedCount={savedIds.length} 
        onOpenSearch={() => setIsSearchOpen(true)}
        activeView="saved"
      />

      <Toast message={toastMessage} />

      {/* Top Saved Bar */}
      <div className="max-w-xl mx-auto w-full px-4 pt-3 pb-1 flex items-center justify-between">
        <Link 
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white px-3 py-1.5 rounded-full border border-slate-200/80 shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Feed</span>
        </Link>
        <span className="text-xs font-bold text-teal-800 bg-teal-50 border border-teal-200/80 px-2.5 py-1 rounded-full">
          {savedIdeas.length} {savedIdeas.length === 1 ? 'Idea Saved' : 'Ideas Saved'}
        </span>
      </div>

      {/* Snap Scroll Container */}
      <main className="flex-1 w-full max-w-xl mx-auto overflow-y-auto snap-y snap-mandatory pb-12">
        {savedIdeas.length === 0 ? (
          <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 bg-white rounded-3xl border border-slate-200/80 mx-4 my-6 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 mb-4">
              <Bookmark className="w-8 h-8 stroke-[1.5]" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">No Saved Ideas Yet</h2>
            <p className="text-xs text-slate-500 max-w-xs mt-1 mb-6 leading-relaxed">
              Tap the bookmark icon on any student earning idea to save it here for quick offline access and review.
            </p>
            <Link
              href="/"
              className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm active:scale-95"
            >
              Explore 100+ Earning Ideas →
            </Link>
          </div>
        ) : (
          savedIdeas.map((idea, index) => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              index={index}
              allIdeas={ideas}
              onSaveChange={handleSaveChange}
              onShowToast={showToast}
            />
          ))
        )}
      </main>

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        ideas={ideas}
        onSelectIdea={(idea) => {
          const el = document.getElementById(`card-${idea.id}`);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />
    </div>
  );
}
