
'use client';

import { naturalizeCurrencyInText } from './currencySpoken';

const VOICE_PREF_KEY = 'sei_preferred_voice_v1';

class AudioReaderEngine {
  constructor() {
    this.currentIdea = null;
    this.currentIdeaId = null;
    this.isPlaying = false;
    this.isPaused = false;
    this.currentSectionIndex = 0;
    this.sections = [];
    this.listeners = new Set();
    this.preferredVoiceURI = null;
    this.utterance = null;

    // Highlight state
    this.activeWord = '';
    this.activeWordIndex = -1;
    this.activeSectionKey = '';

    // Playback protection
    this.playbackToken = 0;
    this.currentWords = [];
    this.boundaryTimer = null;

    if (typeof window !== 'undefined') {
      this.preferredVoiceURI = localStorage.getItem(VOICE_PREF_KEY);

      if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = () => this.notify();
      }
    }
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notify() {
    const progress =
      this.sections.length > 0
        ? Math.round(((this.currentSectionIndex + 1) / this.sections.length) * 100)
        : 0;

    const currentSection = this.sections[this.currentSectionIndex];

    for (const cb of this.listeners) {
      cb({
        isPlaying: this.isPlaying,
        isPaused: this.isPaused,
        currentIdea: this.currentIdea,
        currentIdeaId: this.currentIdeaId,
        currentSectionIndex: this.currentSectionIndex,
        totalSections: this.sections.length,
        currentSectionLabel: currentSection?.label || '',
        activeSectionKey: this.activeSectionKey || currentSection?.key || '',
        activeWord: this.activeWord,
        activeWordIndex: this.activeWordIndex,
        progress,
        voices: this.getVoices(),
        currentVoiceURI: this.getBestVoice()?.voiceURI,
      });
    }
  }

