import type { DifficultyLevel, Module, QuizGameType, QuizQuestion } from '../types/lingoquest';
export const GAME_QUESTION_COUNT = 10;
export const MIXED_QUESTION_COUNT = 10;
export const SOURCE_GAME_MODES: QuizGameType[] = ['analogyMaster', 'missingPiece', 'crosswordGame', 'pictureHunt', 'typeHunter'];
export const getSessionQuestionCount=(mode:QuizGameType|'all')=>mode==='all'?MIXED_QUESTION_COUNT:GAME_QUESTION_COUNT;
function shuffled<T>(items:T[],random:()=>number){const result=[...items];for(let i=result.length-1;i>0;i--){const j=Math.min(i,Math.max(0,Math.floor(random()*(i+1))));[result[i],result[j]]=[result[j],result[i]];}return result;}
export function createSourceGameSession(module:Module,bank:QuizQuestion[],mode:QuizGameType|'all',difficulty:DifficultyLevel,random=Math.random):QuizQuestion[]|null {
 const valid=[...new Map(bank.filter(q=>module.pdfLesson&&q.source&&q.source.fileId===module.pdfLesson.source.fileId&&q.source.pdfSha256===module.pdfLesson.source.sha256&&q.source.page>=1&&q.source.page<=module.pdfLesson.source.pageCount&&q.source.quote&&q.source.answerQuote&&q.answer&&q.difficulty===difficulty).map(q=>[q.id,q])).values()];
 let selected:QuizQuestion[]=[];
 if(mode==='all'){
  const byMode=SOURCE_GAME_MODES.map(type=>shuffled(valid.filter(q=>q.type===type),random));
  if(byMode.some(pool=>pool.length===0))return null;
  const candidates=shuffled(byMode.flat(),random);
  const seen=new Set<string>();
  for(const question of candidates){
   if(seen.has(question.id))continue;
   selected.push(question);
   seen.add(question.id);
   if(selected.length===MIXED_QUESTION_COUNT)break;
  }
 }else{const pool=valid.filter(q=>q.type===mode);if(pool.length<GAME_QUESTION_COUNT)return null;selected=shuffled(pool,random).slice(0,GAME_QUESTION_COUNT);}
 if(selected.length!==getSessionQuestionCount(mode)||new Set(selected.map(q=>q.id)).size!==selected.length)return null;
 return shuffled(selected,random).map(q=>({...q,options:q.options?shuffled(q.options,random):undefined,pictureOptions:q.pictureOptions?shuffled(q.pictureOptions,random):undefined}));
}
