import React from 'react';
import {BookOpen,ChartNoAxesCombined,ChartColumnIncreasing,Table2,MapPinned,AudioLines,Speech} from 'lucide-react';
// Abstract language concepts use selectable word diagrams, never unrelated real-world photographs.
export function QuizConceptCard({tokens,variant}:{tokens:string[];variant:number}){
 const key=tokens.join(' ').toLowerCase();
 const Icon=/line graph/.test(key)?ChartNoAxesCombined:/bar graph/.test(key)?ChartColumnIncreasing:/table/.test(key)?Table2:/\bmap\b/.test(key)?MapPinned:/listening|sound|aural|audio|prosody|intonation/.test(key)?AudioLines:/speech|oral|communication/.test(key)?Speech:BookOpen;
 const colours=['from-sky-100 via-blue-50 to-emerald-100','from-emerald-100 via-teal-50 to-sky-100','from-blue-100 via-sky-50 to-teal-100'];
 return <div className={`min-h-36 rounded-xl bg-gradient-to-br ${colours[variant%3]} border border-sky-200 flex flex-col justify-center gap-3 p-4`}>
  <Icon aria-hidden="true" className="h-12 w-12 self-center text-sky-700" strokeWidth={1.5}/>
  <svg viewBox="0 0 160 28" className="h-7 w-full" aria-hidden="true"><path d="M12 14h136" stroke="#0284c7" strokeWidth="2"/><path d="M14 14l10-9 10 9-10 9zM126 14l10-9 10 9-10 9z" fill="#047857"/><circle cx="80" cy="14" r="8" fill="#0369a1"/></svg>
  {tokens.map((token,i)=><div key={i} className="rounded-lg border border-white bg-white/90 px-3 py-3 text-center font-bold text-slate-900 break-words">{tokens.length>1&&<span className="mr-2 text-xs text-sky-700">[{i+1}]</span>}{token}</div>)}
 </div>;
}
