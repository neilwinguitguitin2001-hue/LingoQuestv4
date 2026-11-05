import questionBank from './pdfQuestionBank.json';
import { getDavaoOrientalIsland } from '../../types/lingoquest';
import type { QuizQuestion, TopicType, Module } from '../../types/lingoquest';
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
  sourceSections?: {id:string;title:string;kind:'discussion'|'objectives'|'activity'|'assessment'|'review'|'answers';pages:number[]}[];
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
    verifiedRecallPages?: number[];
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

// Only the reviewed PDF fields feed the original lesson UI.
function sourceTopic(title: string): TopicType {
 if (/listen/i.test(title)) return 'listening';
 if (/speak|speech|oral/i.test(title)) return 'speaking';
 if (/writ|essay|paragraph/i.test(title)) return 'writing';
 if (/view|visual/i.test(title)) return 'viewing';
 if (/verb|tense|voice|clause|phrase|grammar/i.test(title)) return 'grammar';
 if (/vocab|word|analogy/i.test(title)) return 'vocabulary';
 if (/research/i.test(title)) return 'research';
 return 'reading';
}
export const PDF_MODULES: Module[] = PDF_LESSONS.map((pdf) => {
 const questions = (questionBank[pdf.id as keyof typeof questionBank] || []) as QuizQuestion[];
 const warmup = questions.find(q=>q.type==='missingPiece' && q.options?.length);
 const writing = pdf.guidedAnalysis.find(e=>/\b(write|compose|draft|essay)\b/i.test(e.text));
 const objective = pdf.selfCheck.find(e=>e.kind==='objective');
 const island = getDavaoOrientalIsland(pdf.quarter);
 return {
  id: pdf.id, gradeLevel: pdf.grade, quarter: pdf.quarter,
  moduleNumber: pdf.moduleNumber, quarterModuleIndex: pdf.quarterModuleIndex,
  islandName: island.name, islandThemeColor: island.themeColor, title: pdf.title,
  topicType: sourceTopic(pdf.title), pdfLesson: pdf, requiredPassingScore: 75,
  lessonContent: {
   overview: pdf.overview.text,
   melcCompetency: objective ? objective.text : `Source: ${pdf.source.fileName} · PDF p. ${pdf.overview.page}`,
   keyRules: pdf.concepts.map(e=>e.text),
   examples: pdf.guidedAnalysis.map(e=>({title:`${pdf.sourceLabel} · PDF p. ${e.page}`,example:e.text,analysis:''})),
   culturalConnection: '',
   warmupQuestion: {question:warmup?.contextSentence || 'No source-supported diagnostic question has been identified in this PDF.',options:warmup?.options||[],correctAnswer:warmup?.answer||'',feedback:warmup?.explanation||''},
   writingPrompt:{title:writing?`Source activity · PDF p. ${writing.page}`:'Source review needed',instructions:writing?.text||'No source-supported writing activity has been identified in this PDF.',sampleStarter:''},
   vocabularyGlossary:pdf.vocabularyBank.map(e=>({term:e.term||'',definition:e.text,exampleSentence:'',partOfSpeech:`PDF p. ${e.page}`})),
   commonMistakesAndTips:[], studyChecklist:pdf.selfCheck.map(e=>e.text),
   studyNotesSummary:pdf.studyCheatsheet.map(e=>`PDF p. ${e.page}: ${e.text}`).join('\n\n'),
  }, quizQuestions:questions,
 };
});
