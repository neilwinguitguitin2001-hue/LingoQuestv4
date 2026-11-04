import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { PDF_MODULES } from './data/curriculum/pdfCurriculum';
import { PdfLessonView } from './components/PdfLessonView';
import type { Module } from './types/lingoquest';
import './index.css';

function CurriculumPreview() {
  const [grade, setGrade] = useState(7);
  const [quarter, setQuarter] = useState(1);
  const [selected, setSelected] = useState<Module | null>(null);
  return <main className="min-h-screen bg-slate-50 p-4 sm:p-8">
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="rounded-2xl bg-gradient-to-r from-sky-950 to-emerald-900 p-6 text-white">
        <h1 className="text-2xl font-bold">LingoQuest · Learning Modules</h1>
        <p className="mt-2 text-sm text-sky-100">106 PDF learning modules · Grades 7–10 · Quarters 1–4</p>
      </header>
      {selected ? <PdfLessonView key={selected.id} module={selected} onBack={() => setSelected(null)} onComplete={() => {}} /> : <>
        <div className="flex flex-wrap gap-4">
          <label className="text-sm font-semibold text-slate-800">Grade
            <select value={grade} onChange={(e) => setGrade(Number(e.target.value))} className="ml-3 rounded-lg border border-sky-300 bg-white p-2">
              {[7,8,9,10].map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </label>
          <label className="text-sm font-semibold text-slate-800">Quarter
            <select value={quarter} onChange={(e) => setQuarter(Number(e.target.value))} className="ml-3 rounded-lg border border-sky-300 bg-white p-2">
              {[1,2,3,4].map((q) => <option key={q} value={q}>{q}</option>)}
            </select>
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PDF_MODULES.filter((m) => m.gradeLevel === grade && m.quarter === quarter).map((m) => <button type="button" key={m.id} onClick={() => setSelected(m)}
            className="rounded-xl border border-sky-200 bg-white p-5 text-left shadow-sm hover:border-sky-600 focus-visible:outline-2 focus-visible:outline-sky-600">
            <p className="text-xs font-bold text-sky-700">{m.pdfLesson!.sourceLabel}</p>
            <h2 className="mt-2 font-semibold text-slate-900">{m.pdfLesson!.title}</h2>
            <p className="mt-3 text-xs leading-5 text-slate-600">{m.pdfLesson!.source.fileName}</p>
          </button>)}
        </div>
      </>}
    </div>
  </main>;
}

createRoot(document.getElementById('root')!).render(<CurriculumPreview />);
