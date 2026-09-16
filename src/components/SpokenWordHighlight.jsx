// SpokenWordHighlight.jsx - Real-Time Soft Blue Word Highlight for Live TTS Narration
'use client';

export default function SpokenWordHighlight({
  text,
  sectionKey,
  audioState,
  ideaId,
  className = "",
  as: Component = "span"
}) {
  if (!text) return null;

  const isActive = Boolean(
    audioState?.isPlaying &&
    !audioState?.isPaused &&
    audioState?.currentIdeaId === ideaId &&
    audioState?.activeSectionKey === sectionKey
  );

  if (!isActive || typeof text !== 'string') {
    return <Component className={className}>{text}</Component>;
  }

  // Tokenize text into words preserving spaces
  const tokens = text.split(/(\s+)/);
  let wordCounter = 0;

  return (
    <Component className={className}>
      {tokens.map((token, idx) => {
        if (/^\s+$/.test(token)) {
          return <span key={idx}>{token}</span>;
        }

        const isWordActive = (wordCounter === audioState.activeWordIndex);
        wordCounter++;

        if (isWordActive) {
          return (
            <mark
              key={idx}
              id="tts-active-word"
              className="bg-sky-200/90 text-sky-950 dark:bg-sky-500/30 dark:text-sky-200 rounded px-1 py-0.5 transition-all duration-150 shadow-xs ring-1 ring-sky-400/50 font-bold"
            >
              {token}
            </mark>
          );
        }

        return <span key={idx}>{token}</span>;
      })}
    </Component>
  );
}
