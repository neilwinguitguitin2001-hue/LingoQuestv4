import { useEffect, useRef } from 'react';

export function LessonNarration({ transcript, audioPath }: { transcript: string; audioPath?: string | null }) {
  const audio = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const player = audio.current;
    return () => { player?.pause(); };
  }, [audioPath]);

  return (
    <div className="mt-4 space-y-2 border-t border-sky-100 pt-3">
      {audioPath ? (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-sky-900">Listen to explanation</p>
          <audio ref={audio} controls preload="none" src={audioPath} aria-label="Lesson explanation" className="w-full">
            Your browser cannot play this recording. Read the transcript below.
          </audio>
        </div>
      ) : <p className="text-sm text-slate-600">The recorded explanation is being prepared. You can read the transcript below.</p>}
      <details className="text-sm text-slate-700">
        <summary className="cursor-pointer py-2 font-semibold text-sky-900">Read transcript</summary>
        <p className="leading-relaxed">{transcript}</p>
      </details>
    </div>
  );
}