  getVoices() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
    return window.speechSynthesis.getVoices().filter((v) => v.lang.startsWith('en'));
  }

  getBestVoice() {
    const voices = this.getVoices();
    if (!voices.length) return null;

    if (this.preferredVoiceURI) {
      const preferred = voices.find((v) => v.voiceURI === this.preferredVoiceURI);
      if (preferred) return preferred;
    }

    const femaleKeywords = [
      'female',
      'zira',
      'samantha',
      'victoria',
      'karen',
      'moira',
      'fiona',
      'tessa',
      'google uk english female',
      'google us english',
    ];

    const femaleVoice = voices.find((v) => {
      const lower = v.name.toLowerCase();
      return femaleKeywords.some((k) => lower.includes(k));
    });

    return femaleVoice || voices[0];
  }

  setPreferredVoice(voiceURI) {
    this.preferredVoiceURI = voiceURI;

    if (typeof window !== 'undefined') {
      localStorage.setItem(VOICE_PREF_KEY, voiceURI);
    }

    this.notify();
  }

  buildSections(idea) {
    const howItWorks = idea.breakdown?.howItWorks || [];

    const howItWorksRaw =
      howItWorks.length > 0
        ? `Here is how the business model works in practice. ${howItWorks.join('. ')}.`
        : `Here is how it works. You can deliver this service digitally with simple tools.`;

    const stepsRaw =
      (idea.implementationSteps || []).length > 0
        ? `Let's walk through the step-by-step implementation. ` +
        (idea.implementationSteps || [])
          .map(
            (s) =>
              `Step ${s.step}: ${s.title}. ${s.detail}. ${s.proTip ? `Founder pro tip: ${s.proTip}.` : ''
              }`
          )
          .join(' ')
        : `Start by preparing your portfolio, testing with initial peers, and expanding outreach.`;

    const risksRaw =
      (idea.risks || []).length > 0
        ? `Now, let's cover the real risks and how to protect yourself. ` +
        (idea.risks || [])
          .map(
            (r) =>
              `A key risk is ${r.risk}. You can avoid this by: ${r.mitigation}.`
          )
          .join(' ')
        : `Always protect against scope creep and delayed client payments with clear upfront expectations.`;

    return [
      {
        key: 'title',
        label: 'Headline',
        rawText: idea.title,
        text: naturalizeCurrencyInText(`${idea.title}.`),
      },
      {
        key: 'subtitle',
        label: 'Tagline',
        rawText: idea.subtitle,
        text: naturalizeCurrencyInText(`${idea.subtitle}.`),
      },
      {
        key: 'summary',
        label: 'Idea Breakdown',
        rawText: idea.breakdown?.summary || idea.subtitle,
        text: naturalizeCurrencyInText(
          `${idea.breakdown?.summary || idea.subtitle}. ${idea.breakdown?.bestFor
            ? `This opportunity is especially suitable for ${idea.breakdown.bestFor.replace(
              /^for\s+/i,
              ''
            )}.`
            : ''
          }`
        ),
      },
      {
        key: 'howItWorks',
        label: 'How It Works',
        rawText: howItWorksRaw,
        text: naturalizeCurrencyInText(howItWorksRaw),
      },
      {
        key: 'investment',
        label: 'Initial Investment',
        rawText: idea.investment,
        text: naturalizeCurrencyInText(
          `To get started, your initial investment is ${idea.investment}.`
        ),
      },
      {
        key: 'profit',
        label: 'Estimated Profit',
        rawText: idea.estimatedProfit,
        text: naturalizeCurrencyInText(
          `In terms of earnings potential, you can expect an estimated profit of ${idea.estimatedProfit}.`
        ),
      },
      {
        key: 'payback',
        label: 'Payback Period',
        rawText: idea.paybackPeriod || 'Instant',
        text: naturalizeCurrencyInText(
          `Your expected payback period is ${idea.paybackPeriod || 'instant upon your very first sale'
          }.`
        ),
      },
      {
        key: 'commitment',
        label: 'Time & Difficulty',
        rawText: `${idea.timeRequired || '1 to 2 hours daily'} • ${idea.difficulty || 'Beginner Friendly'
          }`,
        text: naturalizeCurrencyInText(
          `In terms of commitment, it requires about ${idea.timeRequired || '1 to 2 hours daily'
          }, with a ${idea.difficulty || 'beginner friendly'} learning curve.`
        ),
      },
      {
        key: 'steps',
        label: 'Step-by-Step Guide',
        rawText: stepsRaw,
        text: naturalizeCurrencyInText(stepsRaw),
      },
      {
        key: 'risks',
        label: 'Risks & Reality Check',
        rawText: risksRaw,
        text: naturalizeCurrencyInText(risksRaw),
      },
    ];
  }

  clearWordTimer() {
    if (this.boundaryTimer) {
      clearInterval(this.boundaryTimer);
      this.boundaryTimer = null;
    }
  }

  startFromSection(index) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    this.clearWordTimer();

    if (index >= this.sections.length) {
      this.stop();
      return;
    }

    this.currentSectionIndex = index;

    const token = ++this.playbackToken;

    window.speechSynthesis.cancel();

    this.activeWord = '';
    this.activeWordIndex = -1;
    this.activeSectionKey = '';

    const current = this.sections[index];

    this.currentWords = current.text.trim().split(/\s+/);

    const utterance = new SpeechSynthesisUtterance(current.text);

    const voice = this.getBestVoice();
    if (voice) utterance.voice = voice;

    utterance.rate = 0.94;
    utterance.pitch = 1.02;

    utterance.onboundary = (event) => {
      if (token !== this.playbackToken) return;

      if (typeof event.charIndex !== 'number') return;

      const spokenText = current.text.slice(0, event.charIndex);

      const wordIndex = spokenText.trim()
        ? spokenText.trim().split(/\s+/).length
        : 0;

      const safeIndex = Math.min(
        Math.max(wordIndex, 0),
        this.currentWords.length - 1
      );

      if (safeIndex !== this.activeWordIndex && this.currentWords[safeIndex]) {
        this.activeWordIndex = safeIndex;
        this.activeWord = this.currentWords[safeIndex].replace(
          /[.,!?;:()"']/g,
          ''
        );
        this.activeSectionKey = current.key;
        this.notify();
      }
    };

    utterance.onend = () => {
      if (token !== this.playbackToken) return;

      this.clearWordTimer();

      if (this.currentSectionIndex + 1 < this.sections.length && this.isPlaying) {
        // If the just-finished section was the Idea Breakdown, stop playback
        const justFinished = this.sections[this.currentSectionIndex];
        if (justFinished.key === 'summary') {
          this.stop();
        } else {
          this.startFromSection(this.currentSectionIndex + 1);
        }
      } else {
        this.stop();
      }
    };

    utterance.onerror = (e) => {
      if (token !== this.playbackToken) return;

      console.warn('[TTS Error]', e);
      this.clearWordTimer();
      this.stop();
    };

    this.utterance = utterance;
    window.speechSynthesis.speak(utterance);
    this.notify();
  }

  playIdea(idea) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported on this device.');
      return;
    }

    if (this.currentIdeaId === idea.id) {
      if (this.isPlaying && !this.isPaused) {
        this.pause();
        return;
      }

      if (this.isPaused) {
        this.resume();
        return;
      }
    }

    this.currentIdea = idea;
    this.currentIdeaId = idea.id;
    this.sections = this.buildSections(idea);
    this.isPlaying = true;
    this.isPaused = false;

    this.startFromSection(0);
  }

  pause() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.pause();

    this.isPaused = true;
    this.notify();
  }

  resume() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.resume();

    this.isPaused = false;
    this.notify();
  }

  restart() {
    if (this.currentIdea) {
      this.startFromSection(0);
    }
  }

  stop() {
    this.clearWordTimer();

    this.playbackToken++;

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    this.isPlaying = false;
    this.isPaused = false;
    this.currentIdea = null;
    this.currentIdeaId = null;
    this.currentSectionIndex = 0;
    this.activeWord = '';
    this.activeWordIndex = -1;
    this.activeSectionKey = '';
    this.currentWords = [];

    this.notify();
  }
}

export const tts = new AudioReaderEngine();