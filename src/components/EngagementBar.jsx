// EngagementBar.jsx - Interactive Like, Share, Save & 12-Section Voice Narration
'use client';

import { useState, useEffect } from 'react';
import { Heart, Share2, Bookmark, Volume2, Copy, Check } from 'lucide-react';
import { getLikedMap, toggleLike, getSavedIds, toggleSave } from '../lib/ideasStore';
import { tts } from '../lib/ttsService';
import { trackEvent } from '../lib/analytics';

export default function EngagementBar({ idea, onSaveChange, onShowToast }) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(typeof idea.likes === 'number' ? idea.likes : 0);
  const [isSaved, setIsSaved] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);

  useEffect(() => {
    const likedMap = getLikedMap();
    setIsLiked(!!likedMap[idea.id]);

    const savedIds = getSavedIds();
    setIsSaved(savedIds.includes(idea.id));

    setLikeCount(typeof idea.likes === 'number' ? idea.likes : 0);

    // Subscribe to TTS status
    const unsubscribe = tts.subscribe(({ isPlaying, isPaused, currentIdeaId }) => {
      setIsPlayingAudio(isPlaying && !isPaused && currentIdeaId === idea.id);
    });

    return () => unsubscribe();
  }, [idea.id, idea.likes]);

  // Handle Like
  const handleLike = () => {
    const nextLiked = toggleLike(idea.id);
    setIsLiked(nextLiked);
    setLikeCount(prev => nextLiked ? prev + 1 : Math.max(0, prev - 1));
    trackEvent('like', { ideaId: idea.id, liked: nextLiked });
  };

  // Handle Save
  const handleSave = () => {
    const nextSaved = toggleSave(idea.id);
    setIsSaved(nextSaved);
    if (onSaveChange) onSaveChange(nextSaved);
    trackEvent('save', { ideaId: idea.id, saved: nextSaved });
    if (onShowToast) {
      onShowToast(nextSaved ? "Saved to your list!" : "Removed from saved list.");
    }
  };

  // Handle Share
  const handleShare = async () => {
    const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/idea/${idea.slug}` : '';
    const shareTitle = `${idea.title} - 100+ Ways to Earn`;
    const shareText = `Check out this student earning blueprint: ${idea.title} (Investment: ${idea.investment}, Profit: ${idea.estimatedProfit})!`;

    trackEvent('share', { ideaId: idea.id });

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl
        });
        return;
      } catch (err) {}
    }
    setShowShareModal(true);
  };

  // Direct Social Share URLs
  const getShareUrl = () => typeof window !== 'undefined' ? `${window.location.origin}/idea/${idea.slug}` : '';
  const getShareText = () => encodeURIComponent(`🔥 Check out this student earning idea: "${idea.title}" (${idea.investment} investment, ${idea.estimatedProfit})! Read the free guide: ${getShareUrl()}`);

  const copyToClipboard = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(getShareUrl());
      setHasCopied(true);
      if (onShowToast) onShowToast("Link copied to clipboard!");
      setTimeout(() => setHasCopied(false), 2000);
    }
  };

  // Handle Audio Listen (exact 12-section audio reader)
  const handleListen = () => {
    tts.playIdea(idea);
    trackEvent('audio_listen', { ideaId: idea.id });
  };

  // Format like count nicely (e.g. 2.4k)
  const formatCount = (num) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num;
  };

  return (
    <>
      <div className="grid grid-cols-4 gap-2 py-3 border-y border-slate-100 dark:border-slate-800 my-3 select-none">
        {/* Like Button */}
        <button
          onClick={handleLike}
          className={`flex flex-col items-center justify-center gap-1 py-1.5 px-2 rounded-xl transition-all active:scale-90 ${
            isLiked 
              ? 'text-rose-600 bg-rose-50/80 dark:bg-rose-950/40 font-semibold' 
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
          }`}
          aria-label={`Like idea. Current count: ${likeCount}`}
        >
          <Heart className={`w-5 h-5 transition-transform ${isLiked ? 'fill-rose-600 text-rose-600 scale-110' : 'stroke-[1.8]'}`} />
          <span className="text-[11px] font-semibold">{formatCount(likeCount)}</span>
          <span className="text-[9px] uppercase tracking-wider text-slate-600 dark:text-slate-400 font-medium">Like</span>
        </button>

        {/* Share Button */}
        <button
          onClick={handleShare}
          className="flex flex-col items-center justify-center gap-1 py-1.5 px-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all active:scale-90"
          aria-label="Share this idea"
        >
          <Share2 className="w-5 h-5 stroke-[1.8]" />
          <span className="text-[11px] font-semibold">Share</span>
          <span className="text-[9px] uppercase tracking-wider text-slate-600 dark:text-slate-400 font-medium">Send</span>
        </button>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className={`flex flex-col items-center justify-center gap-1 py-1.5 px-2 rounded-xl transition-all active:scale-90 ${
            isSaved 
              ? 'text-teal-700 dark:text-teal-400 bg-teal-50/80 dark:bg-teal-950/40 font-semibold' 
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
          }`}
          aria-label={isSaved ? "Saved to your list" : "Save this idea"}
        >
          <Bookmark className={`w-5 h-5 transition-transform ${isSaved ? 'fill-teal-600 dark:fill-teal-400 text-teal-600 dark:text-teal-400 scale-110' : 'stroke-[1.8]'}`} />
          <span className="text-[11px] font-semibold">{isSaved ? "Saved" : "Save"}</span>
          <span className="text-[9px] uppercase tracking-wider text-slate-600 dark:text-slate-400 font-medium">Bookmark</span>
        </button>

        {/* Listen (TTS Audio) Button */}
        <button
          onClick={handleListen}
          className={`flex flex-col items-center justify-center gap-1 py-1.5 px-2 rounded-xl transition-all active:scale-90 ${
            isPlayingAudio 
              ? 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40 font-semibold' 
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
          }`}
          aria-label={isPlayingAudio ? "Pause audio narration" : "Listen to idea audio guide"}
        >
          {isPlayingAudio ? (
            <div className="flex items-center gap-0.5 h-5">
              <span className="w-1 bg-sky-600 dark:bg-sky-400 h-3 animate-pulse rounded-full" />
              <span className="w-1 bg-sky-600 dark:bg-sky-400 h-5 animate-bounce rounded-full" />
              <span className="w-1 bg-sky-600 dark:bg-sky-400 h-3 animate-pulse rounded-full" />
            </div>
          ) : (
            <Volume2 className="w-5 h-5 stroke-[1.8]" />
          )}
          <span className="text-[11px] font-semibold">{isPlayingAudio ? "Playing" : "Listen"}</span>
          <span className="text-[9px] uppercase tracking-wider text-slate-600 dark:text-slate-400 font-medium">Audio</span>
        </button>
      </div>

      {/* Share Fallback Modal */}
      {showShareModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs flex items-end sm:items-center justify-center p-4 animate-in fade-in"
          onClick={() => setShowShareModal(false)}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl p-5 w-full max-w-sm shadow-xl border border-slate-100 dark:border-slate-800"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Share Earning Blueprint</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5">
              <a
                href={`https://api.whatsapp.com/send?text=${getShareText()}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 text-sm font-semibold transition-all"
              >
                <span className="flex items-center gap-2">
                  <span className="text-lg">💬</span> Share on WhatsApp
                </span>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Open</span>
              </a>

              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(getShareUrl())}&text=${getShareText()}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-xl bg-sky-50 dark:bg-sky-950/50 hover:bg-sky-100 text-sky-800 dark:text-sky-300 text-sm font-semibold transition-all"
              >
                <span className="flex items-center gap-2">
                  <span className="text-lg">✈️</span> Share on Telegram
                </span>
                <span className="text-xs text-sky-600 dark:text-sky-400 font-medium">Open</span>
              </a>

              <button
                onClick={copyToClipboard}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-sm font-semibold transition-all"
              >
                <span className="flex items-center gap-2">
                  {hasCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  {hasCopied ? "Link Copied!" : "Copy Clean Link"}
                </span>
                <span className="text-xs text-slate-500 font-medium">URL</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
