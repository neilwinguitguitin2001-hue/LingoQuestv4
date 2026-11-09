import React, {useMemo, useRef, useState} from 'react';
import {BookOpen, CheckSquare, FileText, Image as ImageIcon, ListChecks, Compass} from 'lucide-react';
import type {Module} from '../types/lingoquest';
import type {DigitalContent, DigitalBlock} from '../data/curriculum/digitalContent';
import {InabelStrip} from './InabelStrip';
import {SourceMotionContext} from './SourceIllustration';
import {SourceBlock} from './SourceContent';
import {getLessonPilot} from '../data/curriculum/lessonPilot';
import {LessonPilotGuide, LessonWatchStoryboard} from './LessonPilotGuide';
import {getGenreCards, LessonGenreCards} from './LessonGenreCards';
import {getLessonVideo, LessonVideo} from './LessonVideo';

export function SourceLessonSections({module,content,error,retry,dataSaver=false,initialSection='concepts'}:{initialSection?:string;dataSaver?:boolean;module:Module;content?:DigitalContent;error?:string;retry:()=>void}) {
 const lesson=module.pdfLesson!;const tabs=(lesson.sourceSections||[]).filter(s=>s.kind==='discussion');const [active,setActive]=useState(tabs.some(s=>s.id===initialSection)?initialSection:'concepts');const [visualLimit,setVisualLimit]=useState(3);const refs=useRef<(HTMLButtonElement|null)[]>([]);
 const section=content?.sourceSections?.find(s=>s.id===active&&s.kind==='discussion');const selected=tabs.find(t=>t.id===active)||tabs[0];
 const visuals=useMemo(()=>{const items=section?.entries.flatMap(e=>e.blockIds.map(id=>({id,block:content!.blocks[id]}))).filter(x=>x.block&&(x.block.type==='figure'||x.block.type==='diagram'))||[];return [...new Map(items.map(x=>[x.block.src||x.id,x])).values()];},[section,content]);
 const pilot=active==='concepts' ? getLessonPilot(module.id) : undefined;
 const video=active==='concepts' ? getLessonVideo(module.id) : undefined;
 const select=(id:string)=>{setActive(id);setVisualLimit(3);};
 const discussion = <>
     {active==='concepts'&&<div className="space-y-3"><p className="text-sm text-slate-700 leading-relaxed">{lesson.overview.text}</p></div>}
     {error?<div role="status"><p>Lesson content could not be loaded. Please try again.</p><button type="button" onClick={retry} className="mt-3 rounded-lg bg-sky-600 px-4 py-2 text-xs font-bold text-white">Retry lesson content</button></div>:!content?<p role="status" className="text-xs text-slate-500">Loading lesson sections…</p>:section?.entries.map((entry,i)=><article key={`${entry.page}-${i}`} className="space-y-3 border-t border-slate-100 pt-4"><div className="space-y-3">{entry.blockIds.map(id=>content.blocks[id]).filter((b):b is DigitalBlock=>!!b&&b.type!=='figure'&&b.type!=='diagram').map((block,j)=><SourceBlock key={j} block={block}/>)}</div>{entry.blockIds.some(id=>['figure','diagram'].includes(content.blocks[id]?.type))&&<a className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700" href="#lesson-visual-examples"><ImageIcon size={13}/> See the illustrations alongside</a>}</article>)}
     {content&&!section?.entries.length&&<p className="text-xs text-slate-600">No separate content is provided under this heading.</p>}
 </>;
 return <SourceMotionContext.Provider value={dataSaver}><div className="pdf-source-module space-y-6" data-static={dataSaver}>
  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 bg-white p-1.5 border-2 border-[#231F20] linocut-card rounded-xl" role="tablist" aria-label="Module discussion">
   {tabs.map((tab,i)=>{const Icon=tab.kind==='discussion'?BookOpen:tab.kind==='objectives'?ListChecks:tab.kind==='answers'?CheckSquare:FileText;return <button key={tab.id} ref={el=>{refs.current[i]=el;}} type="button" role="tab" id={`pdf-tab-${tab.id}`} aria-controls="pdf-source-panel" aria-selected={active===tab.id} tabIndex={active===tab.id?0:-1} onClick={()=>select(tab.id)} onKeyDown={e=>{let next=i;if(e.key==='ArrowRight')next=(i+1)%tabs.length;else if(e.key==='ArrowLeft')next=(i+tabs.length-1)%tabs.length;else if(e.key==='Home')next=0;else if(e.key==='End')next=tabs.length-1;else return;e.preventDefault();select(tabs[next].id);refs.current[next]?.focus();}} className={`px-3 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${active===tab.id?'bg-sky-700 text-white shadow-sm':'text-slate-600 hover:bg-slate-100'}`}><Icon className="w-3.5 h-3.5"/>{tab.title}</button>;})}
  </div>
  <div id="pdf-source-panel" role="tabpanel" aria-labelledby={`pdf-tab-${active}`} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
   <div className="min-w-0 lg:col-span-7 space-y-6">
    <section className="bg-white border-2 border-[#231F20] linocut-card rounded-xl overflow-hidden"><InabelStrip variant="royal" label={`${selected?.title||'Discussion'} • ${lesson.sourceLabel}`}/><div className="p-5 sm:p-6 space-y-5">
     <div className="flex flex-wrap justify-between gap-3 border-b border-slate-100 pb-3"><h2 className="text-lg font-display font-bold text-slate-900">{selected?.title}</h2></div>
     {pilot && <LessonPilotGuide moduleId={module.id} lesson={pilot} />}
     {pilot ? (
      <details className="rounded-xl border border-slate-200">
       <summary className="cursor-pointer rounded-xl p-4 text-sm font-semibold text-sky-900 focus-visible:outline-2 focus-visible:outline-sky-700">Read the full discussion</summary>
       <div className="space-y-5 px-4 pb-4">{discussion}</div>
      </details>
     ) : discussion}
    </div></section>
   </div>
   <aside className="min-w-0 lg:col-span-5 space-y-6 scroll-mt-32" id="lesson-visual-examples" aria-label="Visual explanations">
    <section className="overflow-hidden rounded-xl border-2 border-[#231F20] bg-white linocut-card">
     <InabelStrip variant="emerald" label="Illustrated Examples" />
     <div className="space-y-4 p-4 sm:p-5">
      <h2 className="flex items-center gap-2 font-display text-lg font-bold text-slate-950">
       <ImageIcon className="h-4 w-4 text-sky-700" aria-hidden="true" /> Visual Explanations
      </h2>
      {visuals.length > 0 ? visuals.slice(0, visualLimit).map(({id, block}) => {
       const cards = getGenreCards(module.id, id);
       return <div key={id}>
        {cards ? <LessonGenreCards cards={cards} /> : <SourceBlock block={block} />}
       </div>;
      }) : <div className="lq-genre-card" data-tone="reef">
       <span className="lq-genre-icon"><Compass size={22} aria-hidden="true" /></span>
       <div className="min-w-0">
        <h3 className="text-sm font-bold text-slate-950">Key idea</h3>
        <p className="mt-1 break-words text-sm leading-relaxed text-slate-700">{pilot?.steps[4] || lesson.overview.text}</p>
       </div>
      </div>}
      {visualLimit < visuals.length && <button type="button" onClick={() => setVisualLimit(n => n + 3)} className="rounded-lg border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-bold text-sky-900 transition-colors hover:bg-sky-100">
       Show more illustrations ({visuals.length - visualLimit})
      </button>}
     </div>
    </section>
    {video && <LessonVideo key={video.id} video={video} />}
    {pilot && <LessonWatchStoryboard lesson={pilot} />}
    {active === 'concepts' && module.id === 'g7-q1-m2' && (
     <section className="overflow-hidden rounded-xl border-2 border-[#231F20] bg-white linocut-card">
      <InabelStrip variant="emerald" label="Watch & Understand" />
      <div className="space-y-3 p-4 sm:p-5">
       <h2 className="font-display text-lg font-bold text-slate-950">Heal the Earth, Heal the Future</h2>
       <p className="text-sm leading-relaxed text-slate-700">The video listed in this lesson could not be verified for playback. Use this short reading version to consider how a message can ask viewers to act.</p>
       <details className="rounded-lg border border-slate-200 px-3 py-2.5">
        <summary className="cursor-pointer text-sm font-semibold text-sky-900">Read the viewing example</summary>
        <p className="mt-2 text-sm leading-relaxed text-slate-700">The campaign message calls for people to help the planet. It says people already have tools to make a difference and urges them to work together. Which words signal the response the campaign wants from viewers?</p>
       </details>
      </div>
     </section>
    )}
   </aside>
  </div>
 </div></SourceMotionContext.Provider>;
}
