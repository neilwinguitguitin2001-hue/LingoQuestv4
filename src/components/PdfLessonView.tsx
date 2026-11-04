import React, { useState } from 'react';
import type { Module } from '../types/lingoquest';
import type { PdfExcerpt, PdfLesson } from '../data/curriculum/pdfCurriculum';

const SECTIONS = [
  ['concepts', 'Concepts & Rules'],
  ['guidedAnalysis', 'Guided Analysis'],
  ['pitfallsAndTips', 'Pitfalls & Tips'],
  ['vocabularyBank', 'Vocabulary Bank'],
  ['selfCheck', 'Self-Check'],
  ['studyCheatsheet', 'Study Cheatsheet'],
] as const;
type Section = typeof SECTIONS[number][0];

function SourceExcerpt({ excerpt, lesson }: { excerpt: PdfExcerpt; lesson: PdfLesson }) {
  return (
    <article className="rounded-xl border border-sky-200 bg-white p-5 shadow-sm">
      <a href={`${lesson.source.url}#page=${excerpt.page}`} target="_blank" rel="noreferrer"
        className="text-xs font-semibold text-sky-700 underline underline-offset-2">
        {lesson.sourceLabel} · PDF page {excerpt.page}
      </a>
      {excerpt.image ? <>
        <a href={`${lesson.source.url}#page=${excerpt.page}`} target="_blank" rel="noreferrer" aria-label={`Open original PDF page ${excerpt.page}`}>
          <img src={excerpt.image} alt={`Original instructional page, PDF page ${excerpt.page}`}
            className="mt-4 mx-auto w-full max-w-2xl" loading="lazy" />
        </a>
        <details className="mt-4 border-t border-sky-100 pt-3">
          <summary className="cursor-pointer text-sm font-semibold text-sky-800">Text transcript</summary>
          <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-slate-800">{excerpt.text}</p>
        </details>
      </> : <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-slate-800">{excerpt.text}</p>}
    </article>
  );
}

export function PdfLessonView({ module, initialSelfCheck = false, onBack, onComplete }: {
  module: Module;
  initialSelfCheck?: boolean;
  onBack: () => void;
  onComplete: () => void;
}) {
  const lesson = module.pdfLesson!;
  const [active, setActive] = useState<Section>(initialSelfCheck ? 'selfCheck' : 'concepts');
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [completed, setCompleted] = useState(false);
  const [copyStatus, setCopyStatus] = useState('');
  const excerpts = lesson[active];
  const label = SECTIONS.find(([key]) => key === active)![1];

  async function copyNotes() {
    try {
      await navigator.clipboard.writeText([
        `Grade ${lesson.grade} · Quarter ${lesson.quarter} · ${lesson.sourceLabel}`,
        lesson.title, lesson.source.fileName, lesson.source.url,
        ...lesson.studyCheatsheet.map((e) => `PDF p. ${e.page}: ${e.text}`),
      ].join('\n\n'));
      setCopyStatus('Notes copied');
    } catch { setCopyStatus('Copy unavailable. Select the notes to copy them.'); }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button type="button" onClick={onBack} className="rounded-lg border border-sky-300 px-4 py-2 text-sm text-sky-800">Back to modules</button>
        <button type="button" onClick={() => { onComplete(); setCompleted(true); }} disabled={completed}
          className="rounded-lg bg-sky-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
          {completed ? 'Lesson marked complete' : 'Mark lesson complete'}
        </button>
      </div>
      <header className="rounded-2xl bg-gradient-to-r from-sky-950 via-sky-900 to-emerald-900 p-6 text-white">
        <p className="text-xs font-semibold text-sky-200">Grade {lesson.grade} · Quarter {lesson.quarter} · {lesson.sourceLabel}</p>
        <h1 className="mt-2 text-2xl font-bold">{lesson.title}</h1>
        <div className="mt-5 border-t border-sky-700 pt-4">
          <h2 className="font-semibold text-sky-100">Lesson Concept / Overview</h2>
          <p className="mt-2 text-sm leading-7">{lesson.overview.text}</p>
          <p className="mt-2 text-xs text-sky-200">From the instructional discussion · PDF page {lesson.overview.page}</p>
        </div>
        <a className="mt-4 inline-block text-sm text-sky-100 underline" href={lesson.source.url} target="_blank" rel="noreferrer">
          Open learning module: {lesson.source.fileName}
        </a>
        <p className="mt-2 text-xs text-sky-200">View the original PDF for illustrations, tables, and activity layouts.</p>
        {lesson.source.notes.map((note) => <p key={note} className="mt-3 rounded-lg bg-white/10 p-3 text-sm">{note}</p>)}
      </header>
      <nav aria-label="Lesson sections" className="flex flex-wrap gap-2">
        {SECTIONS.map(([key, name]) => (
          <button type="button" key={key} aria-pressed={active === key} onClick={() => setActive(key)}
            className={`rounded-lg border px-3 py-2 text-sm font-semibold ${active === key ? 'border-sky-700 bg-sky-700 text-white' : 'border-sky-200 bg-white text-sky-900'}`}>
            {name}
          </button>
        ))}
      </nav>
      <section aria-label={label} className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">{label}</h2>
        {active === 'studyCheatsheet' && <div>
          <button type="button" onClick={copyNotes} className="rounded-lg border border-sky-300 px-3 py-2 text-sm text-sky-800">Copy study notes</button>
          <span role="status" className="ml-3 text-sm text-slate-600">{copyStatus}</span>
        </div>}
        {excerpts.length === 0 && <p className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600">No separate {label.toLowerCase()} material has been extracted from this PDF.</p>}
        {excerpts.map((excerpt, i) => {
          const key = `${active}-${i}`;
          return <div key={key}>
            <SourceExcerpt excerpt={excerpt} lesson={lesson} />
            {active === 'selfCheck' && <label className="mt-3 block text-sm font-semibold text-slate-700">
              Your response or review notes
              <textarea value={responses[key] || ''} onChange={(e) => setResponses((prev) => ({ ...prev, [key]: e.target.value }))}
                rows={4} className="mt-2 block w-full rounded-lg border border-sky-200 bg-white p-3 font-normal" />
            </label>}
          </div>;
        })}
        {active === 'selfCheck' && <details className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
          <summary className="cursor-pointer font-semibold text-emerald-900">Source answer key / checking guide</summary>
          <p className="my-3 text-sm text-slate-700">Use the PDF’s key and rubrics to review your work. Open responses and performances may need teacher feedback.</p>
          <div className="space-y-3">{lesson.answerKey.map((e, i) => <SourceExcerpt key={i} excerpt={e} lesson={lesson} />)}</div>
          {lesson.answerKey.length === 0 && <a className="text-sm text-sky-800 underline" href={lesson.source.url} target="_blank" rel="noreferrer">Open the original PDF to check your work</a>}
        </details>}
      </section>
    </div>
  );
}
