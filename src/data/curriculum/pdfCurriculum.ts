import type { Module } from '../../types/lingoquest';
import g7q1 from './pdf/g7q1.json';
import g7q2 from './pdf/g7q2.json';
import g7q3 from './pdf/g7q3.json';
import g7q4 from './pdf/g7q4.json';
import g8q1 from './pdf/g8q1.json';
import g8q2 from './pdf/g8q2.json';
import g8q3 from './pdf/g8q3.json';
import g8q4 from './pdf/g8q4.json';
import g9q1 from './pdf/g9q1.json';
import g9q2 from './pdf/g9q2.json';
import g9q3 from './pdf/g9q3.json';
import g9q4 from './pdf/g9q4.json';
import g10q1 from './pdf/g10q1.json';
import g10q2 from './pdf/g10q2.json';
import g10q3 from './pdf/g10q3.json';
import g10q4 from './pdf/g10q4.json';

export interface PdfExcerpt {
  term?: string;
  page: number;
  text: string;
  kind: string;

}

export interface PdfLesson {
  digitalContentUrl?: string;
  id: string;
  grade: 7 | 8 | 9 | 10;
  quarter: 1 | 2 | 3 | 4;
  sourceNumber: string;
  sourceLabel: string;
  moduleNumber: number;
  quarterModuleIndex: number;
  title: string;
  source: {
    fileId: string;
    fileName: string;
    url: string;
    sha256: string;
    pageCount: number;
    discussionPages: number[];
    notes: string[];
  };
  overview: PdfExcerpt;
  concepts: PdfExcerpt[];
  guidedAnalysis: PdfExcerpt[];
  pitfallsAndTips: PdfExcerpt[];
  vocabularyBank: PdfExcerpt[];
  selfCheck: PdfExcerpt[];
  studyCheatsheet: PdfExcerpt[];
  answerKey: PdfExcerpt[];
}

export const PDF_LESSONS = [
  ...g7q1, ...g7q2, ...g7q3, ...g7q4,
  ...g8q1, ...g8q2, ...g8q3, ...g8q4,
  ...g9q1, ...g9q2, ...g9q3, ...g9q4,
  ...g10q1, ...g10q2, ...g10q3, ...g10q4,
] as PdfLesson[];

// No topic templates, invented questions, distractors, translations, or local examples.
// Geography remains navigation branding, never lesson content.
export const PDF_MODULES: Module[] = PDF_LESSONS.map((pdf) => ({
  id: pdf.id,
  gradeLevel: pdf.grade,
  quarter: pdf.quarter,
  moduleNumber: pdf.moduleNumber,
  quarterModuleIndex: pdf.quarterModuleIndex,
  islandName: `Quarter ${pdf.quarter}`,
  islandThemeColor: '#0284C7',
  title: `${pdf.sourceLabel}: ${pdf.title}`,
  topicType: 'reading',
  pdfLesson: pdf,
  requiredPassingScore: 75,
  lessonContent: {
    overview: pdf.overview.text,
    melcCompetency: '',
    keyRules: pdf.concepts.map((c) => c.text),
    examples: pdf.guidedAnalysis.map((c) => ({ title: `PDF page ${c.page}`, example: c.text, analysis: '' })),
    culturalConnection: '',
    warmupQuestion: { question: '', options: [], correctAnswer: '', feedback: '' },
    writingPrompt: { title: '', instructions: '', sampleStarter: '' },
    vocabularyGlossary: [],
    commonMistakesAndTips: [],
    studyChecklist: pdf.selfCheck.map((c) => c.text),
    studyNotesSummary: pdf.studyCheatsheet.map((c) => c.text).join('\n\n'),
  },
  // Original assessments and answer-key pages are available in Self-Check.
  // Do not fabricate scored game questions from open-response source activities.
  quizQuestions: [],
}));
