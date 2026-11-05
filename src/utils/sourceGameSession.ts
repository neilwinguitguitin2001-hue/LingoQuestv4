import type { DifficultyLevel, Module, QuizGameType, QuizQuestion } from '../types/lingoquest';
export const GAME_QUESTION_COUNT = 10;
export const MIXED_QUESTION_COUNT = 10;
export const SOURCE_GAME_MODES: QuizGameType[] = ['analogyMaster', 'missingPiece', 'crosswordGame', 'pictureHunt', 'typeHunter'];
export const getSessionQuestionCount=(mode:QuizGameType|'all')=>mode==='all'?MIXED_QUESTION_COUNT:GAME_QUESTION_COUNT;
function shuffled<T>(items:T[],random:()=>number){const result=[...items];for(let i=result.length-1;i>0;i--){const j=Math.min(i,Math.max(0,Math.floor(random()*(i+1))));[result[i],result[j]]=[result[j],result[i]];}return result;}
export function createSourceGameSession(module:Module,bank:QuizQuestion[],mode:QuizGameType|'all',difficulty:DifficultyLevel,random=Math.random,previousIds:ReadonlySet<string>=new Set()):QuizQuestion[]|null {
 const valid=[...new Map(bank.filter(q=>module.pdfLesson&&q.source&&q.source.fileId===module.pdfLesson.source.fileId&&q.source.pdfSha256===module.pdfLesson.source.sha256&&q.source.page>=1&&q.source.page<=module.pdfLesson.source.pageCount&&q.source.quote&&q.source.answerQuote&&q.answer&&q.difficulty===difficulty).map(q=>[q.id,q])).values()];
 let selected:QuizQuestion[]=[];
 const preferNew=(pool:QuizQuestion[])=>shuffled(pool,random).sort((a,b)=>Number(previousIds.has(a.id))-Number(previousIds.has(b.id)));
 if(mode==='all'){
  // Two questions per mode; each selection uses a different PDF answer target.
  const usedTargets=new Set<string>();
  for(const type of shuffled(SOURCE_GAME_MODES,random)){
   const pool=preferNew(valid.filter(q=>q.type===type));
   if(pool.length<GAME_QUESTION_COUNT)return null;
   for(const question of pool){
    if(usedTargets.has(question.learningTargetId||question.id))continue;
    selected.push(question);usedTargets.add(question.learningTargetId||question.id);
    if(selected.filter(q=>q.type===type).length===2)break;
   }
   if(selected.filter(q=>q.type===type).length!==2)return null;
  }
 }else{const pool=valid.filter(q=>q.type===mode);if(pool.length<GAME_QUESTION_COUNT)return null;selected=preferNew(pool).slice(0,GAME_QUESTION_COUNT);}
 if(selected.length!==getSessionQuestionCount(mode)||new Set(selected.map(q=>q.id)).size!==selected.length)return null;
 return shuffled(selected,random).map(q=>({...q,options:q.options?shuffled(q.options,random):undefined,pictureOptions:q.pictureOptions?shuffled(q.pictureOptions,random):undefined}));
}
