import { useState } from 'react';

interface Props {
  /** Only render the button when a plan has been calculated */
  visible: boolean;
}

export function ShareButton({ visible }: Props) {
  const [state, setState] = useState<'idle' | 'copied' | 'error'>('idle');

  if (!visible) return null;

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setState('copied');
      setTimeout(() => setState('idle'), 2000);
    } catch {
      // Clipboard API unavailable (non-HTTPS dev, old browser)
      setState('error');
      setTimeout(() => setState('idle'), 2000);
    }
  };

  return (
    <button
      onClick={handleShare}
      aria-label="Copy shareable link to clipboard"
      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-label font-semibold transition-all duration-200 border
        ${state === 'copied'
          ? 'bg-volt/15 border-volt/40 text-volt'
          : state === 'error'
          ? 'bg-red-500/10 border-red-500/30 text-red-400'
          : 'bg-surface-high border-surface-highest/60 text-ink-muted hover:text-ink hover:bg-surface-highest'
        }`}
    >
      {state === 'copied' ? (
        <>
          <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 16 16" fill="none">
            <path d="M3 8l3.5 3.5L13 4.5" stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Link copied!
        </>
      ) : state === 'error' ? (
        <>⚠ Copy failed</>
      ) : (
        <>
          <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 16 16" fill="none">
            <path d="M6.5 3.5H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-1"
                  stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            <path d="M9.5 1H15v5.5" stroke="currentColor" strokeWidth="1.4"
                  strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M15 1L8.5 7.5" stroke="currentColor" strokeWidth="1.4"
                  strokeLinecap="round"/>
          </svg>
          Share Plan
        </>
      )}
    </button>
  );
}
