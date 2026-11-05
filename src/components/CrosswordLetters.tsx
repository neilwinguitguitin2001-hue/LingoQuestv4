import React,{useRef} from 'react';
import type {QuizQuestion} from '../types/lingoquest';
export function CrosswordLetters({question,value,onChange,onSubmit,locked}:{question:QuizQuestion;value:string;onChange:(v:string)=>void;onSubmit:()=>void;locked:boolean}){
 const inputs=useRef<(HTMLInputElement|null)[]>([]);
 const given=new Map(question.crosswordClue?.letterGrid?.filter(g=>g.isGiven).map(g=>[g.index,g.letter]));
 const isLetter=(character:string)=>/[A-Za-z•?]/.test(character);
 const move=(index:number,step:number)=>{for(let i=index+step;i>=0&&i<question.answer.length;i+=step)if(!given.has(i)&&isLetter(question.answer[i])){inputs.current[i]?.focus();break;}};
 return <>{[...question.answer].map((character,index)=>{
  const fixed=given.has(index)||!isLetter(character);
  const displayed=fixed?(given.get(index)||character):(value[index]||'');
  if(character===' ')return <span key={index} className="w-2" aria-label="Word space"/>;
  return <div key={index} className={`w-10 h-12 rounded-xl border-2 flex flex-col items-center justify-between p-1 font-mono font-black ${fixed?'border-amber-400 bg-amber-500/20 text-amber-300':'border-slate-600 bg-slate-800 text-white'}`}>
   <span className="text-[9px] text-slate-400 self-start leading-none">{index===0?question.crosswordClue?.clueNumber:''}</span>
   {fixed?<span className="text-base uppercase leading-none mb-1">{displayed}</span>:<input ref={el=>{inputs.current[index]=el;}} aria-label={`Crossword letter ${index+1}`} autoComplete="off" autoCapitalize="characters" spellCheck={false} disabled={locked} maxLength={1} value={displayed.trim().replace(/[•?]/g,'')} className="w-full h-7 min-w-0 bg-transparent text-center uppercase text-base focus:outline-2 focus:outline-sky-300" onChange={e=>{const char=e.target.value.replace(/[^A-Za-z]/g,'').slice(-1);const letters=[...question.answer].map((c,i)=>!isLetter(c)?c:given.get(i)||value[i]||' ');letters[index]=char||' ';onChange(letters.join(''));if(char)move(index,1);}} onKeyDown={e=>{if(e.key==='ArrowRight'){e.preventDefault();move(index,1);}if(e.key==='ArrowLeft'){e.preventDefault();move(index,-1);}if(e.key==='Backspace'&&!value[index]?.trim()){e.preventDefault();move(index,-1);}if(e.key==='Enter'){e.preventDefault();onSubmit();}}}/>} 
  </div>;
 })}</>;
}
