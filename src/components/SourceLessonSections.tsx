import React, {useContext, useMemo, useRef, useState} from 'react';
import {BookOpen, CheckSquare, FileText, Image as ImageIcon, ListChecks, Play} from 'lucide-react';
import {useReducedMotion} from 'motion/react';
import type {Module} from '../types/lingoquest';
import type {DigitalContent, DigitalBlock} from '../data/curriculum/digitalContent';
import {InabelStrip} from './InabelStrip';
import {SourceMotionContext} from './SourceIllustration';
import {SourceBlock} from './SourceContent';

function PrintedExample({module,discussionText}:{module:Module;discussionText:string}) {
 const reduce=useReducedMotion();const saver=useContext(SourceMotionContext);const [replay,setReplay]=useState(0);
 const contains=(text:string)=>discussionText.toLowerCase().replace(/[^a-z0-9]/g,'').includes(text.toLowerCase().replace(/[^a-z0-9]/g,''));
 const q=module.quizQuestions.find(q=>q.type==='analogyMaster'&&q.analogyPair&&contains(q.source!.quote)&&module.pdfLesson?.sourceSections?.find(s=>s.id==='concepts')?.pages.includes(q.source!.page));
 const term=module.pdfLesson?.vocabularyBank.find(e=>contains(e.text)&&module.pdfLesson?.sourceSections?.find(s=>s.id==='concepts')?.pages.includes(e.page));
 if(!q&&!term)return <p className="text-xs text-slate-600 leading-relaxed">This source section contains text explanations. Its original wording appears in the discussion alongside.</p>;
 return <div key={replay} className={`pdf-printed-example space-y-4 ${replay&&!reduce?'is-replaying':''}`}>
  {q?.analogyPair?<><div className="grid grid-cols-2 gap-3">{[q.analogyPair.firstA,q.analogyPair.firstB,q.analogyPair.secondC,q.answer].map((word,i)=><div key={i} style={{animationDelay:`${i*.5}s`}} className="pdf-example-word rounded-xl border border-sky-200 bg-gradient-to-br from-sky-50 to-emerald-50 px-3 py-5 text-center font-bold text-sky-900">{word}</div>)}</div><p className="rounded-xl bg-sky-50 p-4 text-sm text-slate-800 leading-relaxed">{q.source!.quote}</p></>:<><h3 className="font-display text-xl font-bold text-sky-900">{term!.term}</h3><p className="pdf-example-word rounded-xl border-l-4 border-emerald-500 bg-sky-50 p-4 text-sm leading-relaxed text-slate-800">{term!.text}</p></>}
  <div className="flex flex-wrap justify-between gap-3 text-xs text-slate-500"><span>Printed example · PDF p. {q?.source?.page||term?.page}</span><button type="button" disabled={!!reduce||saver} onClick={()=>setReplay(v=>v+1)} className="inline-flex items-center gap-1 font-semibold text-sky-700"><Play size={13}/> {saver?'Data Saver · Static':reduce?'Reduced motion':'Replay example'}</button></div>
 </div>;
}
export function SourceLessonSections({module,content,error,retry,dataSaver=false,initialSection='concepts'}:{initialSection?:string;dataSaver?:boolean;module:Module;content?:DigitalContent;error?:string;retry:()=>void}) {
 const lesson=module.pdfLesson!;const tabs=(lesson.sourceSections||[]).filter(s=>s.kind==='discussion');const [active,setActive]=useState(tabs.some(s=>s.id===initialSection)?initialSection:'concepts');const [visualLimit,setVisualLimit]=useState(3);const refs=useRef<(HTMLButtonElement|null)[]>([]);
 const section=content?.sourceSections?.find(s=>s.id===active&&s.kind==='discussion');const selected=tabs.find(t=>t.id===active)||tabs[0];
 const visuals=useMemo(()=>{const items=section?.entries.flatMap(e=>e.blockIds.map(id=>({id,block:content!.blocks[id]}))).filter(x=>x.block&&(x.block.type==='figure'||x.block.type==='diagram'))||[];return [...new Map(items.map(x=>[x.block.src||x.id,x])).values()];},[section,content]);
 const select=(id:string)=>{setActive(id);setVisualLimit(3);};
 return <SourceMotionContext.Provider value={dataSaver}><div className="pdf-source-module space-y-6" data-static={dataSaver}>
  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 bg-white p-1.5 border-2 border-[#231F20] linocut-card rounded-xl" role="tablist" aria-label="Module discussion">
   {tabs.map((tab,i)=>{const Icon=tab.kind==='discussion'?BookOpen:tab.kind==='objectives'?ListChecks:tab.kind==='answers'?CheckSquare:FileText;return <button key={tab.id} ref={el=>{refs.current[i]=el;}} type="button" role="tab" id={`pdf-tab-${tab.id}`} aria-controls="pdf-source-panel" aria-selected={active===tab.id} tabIndex={active===tab.id?0:-1} onClick={()=>select(tab.id)} onKeyDown={e=>{let next=i;if(e.key==='ArrowRight')next=(i+1)%tabs.length;else if(e.key==='ArrowLeft')next=(i+tabs.length-1)%tabs.length;else if(e.key==='Home')next=0;else if(e.key==='End')next=tabs.length-1;else return;e.preventDefault();select(tabs[next].id);refs.current[next]?.focus();}} className={`px-3 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${active===tab.id?'bg-sky-700 text-white shadow-sm':'text-slate-600 hover:bg-slate-100'}`}><Icon className="w-3.5 h-3.5"/>{tab.title}</button>;})}
  </div>
  <div id="pdf-source-panel" role="tabpanel" aria-labelledby={`pdf-tab-${active}`} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
   <div className="lg:col-span-7 space-y-6">
    <section className="bg-white border-2 border-[#231F20] linocut-card rounded-xl overflow-hidden"><InabelStrip variant="royal" label={`${selected?.title||'Source discussion'} • ${lesson.sourceLabel}`}/><div className="p-5 sm:p-6 space-y-5">
     <div className="flex flex-wrap justify-between gap-3 border-b border-slate-100 pb-3"><h2 className="text-lg font-display font-bold text-slate-900">{selected?.title}</h2><span className="text-xs text-sky-700">{lesson.sourceLabel} · PDF source</span></div>
     {active==='concepts'&&<div className="space-y-3"><p className="text-sm text-slate-700 leading-relaxed">{lesson.overview.text}</p></div>}
     {error?<div role="status"><p>{error}</p><button type="button" onClick={retry} className="mt-3 rounded-lg bg-sky-600 px-4 py-2 text-xs font-bold text-white">Retry source content</button></div>:!content?<p role="status" className="text-xs text-slate-500">Loading this PDF’s sections…</p>:section?.entries.map((entry,i)=><article key={`${entry.page}-${i}`} className="space-y-3 border-t border-slate-100 pt-4"><div className="space-y-3">{entry.blockIds.map(id=>content.blocks[id]).filter((b):b is DigitalBlock=>!!b&&b.type!=='figure'&&b.type!=='diagram').map((block,j)=><SourceBlock key={j} block={block}/>)}</div>{entry.blockIds.some(id=>['figure','diagram'].includes(content.blocks[id]?.type))&&<a className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700" href="#pdf-visual-examples"><ImageIcon size={13}/> See the source illustrations alongside</a>}</article>)}
     {content&&!section?.entries.length&&<p className="text-xs text-slate-600">No separate content is provided under this source heading.</p>}
    </div></section>
   </div>
   <aside className="lg:col-span-5 space-y-6" id="pdf-visual-examples" aria-label="Illustrated examples from this PDF section">
    <section className="bg-white border-2 border-[#231F20] linocut-card rounded-xl overflow-hidden"><InabelStrip variant="emerald" label="Illustrated Source Examples"/><div className="p-5 space-y-5"><h2 className="flex items-center gap-2 font-display font-bold text-slate-900"><ImageIcon className="w-4 h-4 text-sky-600"/> {selected?.kind==='discussion'?'Visual Explanations':'Source Illustrations'}</h2><p className="text-xs text-slate-500 leading-relaxed">Blue-and-green recreations preserve the original shapes, labels and proportions. Use Play to reveal each illustration.</p>{visuals.length?visuals.slice(0,visualLimit).map(({id,block})=><div key={id} className="space-y-3 border-t border-slate-100 pt-4"><SourceBlock block={block}/></div>):selected?.kind==='discussion'?<PrintedExample module={module} discussionText={section?.entries.flatMap(e=>e.blockIds.map(id=>content?.blocks[id]?.text||'')).join(' ')||''}/>:<p className="text-xs text-slate-600">This section uses selectable source text and tables alongside.</p>}{visualLimit<visuals.length&&<button type="button" onClick={()=>setVisualLimit(n=>n+3)} className="rounded-lg border border-sky-200 bg-sky-50 px-4 py-2 text-xs font-bold text-sky-800">Show more source illustrations ({visuals.length-visualLimit})</button>}</div></section>
   </aside>
  </div>
 </div></SourceMotionContext.Provider>;
}
