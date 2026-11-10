import React, { useState } from 'react';
import { ImageOff } from 'lucide-react';
import type { DigitalBlock } from '../data/curriculum/digitalContent';

export function SourceIllustration({
  block,
  children,
  imageDescription = 'Lesson illustration',
}: {
  block: DigitalBlock;
  children?: React.ReactNode;
  imageDescription?: string;
}) {
  const [failedSrc, setFailedSrc] = useState<string>();
  const unavailable = !children && (!block.src || block.src === failedSrc);
  const readableText = block.transcript?.trim()
    || block.labels?.map(label => label.text.trim()).filter(Boolean).join('\n');


  return (
    <figure className="pdf-source-illustration min-w-0 space-y-3">
      <div className="pdf-source-visual-stage">
        {unavailable ? (
          <div className="flex items-start gap-3 text-sm text-slate-700" role="status">
            <ImageOff className="h-5 w-5 shrink-0 text-sky-700" aria-hidden="true" />
            <p>{readableText ? 'The illustration could not load. Read its text below.' : 'The illustration could not load. Continue with Concepts & Rules.'}</p>
          </div>
        ) : (
          children || (
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
          )
        )}
      </div>
      {readableText && (
        <details className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700" open={unavailable || undefined}>
          <summary className="cursor-pointer font-semibold text-sky-900">Read illustration text</summary>
          <p className="mt-2 whitespace-pre-line break-words leading-relaxed">{readableText}</p>
        </details>
      )}
    </figure>
  );
}
