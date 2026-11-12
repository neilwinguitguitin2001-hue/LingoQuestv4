import { useEffect, useRef, useState } from 'react';
import { Music } from 'lucide-react';
import { createIslandMusic } from '../utils/islandMusic';

const preference = 'lingoquest_background_music';

export function BackgroundMusic({ paused = false }: { paused?: boolean }) {
  const [enabled, setEnabled] = useState(() => {
    try { return localStorage.getItem(preference) === 'true'; }
    catch { return false; }
  });
  const [error, setError] = useState(false);
  const context = useRef<AudioContext | null>(null);

  function startMusic() {
    if (!context.current) {
      const audio = new AudioContext();
      context.current = audio;
      createIslandMusic(audio).start();
    }
    return context.current.resume();
  }

  useEffect(() => {
    function syncPlayback() {
      const audio = context.current;
      if (!audio) return;
      const operation = enabled && !paused && !document.hidden ? audio.resume() : audio.suspend();
      void operation.catch(() => {});
    }

    function resumeOnInteraction() {
      if (!enabled || paused || document.hidden) return;
      try { void startMusic().catch(() => {}); } catch {}
    }

    syncPlayback();
    document.addEventListener('visibilitychange', syncPlayback);
    if (enabled && !paused && !context.current) {
      document.addEventListener('pointerup', resumeOnInteraction, { once: true });
      document.addEventListener('keydown', resumeOnInteraction, { once: true });
    }
    return () => {
      document.removeEventListener('visibilitychange', syncPlayback);
      document.removeEventListener('pointerup', resumeOnInteraction);
      document.removeEventListener('keydown', resumeOnInteraction);
    };
  }, [enabled, paused]);

  useEffect(() => () => {
    const audio = context.current;
    context.current = null;
    if (audio) void audio.close().catch(() => {});
  }, []);

  async function toggle() {
    const next = !enabled;
    setError(false);
    if (next && !paused) {
      try { await startMusic(); }
      catch { setError(true); return; }
    }
    setEnabled(next);
    try { localStorage.setItem(preference, String(next)); } catch {}
  }

  const label = enabled ? 'Turn off background music' : 'Turn on background music';
  return (
    <div className="relative flex shrink-0">
      <button
        type="button"
        onClick={() => void toggle()}
        aria-label="Background music"
        aria-pressed={enabled}
        title={enabled && paused ? 'Music is paused during lessons and quizzes' : label}
        className={`inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border px-2.5 text-xs font-bold transition focus-visible:outline-2 focus-visible:outline-sky-300 ${enabled
          ? 'border-emerald-400 bg-emerald-950 text-emerald-200'
          : 'border-sky-700 text-sky-200 hover:bg-white/10'}`}
      >
        <Music size={16} aria-hidden="true" />
        <span className="hidden sm:inline">Music</span>
      </button>
      {error && <p role="status" className="absolute right-0 top-12 z-50 w-44 rounded-lg bg-slate-950 p-2 text-xs text-white">Music could not start. Try again.</p>}
    </div>
  );
}
