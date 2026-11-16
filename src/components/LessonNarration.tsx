import { useEffect, useRef, useState } from 'react';
import { FileText, Pause, Play, RotateCcw } from 'lucide-react';

function formatTime(seconds: number) {
  const whole = Math.floor(seconds);
  return Math.floor(whole / 60) + ':' + String(whole % 60).padStart(2, '0');
}

export function LessonNarration({ transcript, audioPath }: { transcript: string; audioPath?: string | null }) {
  const audio = useRef<HTMLAudioElement>(null);
  const [state, setState] = useState<'idle' | 'playing' | 'paused' | 'ended'>('idle');
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState(false);

  useEffect(() => {
    const player = audio.current;
    return () => { player?.pause(); };
  }, [audioPath]);

  async function togglePlayback() {
    const player = audio.current;
    if (!player) return;
    if (!player.paused) {
      player.pause();
      return;
    }
    setError(false);
    try {
      if (player.error) player.load();
      if (player.ended) player.currentTime = 0;
      await player.play();
    } catch (error) {
      if (!(error instanceof DOMException && error.name === 'AbortError')) setError(true);
    }
  }

  const Icon = state === 'playing' ? Pause : state === 'ended' ? RotateCcw : Play;
  const label = {
    idle: 'Listen to explanation',
    playing: 'Pause explanation',
    paused: 'Resume explanation',
    ended: 'Replay explanation',
  }[state];

  return (
    <div className="mt-4 space-y-2 border-t border-sky-100 pt-3">
      {audioPath ? (
        <div className="space-y-3 rounded-xl border border-sky-200 bg-white p-3">
          <audio ref={audio} preload="none" src={audioPath}
            onPlay={() => setState('playing')}
            onPause={event => setState(event.currentTarget.ended ? 'ended' : 'paused')}
            onEnded={() => setState('ended')}
            onTimeUpdate={event => setElapsed(event.currentTarget.currentTime)}
            onDurationChange={event => {
              const length = event.currentTarget.duration;
              setDuration(Number.isFinite(length) ? length : 0);
            }}
            onError={() => setError(true)}
          />
          <button type="button" onClick={togglePlayback}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border-b-2 border-emerald-800 bg-sky-700 px-4 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-sky-800 active:bg-sky-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700 sm:w-auto">
            <Icon size={16} aria-hidden="true" />
            {label}
          </button>
          {duration > 0 && (
            <div className="flex items-center gap-2">
              <input type="range" min={0} max={duration} step={0.1} value={Math.min(elapsed, duration)}
                aria-label="Seek in explanation" aria-valuetext={formatTime(elapsed) + ' of ' + formatTime(duration)}
                onChange={event => {
                  const time = Number(event.currentTarget.value);
                  if (audio.current) audio.current.currentTime = time;
                  setElapsed(time);
                }}
                className="min-w-0 flex-1 accent-sky-700"
              />
              <span className="shrink-0 text-xs tabular-nums text-slate-600">{formatTime(elapsed)} / {formatTime(duration)}</span>
            </div>
          )}
          {error && <p role="status" className="text-sm text-slate-700">Audio couldn’t play. Try again or read the transcript below.</p>}
        </div>
      ) : <p className="text-sm text-slate-600">The recorded explanation is being prepared. You can read the transcript below.</p>}
      <details className="text-sm text-slate-700">
        <summary className="cursor-pointer rounded-md py-2 font-semibold text-sky-900 focus-visible:outline-2 focus-visible:outline-sky-700">
          <FileText size={15} aria-hidden="true" className="mr-1 inline-block align-text-bottom" /> Read transcript
        </summary>
        <p className="leading-relaxed">{transcript}</p>
      </details>
    </div>
  );
}
