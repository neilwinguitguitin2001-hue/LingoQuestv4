import React, { useState } from 'react';
import type { PdfExcerpt, PdfLesson } from '../data/curriculum/pdfCurriculum';
import type { DigitalBlock, DigitalContent } from '../data/curriculum/digitalContent';
import { SourceIllustration } from './SourceIllustration';
import { InabelStrip } from './InabelStrip';

// Source content inside the existing main-branch cards; no replacement page, CSS or theme.
function themeInk(colour:string,fill=false) {
 if(!/^#[0-9a-f]{6}$/i.test(colour))return colour;
 const rgb=[1,3,5].map(i=>parseInt(colour.slice(i,i+2),16));
 if(Math.max(...rgb)-Math.min(...rgb)>18)return colour;
 const light=rgb.reduce((a,b)=>a+b,0)/3;
 return fill?(light>240?'#f0fdfa':light>160?'#bae6fd':light>80?'#38bdf8':'#0369a1'):'#0369a1';
}
export function SourceGraphic({block,interactive=false,themed=false}:{block:DigitalBlock;interactive?:boolean;themed?:boolean}) {
 const [label,setLabel]=useState('');
 const width = block.width || 400;
 const height = block.height || 180;
 const minimumLabelSize = Math.min(14, ...(block.labels || []).filter(item => item.size > 0).map(item => item.size));
 const readingWidth = block.labels?.length ? Math.min(1200, Math.ceil((width + 12) * 13 / minimumLabelSize)) : 0;
 const scrollable = themed && readingWidth > 0;

 return <div className="min-w-0 space-y-2">
  <div className={scrollable ? 'lq-diagram-scroll' : undefined} tabIndex={scrollable ? 0 : undefined} role={scrollable ? 'region' : undefined} aria-label={scrollable ? 'Scrollable lesson diagram' : undefined}>
  <svg viewBox={`-6 -6 ${width + 12} ${height + 12}`} preserveAspectRatio="xMidYMid meet"
   style={scrollable ? { minWidth: readingWidth } : undefined}
   className={themed ? 'block h-auto w-full' : 'w-full h-auto max-h-96'} role={interactive ? 'group' : 'img'} aria-label="Lesson illustration">
  {block.shapes?.map((s,i)=><path key={i} d={s.d} stroke={themed?themeInk(s.stroke):s.stroke} fill={themed?themeInk(s.fill,true):s.fill} strokeWidth={s.width}/>)}
  {block.images?.map((s,i)=><image key={i} href={s.src} x={s.x} y={s.y} width={s.width} height={s.height} role="img" aria-label={s.alt||'Lesson illustration'}/>)}
  {block.labels?.map((s,i)=><text key={i} x={s.x} y={s.y} fontSize={s.size} fill="#0f172a" {...(interactive?{tabIndex:0,role:'button','aria-label':s.text,onClick:()=>setLabel(s.text),onKeyDown:(e:React.KeyboardEvent)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();setLabel(s.text);}}}:{})}>{s.text}</text>)}
 </svg></div>{interactive&&label&&<p className="p-3 bg-sky-50 border border-sky-100 rounded-lg text-sm text-slate-700" aria-live="polite">{label}</p>}</div>;
}
export function SourceBlock({block}:{block:DigitalBlock}) {
 if(block.type==='table')return <div className="overflow-x-auto" role="region" aria-label="Lesson table" tabIndex={0}><table className="w-full text-xs text-left border-collapse"><tbody>{block.rows?.map((row,i)=><tr key={i}>{row.map((cell,j)=>i===0?<th key={j} scope="col" className="border border-slate-200 bg-sky-50 p-2 font-semibold">{cell}</th>:<td key={j} className="border border-slate-200 p-2 align-top">{cell}</td>)}</tr>)}</tbody></table></div>;
 if(block.type==='diagram')return <SourceIllustration block={block}><SourceGraphic block={block} interactive themed/></SourceIllustration>;
 if(block.type==='figure')return <SourceIllustration block={block}/>;
 if(block.type==='heading')return <h3 className="font-semibold text-slate-900 text-sm whitespace-pre-line">{block.text}</h3>;
 return <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">{block.text}</p>;
}
export function SourceExcerpt({lesson,excerpt,content,section,index}:{lesson:PdfLesson;excerpt:PdfExcerpt;content?:DigitalContent;section:string;index:number}) {
 const blocks=content?.excerptBlocks[`${section}:${index}`]?.map(id=>content.blocks[id]).filter(Boolean);
 return <div className="space-y-3">{blocks?.length?blocks.map((b,i)=><SourceBlock key={i} block={b}/>):<p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">{excerpt.text}</p>}</div>;
}
export function SourceActivity({ready,title,children}:{ready:boolean;title:string;children:React.ReactNode}) {
 if(ready)return <>{children}</>;
 return <section className="bg-white border-2 border-[#231F20] linocut-card rounded-xl overflow-hidden"><InabelStrip variant="royal" label={title}/><p role="status" className="p-5 text-xs sm:text-sm text-slate-600">This activity needs content review and is currently unavailable.</p></section>;
}
