import { useRef, useState } from 'react';
import { Film, FileText } from 'lucide-react';

export const ANALOGY_VIDEO_SOURCE = '90d3d6aa4700af691bdb952c37c12918515f57c39ecc4e351c68839e8d13499d';
export function AnalogyVideoExplainer({moduleId, sourceSha256}: {moduleId: string; sourceSha256: string}) {
  const [failed, setFailed] = useState(false);
  const player = useRef<HTMLVideoElement>(null);
  if (moduleId !== 'g7-q1-m1' || sourceSha256 !== ANALOGY_VIDEO_SOURCE) return null;
  return <section className="space-y-3 rounded-xl border border-sky-200 bg-gradient-to-br from-sky-50 to-emerald-50 p-3 sm:p-4" aria-labelledby="analogy-video-title">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h3 id="analogy-video-title" className="flex items-center gap-2 font-display text-lg font-bold text-sky-950"><Film size={18} aria-hidden="true"/> Watch &amp; Understand</h3>
      <span className="rounded-full border border-emerald-200 bg-white px-2.5 py-1 text-xs font-semibold text-emerald-800">Optional · English · 1 min 11 sec</span>
    </div>
    <p id="analogy-video-prompt" className="text-sm leading-relaxed text-slate-700">Watch the same setting change from night to day and the same character change from happy to sad. What relationship do both pairs share?</p>
    <video ref={player} controls playsInline preload="none" poster="/video/lessons/g7-q1-m1-analogy.jpg"
      aria-label="Analogy: match the relationship — narrated animated explainer" aria-describedby="analogy-video-prompt"
      className="aspect-video w-full rounded-lg bg-slate-950" onError={() => setFailed(true)}
      onPlay={() => {
        setFailed(false);
        // Keep two recorded explanations from speaking over each other.
        document.querySelectorAll<HTMLMediaElement>('audio, video').forEach(media => { if (media !== player.current) media.pause(); });
      }}>
      <source src="/video/lessons/g7-q1-m1-analogy.mp4" type="video/mp4"/>
      <track kind="captions" src="/video/lessons/g7-q1-m1-analogy.en.vtt" srcLang="en" label="English" default/>
      Your browser cannot play this video. Read the transcript below or use the illustrated lesson examples.
    </video>
    {failed && <p role="status" className="text-sm text-slate-700">The video could not load. You can read the transcript below and continue with the lesson and quiz.</p>}
    <p className="text-xs leading-relaxed text-slate-600">Original animated teaching scenes based on this module’s discussion. Watching is optional and does not affect your score or lesson completion.</p>
    <details className="rounded-lg border border-sky-100 bg-white text-sm text-slate-700">
      <summary className="cursor-pointer rounded-lg p-3 font-semibold text-sky-900 focus-visible:outline-2 focus-visible:outline-sky-700"><FileText size={15} className="mr-1 inline" aria-hidden="true"/> Read the video transcript</summary>
      <div className="space-y-3 px-3 pb-3 leading-relaxed">
        <p>How do two pairs of words belong together? An analogy links the relationship in one pair to the relationship in another. Look at night and day. They’re opposites. Now compare happy and sad: they’re opposites too. That’s why these two pairs fit. We call words with opposite meanings antonyms.</p>
        <p>The single colon means “is to.” The double colon means “as.” Read it: night is to day as happy is to sad. Notice the matching arrows. But sharing a topic isn’t enough; the relationship must match.</p>
        <p>Here’s another relationship from your module. A greeting is part of a letter, just as a title page is part of a book. Both pairs go from a part to its whole. That’s a part-to-whole analogy. Keep that order when you read and compare the pairs.</p>
        <p>The module also names synonyms: words with similar meanings. Cause and effect connects a condition to its result. Location connects something to the place where it belongs.</p>
        <p>Start by saying how the first pair is connected, then check the second pair in the same direction. So an analogy isn’t just a pair of words. It’s two pairs linked by the same relationship.</p>
      </div>
    </details>
  </section>;
}
