import type {QuizQuestion} from '../types/lingoquest';
export function normalizeQuizResponse(value:string){return value.normalize('NFKC').replace(/[‐‑–—]/g,'-').trim().replace(/\s+/g,' ').replace(/\s*\/\s*/g,' / ').toLowerCase();}
export function isQuizAnswerCorrect(question:QuizQuestion,response:string){
 const answer=normalizeQuizResponse(question.answer);const value=normalizeQuizResponse(response);
 if(!value)return false;
 return question.type==='crosswordGame'?value.replace(/[\s'’\-]/g,'')===answer.replace(/[\s'’\-]/g,''):value===answer;
}
export function clozeSegments(text:string,response=''){
 const parts=response.split(/\s*\/\s*/);const result:{text:string;gap?:number;value?:string}[]=[];
 const gaps=/(\[(\d+)\]\s*)?________/g;let previous=0;
 for(const match of text.matchAll(gaps)){
  if(match.index!>previous)result.push({text:text.slice(previous,match.index)});
  const gap=Number(match[2]||1);result.push({text:match[1]||'',gap,value:parts[gap-1]?.trim()||''});previous=match.index!+match[0].length;
 }
 if(previous<text.length)result.push({text:text.slice(previous)});
 return result;
}

export function formatCrosswordResponse(answer:string,response:string){
 const letters=response.replace(/[^A-Za-z]/g,'');let index=0;let result='';
 for(const char of answer){
  if(index>=letters.length)break;
  if(/[A-Za-z]/.test(char))result+=letters[index++];else result+=char;
 }
 return result+letters.slice(index);
}
