import React, { useState } from 'react';
import type { PdfExcerpt, PdfLesson } from '../data/curriculum/pdfCurriculum';
import type { DigitalBlock, DigitalContent } from '../data/curriculum/digitalContent';
import { InabelStrip } from './InabelStrip';

// Source content inside the existing main-branch cards; no replacement page, CSS or theme.
export function SourceGraphic({block,interactive=false}:{block:DigitalBlock;interactive?:boolean}) {
 const [label,setLabel]=useState('');
 return <div className="space-y-2"><svg viewBox={`-6 -6 ${(block.width||400)+12} ${(block.height||180)+12}`} className="w-full h-auto max-h-96" role="img" aria-label={`Source illustration, PDF p. ${block.page}`}>
  {block.shapes?.map((s,i)=><path key={i} d={s.d} stroke={s.stroke} fill={s.fill} strokeWidth={s.width}/>)}
  {block.images?.map((s,i)=><image key={i} href={s.src} x={s.x} y={s.y} width={s.width} height={s.height} role="img" aria-label={s.alt||'Original source illustration'}/>)}
  {block.labels?.map((s,i)=><text key={i} x={s.x} y={s.y} fontSize={s.size} fill="#0f172a" {...(interactive?{tabIndex:0,role:'button','aria-label':s.text,onClick:()=>setLabel(s.text),onKeyDown:(e:React.KeyboardEvent)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();setLabel(s.text);}}}:{})}>{s.text}</text>)}
 </svg>{interactive&&label&&<p className="p-3 bg-sky-50 border border-sky-100 rounded-lg text-xs text-slate-700" aria-live="polite">{label}</p>}</div>;
}
function SourceBlock({block}:{block:DigitalBlock}) {
 if(block.type==='table')return <div className="overflow-x-auto" role="region" aria-label={`Source table, PDF p. ${block.page}`} tabIndex={0}><table className="w-full text-xs text-left border-collapse"><tbody>{block.rows?.map((row,i)=><tr key={i}>{row.map((cell,j)=>i===0?<th key={j} scope="col" className="border border-slate-200 bg-sky-50 p-2 font-semibold">{cell}</th>:<td key={j} className="border border-slate-200 p-2 align-top">{cell}</td>)}</tr>)}</tbody></table></div>;
 if(block.type==='diagram')return <SourceGraphic block={block} interactive/>;
 if(block.type==='figure')return <figure className="space-y-2"><img loading="lazy" src={block.src} alt={`Original illustration, PDF p. ${block.page}`} className="max-w-full h-auto max-h-96 object-contain mx-auto"/>{block.transcript&&<details className="text-xs text-slate-600"><summary>Source image text</summary><p className="whitespace-pre-line">{block.transcript}</p></details>}</figure>;
 if(block.type==='heading')return <h3 className="font-semibold text-slate-900 text-sm whitespace-pre-line">{block.text}</h3>;
 return <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">{block.text}</p>;
}
export function SourceExcerpt({lesson,excerpt,content,section,index}:{lesson:PdfLesson;excerpt:PdfExcerpt;content?:DigitalContent;section:string;index:number}) {
 const blocks=content?.excerptBlocks[`${section}:${index}`]?.map(id=>content.blocks[id]).filter(Boolean);
 return <div className="space-y-3"><a href={`${lesson.source.url}#page=${excerpt.page}`} target="_blank" rel="noreferrer" className="text-xs font-semibold text-sky-700 underline">{lesson.sourceLabel} · PDF p. {excerpt.page}</a>{blocks?.length?blocks.map((b,i)=><SourceBlock key={i} block={b}/>):<p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">{excerpt.text}</p>}</div>;
}
export function SourceActivity({ready,title,children}:{ready:boolean;title:string;children:React.ReactNode}) {
 if(ready)return <>{children}</>;
 return <section className="bg-white border-2 border-[#231F20] linocut-card rounded-xl overflow-hidden"><InabelStrip variant="royal" label={title}/><p role="status" className="p-5 text-xs sm:text-sm text-slate-600">Source review needed. This PDF does not yet have enough verified material for this activity. No substitute content has been added.</p></section>;
}
