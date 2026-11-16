import React from 'react';
import { ArrowDown, BookOpen, MessageSquare } from 'lucide-react';
import { LessonNarration } from './LessonNarration';
import narrations from '../data/curriculum/lessonNarrations.json';
import guides from '../data/curriculum/lessonVisualGuides.json';

type Node = { label: string; text: string; highlight?: string };
type Guide = { title: string; notice: string; kind: string; nodes: Node[]; sourceSha256: string; original?: boolean };

export function LessonWorkedVisual({ moduleId, sourceSha256 }: { moduleId: string; sourceSha256: string }) {
  const guide = (guides as Partial<Record<string, Guide>>)[moduleId];
  if (!guide || guide.sourceSha256 !== sourceSha256) return null;

  const sequence = ['timeline', 'flow', 'structure'].includes(guide.kind);
  const chart = guide.kind === 'chart';
  const maximum = chart ? Math.max(...guide.nodes.map(node => Number(node.text))) : 0;

  const narration = (narrations as Partial<Record<string, { transcript: string; sourceSha256: string; audioPath: string | null }>>)[moduleId];
  const matchingNarration = narration?.sourceSha256 === sourceSha256 ? narration : undefined;

  return (
    <figure className="rounded-xl border border-sky-200 bg-sky-50/60 p-4">
      <figcaption className="mb-3 font-display text-lg font-bold text-sky-950">{guide.title}</figcaption>
      {guide.original && <p className="mb-3 text-xs font-semibold text-emerald-800">Original teaching example</p>}
      <ul className={sequence || chart ? 'space-y-2' : 'grid gap-2 min-[450px]:grid-cols-2'}>
        {guide.nodes.map((node, index) => {
          const highlight = node.highlight;
          const start = highlight ? node.text.indexOf(highlight) : -1;
          const end = start + (highlight?.length ?? 0);
          return (
            <li key={index} className="min-w-0">
              {sequence && index > 0 && <ArrowDown className="mx-auto mb-2 text-sky-700" size={16} aria-hidden="true" />}
              <div className="h-full break-words rounded-lg border border-sky-100 bg-white p-3">
                <p className="flex items-center gap-2 text-sm font-bold text-sky-950">
                  {guide.kind === 'speech' && <MessageSquare size={16} className="shrink-0" aria-hidden="true" />}
                  {guide.kind === 'story' && <BookOpen size={16} className="shrink-0" aria-hidden="true" />}
                  {node.label}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-slate-800">
                  {start < 0 ? node.text : <>{node.text.slice(0, start)}<mark className="rounded bg-amber-100 px-0.5 text-slate-950">{highlight}</mark>{node.text.slice(end)}</>}
                </p>
                {guide.kind === 'intonation' && index < 2 && (
                  <div className="mt-2 flex h-10 items-center justify-center overflow-hidden rounded bg-sky-50" aria-hidden="true">
                    <span className={`block h-0.5 w-16 rounded bg-sky-700 ${index === 0 ? 'rotate-12' : '-rotate-12'}`} />
                  </div>
                )}
                {chart && <div className="mt-2 h-2 rounded-full bg-sky-100" aria-hidden="true">
                  <div className="h-full rounded-full bg-sky-700" style={{ width: `${Number(node.text) / maximum * 100}%` }} />
                </div>}
              </div>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-sm leading-relaxed text-slate-700">{guide.notice}</p>
      {matchingNarration && <LessonNarration key={moduleId} transcript={matchingNarration.transcript} audioPath={matchingNarration.audioPath} />}
    </figure>
  );
}
