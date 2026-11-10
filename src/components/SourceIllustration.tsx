import React, { createContext, useContext, useEffect, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import { ImageOff, Pause, Play } from 'lucide-react';
import type { DigitalBlock } from '../data/curriculum/digitalContent';

export const SourceMotionContext = createContext(false);

export function SourceIllustration({
  block,
  children,
  imageDescription = 'Lesson illustration',
}: {
  block: DigitalBlock;
  children?: React.ReactNode;
  imageDescription?: string;
}) {
  const reduced = useReducedMotion();
  const dataSaver = useContext(SourceMotionContext);
  const [playing, setPlaying] = useState(false);
  const [failedSrc, setFailedSrc] = useState<string>();
  const unavailable = !children && (!block.src || block.src === failedSrc);
  const readableText = block.transcript?.trim()
    || block.labels?.map(label => label.text.trim()).filter(Boolean).join('\n');

  useEffect(() => {
    if (!playing) return;
    const timer = setTimeout(() => setPlaying(false), 4200);
    return () => clearTimeout(timer);
  }, [playing]);

  return (
    <figure className="pdf-source-illustration min-w-0 space-y-3" data-playing={playing && !reduced && !dataSaver}>
      <div className="pdf-source-visual-stage">
        {unavailable ? (
          <div className="flex items-start gap-3 text-sm text-slate-700" role="status">
            <ImageOff className="h-5 w-5 shrink-0 text-sky-700" aria-hidden="true" />
            <p>{readableText ? 'The illustration could not load. Read its text below.' : 'The illustration could not load. Continue with Concepts & Rules.'}</p>
          </div>
        ) : (
          <div className="pdf-source-ink-reveal">
            {children || (
              <img
                src={block.src}
                alt={imageDescription}
                width={block.width}
                height={block.height}
                loading="lazy"
                decoding="async"
                onError={() => setFailedSrc(block.src)}
                className="mx-auto block h-auto max-h-[34rem] max-w-full object-contain"
              />
            )}
          </div>
        )}
      </div>
      {!unavailable && (
        <figcaption className="flex flex-wrap gap-2 text-xs text-slate-600">
          <button type="button" onClick={() => setPlaying(value => !value)} disabled={!!reduced || dataSaver} aria-pressed={playing}
            className="inline-flex items-center gap-1.5 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 font-semibold text-sky-800 disabled:opacity-60">
            {playing ? <Pause size={13} aria-hidden="true" /> : <Play size={13} aria-hidden="true" />}
            {dataSaver ? 'Data Saver · Static' : reduced ? 'Reduced motion' : playing ? 'Stop animation' : 'Play illustration'}
          </button>
        </figcaption>
      )}
      {readableText && (
        <details className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700" open={unavailable || undefined}>
          <summary className="cursor-pointer font-semibold text-sky-900">Read illustration text</summary>
          <p className="mt-2 whitespace-pre-line break-words leading-relaxed">{readableText}</p>
        </details>
      )}
    </figure>
  );
}
