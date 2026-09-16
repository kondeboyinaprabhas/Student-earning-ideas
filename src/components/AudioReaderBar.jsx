// AudioReaderBar.jsx - Floating Interactive Voice Player with 12-Section Progress Controls
'use client';

import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, X, Volume2, UserCheck, ChevronUp } from 'lucide-react';
import { tts } from '@/lib/ttsService';

export default function AudioReaderBar() {
  const [audioState, setAudioState] = useState({
    isPlaying: false,
    isPaused: false,
    currentIdea: null,
    currentSectionIndex: 0,
    totalSections: 10,
    currentSectionLabel: '',
    progress: 0,
    voices: [],
    currentVoiceURI: null
  });

  const [showVoiceSelect, setShowVoiceSelect] = useState(false);

  useEffect(() => {
    const unsubscribe = tts.subscribe(state => {
      setAudioState(state);
    });
    return () => unsubscribe();
  }, []);

  if (!audioState.isPlaying && !audioState.isPaused) {
    return null;
  }

  const handleTogglePlay = () => {
    if (audioState.isPaused) {
      tts.resume();
    } else {
      tts.pause();
    }
  };

  const handleRestart = () => {
    tts.restart();
  };

  const handleClose = () => {
    tts.stop();
  };

  const handleVoiceChange = (e) => {
    tts.setPreferredVoice(e.target.value);
    setShowVoiceSelect(false);
  };

  return (
    <div className="fixed bottom-3 inset-x-3 sm:max-w-xl sm:mx-auto z-50 animate-in slide-in-from-bottom duration-300">
      <div className="bg-slate-900/95 dark:bg-slate-950/95 text-white backdrop-blur-md rounded-2xl p-3.5 shadow-2xl border border-slate-700/80 dark:border-slate-800 space-y-2">
        {/* Top Info Bar */}
        <div className="flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 overflow-hidden">
            {/* Equalizer / Speaker Animation */}
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
              {audioState.isPlaying && !audioState.isPaused ? (
                <div className="flex items-center gap-0.5 h-3.5">
                  <span className="w-1 bg-teal-400 h-2 animate-pulse rounded-full" />
                  <span className="w-1 bg-teal-400 h-3.5 animate-bounce rounded-full" />
                  <span className="w-1 bg-teal-400 h-2 animate-pulse rounded-full" />
                </div>
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </div>

            <div className="overflow-hidden">
              <span className="font-bold text-slate-100 truncate block text-xs">
                {audioState.currentIdea?.title}
              </span>
              <div className="flex items-center gap-2 text-[10px] text-teal-400 font-medium mt-0.5">
                <span className="bg-teal-500/20 px-1.5 py-0.5 rounded font-mono">
                  {audioState.currentSectionLabel || `Section ${audioState.currentSectionIndex + 1} of ${audioState.totalSections || 10}`}
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-sky-300 font-semibold truncate max-w-[140px] sm:max-w-xs">
                  {audioState.activeWord ? `“${audioState.activeWord}”` : "Founder Voice Active"}
                </span>
              </div>
            </div>
          </div>

          {/* Player Action Buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Voice Menu Toggle */}
            <button
              onClick={() => setShowVoiceSelect(prev => !prev)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Change narrator voice"
              aria-label="Change audio voice"
            >
              <UserCheck className="w-4 h-4 text-teal-400" />
            </button>

            {/* Restart */}
            <button
              onClick={handleRestart}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Restart from beginning"
              aria-label="Restart audio from headline"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Play/Pause */}
            <button
              onClick={handleTogglePlay}
              className="w-8 h-8 rounded-full bg-teal-500 hover:bg-teal-400 text-slate-950 flex items-center justify-center font-bold transition-all active:scale-90"
              aria-label={audioState.isPaused ? "Resume audio narration" : "Pause audio narration"}
            >
              {audioState.isPaused ? (
                <Play className="w-4 h-4 fill-slate-950 ml-0.5" />
              ) : (
                <Pause className="w-4 h-4 fill-slate-950" />
              )}
            </button>

            {/* Close */}
            <button
              onClick={handleClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
              title="Stop and close player"
              aria-label="Stop audio player"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 12-Section Progress Bar */}
        <div className="w-full bg-slate-800 dark:bg-slate-900 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-teal-500 to-emerald-400 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${audioState.progress}%` }}
          />
        </div>

        {/* Voice Selector Panel (If toggled) */}
        {showVoiceSelect && audioState.voices.length > 0 && (
          <div className="pt-2 border-t border-slate-800 animate-in fade-in flex items-center justify-between gap-2 text-xs">
            <span className="text-[11px] text-slate-400 font-medium">Select Voice:</span>
            <select
              value={audioState.currentVoiceURI || ''}
              onChange={handleVoiceChange}
              className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg p-1.5 outline-none max-w-[200px] truncate"
            >
              {audioState.voices.map((v) => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
}
