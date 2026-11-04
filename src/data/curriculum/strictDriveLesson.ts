import type { Module } from '../../types/lingoquest.ts';
import g7q1 from './sourceMap/g7q1.json'; import g7q2 from './sourceMap/g7q2.json'; import g7q3 from './sourceMap/g7q3.json'; import g7q4 from './sourceMap/g7q4.json';
import g8q1 from './sourceMap/g8q1.json'; import g8q2 from './sourceMap/g8q2.json'; import g8q3 from './sourceMap/g8q3.json'; import g8q4 from './sourceMap/g8q4.json';
import g9q1 from './sourceMap/g9q1.json'; import g9q2 from './sourceMap/g9q2.json'; import g9q3 from './sourceMap/g9q3.json'; import g9q4 from './sourceMap/g9q4.json';
import g10q1 from './sourceMap/g10q1.json'; import g10q2 from './sourceMap/g10q2.json'; import g10q3 from './sourceMap/g10q3.json'; import g10q4 from './sourceMap/g10q4.json';

type SourceModule = { sourceFile?: string; topic?: string; objectives?: string; lessonConcept?: string; whatIHaveLearned?: string; competencies?: string; activities?: Array<{section:string;content:string}>; vocabulary?: string[]; grammar?: string[]; quizzes?: {preAssessment?:string;assessment?:string} };
const MAP: Record<string, {modules: SourceModule[]}> = { '7-1':g7q1,'7-2':g7q2,'7-3':g7q3,'7-4':g7q4,'8-1':g8q1,'8-2':g8q2,'8-3':g8q3,'8-4':g8q4,'9-1':g9q1,'9-2':g9q2,'9-3':g9q3,'9-4':g9q4,'10-1':g10q1,'10-2':g10q2,'10-3':g10q3,'10-4':g10q4 };

const lines=(s?:string)=> (s||'').split(/\n+/).map(x=>x.trim()).filter(x=>x.length>2);
// Match the source's actual module/week number, never the position in a sorted array.
function sourceNumber(name: string): number | undefined {
 const patterns = [/module[ _-]*(\\d+)/i, /mod[ _-]*(\\d+)/i, /week[ _-]*(\\d+)/i, /-w(\\d+)\\b/i, /_m(\\d+)\\b/i];
 for (const pattern of patterns) { const match = name.match(pattern); if (match) return Number(match[1]); }
 return undefined;
}
export function getDriveSourceModule(module: Module): SourceModule | undefined {
 const sources = MAP[`${module.gradeLevel}-${module.quarter}`]?.modules ?? [];
 return sources.find(s => sourceNumber(s.sourceFile ?? '') === module.quarterModuleIndex);
}

export function getStrictLessonModule(module: Module): Module {
 const s=getDriveSourceModule(module); if(!s) return {...module, lessonContent: {...module.lessonContent, overview:'', melcCompetency:'', keyRules:[], examples:[], culturalConnection:'', detailedGuideSections:[], vocabularyGlossary:[], commonMistakesAndTips:[], studyChecklist:[], studyNotesSummary:''}};
 const concept=(s.lessonConcept||'').trim(); const learned=(s.whatIHaveLearned||'').trim();
 const objectives=lines(s.objectives); const summaries=lines(learned);
 const rules=(summaries.length?summaries:objectives).slice(0,12);
 const examples=(s.activities||[]).slice(0,6).map((a,i)=>({title:a.section||`Activity ${i+1}`,example:a.content,analysis:'Source activity from the module PDF.'}));
 const vocab=(s.vocabulary||[]).filter(Boolean).slice(0,20).map((v,i)=>({term:v.split(/[:–-]/)[0]?.trim()||`Term ${i+1}`,partOfSpeech:'Module vocabulary',definition:v,exampleSentence:''}));
 const grammar=(s.grammar||[]).filter(Boolean);
 return {...module,title:s.topic && !/^english$/i.test(s.topic.trim()) && !/^schools division office/i.test(s.topic.trim()) ? s.topic : module.title,lessonContent:{...module.lessonContent,
   overview:concept||s.objectives||'',
   melcCompetency:s.competencies||s.objectives||'',
   keyRules:rules.length?rules:[concept].filter(Boolean),
   examples:examples.length?examples:module.lessonContent.examples.filter(()=>false),
   culturalConnection:'',
   detailedGuideSections:[{heading:'Module Lesson Concept',content:concept,bulletPoints:objectives},{heading:'Grammar stated in the module',content:grammar.join('\n')}].filter(x=>x.content||x.bulletPoints?.length),
   vocabularyGlossary:vocab,
   commonMistakesAndTips:[],
   studyChecklist:objectives,
   studyNotesSummary:learned||concept,
 }};
}
