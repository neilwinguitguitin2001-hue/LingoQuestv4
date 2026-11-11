import React from 'react';
import { SourceIllustration } from './SourceIllustration';
import type { DigitalBlock } from '../data/curriculum/digitalContent';
import repairs from '../data/curriculum/figureRepairs.json';
import corrections from '../data/curriculum/visualCorrections.json';

type RestoredFigure =
  | { title: string; src: string; width: number; height: number; transcript: string }
  | { title: string; rows: string[][] };

type VisualCorrection = Exclude<RestoredFigure, { rows: string[][] }> | { text: string } | null;
const correctedByModule: Partial<Record<string, Record<string, VisualCorrection>>> = corrections;

export function getLessonVisualCorrection(moduleId: string, blockId: string) {
  return correctedByModule[moduleId]?.[blockId];
}

const byModule: Partial<Record<string, Record<string, RestoredFigure[]>>> = repairs;

export function getRestoredLessonFigures(moduleId: string, page: number) {
  return Object.hasOwn(byModule, moduleId) ? byModule[moduleId]?.[String(page)] : undefined;
}

export function getLessonVisualKey(moduleId: string, id: string, block?: DigitalBlock) {
  if (!block || (block.type !== 'figure' && block.type !== 'diagram')) return undefined;
  const correction = getLessonVisualCorrection(moduleId, id);
  if (correction === null) return undefined;
  if (correction) return id;
  if (block.type === 'figure' && getRestoredLessonFigures(moduleId, block.page)) return `restored-${block.page}`;
  return block.src || id;
}

export function RestoredLessonFigures({ figures, page }: { figures: RestoredFigure[]; page: number }) {
  return (
    <div className="space-y-5">
      {figures.map(figure => (
        <section key={figure.title} className="space-y-2">
          <h3 className="text-sm font-bold text-sky-950">{figure.title}</h3>
          {'src' in figure ? (
            <SourceIllustration
              imageDescription={figure.title}
              allowFullSize
              block={{ type: 'figure', page, src: figure.src, width: figure.width, height: figure.height, transcript: figure.transcript }}
            />
          ) : (
            <dl className="grid gap-2">
              {figure.rows.map(([term, meaning]) => (
                <div key={term} className="rounded-lg border border-sky-100 border-l-4 border-l-sky-600 bg-sky-50 p-3 odd:border-l-emerald-600 odd:bg-emerald-50">
                  <dt className="text-sm font-bold text-sky-950">{term}</dt>
                  <dd className="mt-1 text-sm leading-relaxed text-slate-700">{meaning}</dd>
                </div>
              ))}
            </dl>
          )}
        </section>
      ))}
    </div>
  );
}
