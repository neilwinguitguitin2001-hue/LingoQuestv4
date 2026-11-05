import type { DifficultyLevel, Module, QuizGameType, QuizQuestion } from '../types/lingoquest';
export const GAME_QUESTION_COUNT = 5;
export const MIXED_QUESTION_COUNT = 15;
export const SOURCE_GAME_MODES: QuizGameType[] = ['analogyMaster', 'missingPiece', 'crosswordGame', 'pictureHunt', 'typeHunter'];
export const getSessionQuestionCount=(mode:QuizGameType|'all')=>mode==='all'?MIXED_QUESTION_COUNT:GAME_QUESTION_COUNT;
function shuffled<T>(items:T[],random:()=>number){const result=[...items];for(let i=result.length-1;i>0;i--){const j=Math.min(i,Math.max(0,Math.floor(random()*(i+1))));[result[i],result[j]]=[result[j],result[i]];}return result;}
export function createSourceGameSession(module:Module,bank:QuizQuestion[],mode:QuizGameType|'all',difficulty:DifficultyLevel,random=Math.random):QuizQuestion[]|null {
 const valid=[...new Map(bank.filter(q=>module.pdfLesson&&q.source&&q.source.fileId===module.pdfLesson.source.fileId&&q.source.page>=1&&q.source.page<=module.pdfLesson.source.pageCount&&q.source.quote&&q.source.answerQuote&&q.answer&&q.difficulty===difficulty).map(q=>[q.id,q])).values()];
 let selected:QuizQuestion[]=[];
 if(mode==='all'){
  // Three tasks from each mode, selected difficulty retained. Spread targets across modes.
  const targets=shuffled([...new Set(valid.map(q=>q.learningTargetId).filter((x):x is string=>!!x))],random);
  if(targets.length<5)return null;
  for(const [index,type] of shuffled(SOURCE_GAME_MODES,random).entries()){
   const pool=valid.filter(q=>q.type===type);if(pool.length<5)return null;
   const picks=Array.from({length:3},(_,i)=>pool.find(q=>q.learningTargetId===targets[(index+i)%5]));
   if(picks.some(q=>!q))return null;selected.push(...picks as QuizQuestion[]);
  }
 }else{const pool=valid.filter(q=>q.type===mode);if(pool.length<GAME_QUESTION_COUNT)return null;selected=shuffled(pool,random).slice(0,GAME_QUESTION_COUNT);}
 if(selected.length!==getSessionQuestionCount(mode)||new Set(selected.map(q=>q.id)).size!==selected.length)return null;
 return shuffled(selected,random).map(q=>({...q,options:q.options?shuffled(q.options,random):undefined,pictureOptions:q.pictureOptions?shuffled(q.pictureOptions,random):undefined}));
}
