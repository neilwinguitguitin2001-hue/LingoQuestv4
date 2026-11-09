import React, {createContext, useContext, useEffect, useId, useState} from 'react';
import {useReducedMotion} from 'motion/react';
import {Pause, Play} from 'lucide-react';
import type {DigitalBlock} from '../data/curriculum/digitalContent';

export const SourceMotionContext = createContext(false);

// Recolour source geometry only. Data points, labels, proportions and source pixels are unchanged.
export function SourceIllustration({block,children}:{block:DigitalBlock;children?:React.ReactNode}) {
 const id=useId().replace(/:/g,''); const reduced=useReducedMotion(); const dataSaver=useContext(SourceMotionContext); const [playing,setPlaying]=useState(false);
 useEffect(()=>{if(!playing)return;const timer=setTimeout(()=>setPlaying(false),4200);return()=>clearTimeout(timer);},[playing]);
 return <figure className="pdf-source-illustration space-y-3" data-playing={playing&&!reduced&&!dataSaver}>
  <div className="pdf-source-visual-stage">
   <div className="pdf-source-ink-reveal">{children || (block.monochrome?<svg viewBox={`0 0 ${block.width||600} ${block.height||400}`} className="w-full h-auto max-h-96" role="img" aria-label="Lesson illustration">
    <defs><linearGradient id={id+'-ink'} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#0369a1"/><stop offset=".5" stopColor="#0284c7"/><stop offset="1" stopColor="#047857"/></linearGradient>
     <filter id={id+'-invert'} colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values="-.2126 -.7152 -.0722 0 1 -.2126 -.7152 -.0722 0 1 -.2126 -.7152 -.0722 0 1 0 0 0 1 0"/></filter>
     <mask id={id+'-mask'} maskUnits="userSpaceOnUse" x="0" y="0" width={block.width||600} height={block.height||400} style={{maskType:'luminance'}}><image href={block.src} width={block.width||600} height={block.height||400} filter={`url(#${id}-invert)`}/></mask>
    </defs><rect width="100%" height="100%" fill={`url(#${id}-ink)`} mask={`url(#${id}-mask)`}/>
   </svg>:<img loading="lazy" src={block.src} alt="Lesson illustration" className="max-w-full h-auto max-h-96 object-contain mx-auto"/>)}</div>
  </div>
  <figcaption className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600"><button type="button" onClick={()=>setPlaying(v=>!v)} disabled={!!reduced||dataSaver} aria-pressed={playing} className="inline-flex items-center gap-1.5 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 font-semibold text-sky-800 disabled:opacity-60">{playing?<Pause size={13}/>:<Play size={13}/>} {dataSaver?'Data Saver · Static':reduced?'Reduced motion':playing?'Pause reveal':'Play illustration'}</button></figcaption>
  {block.transcript&&<details className="text-xs text-slate-600"><summary>Selectable image text</summary><p className="whitespace-pre-line leading-relaxed">{block.transcript}</p></details>}
 </figure>;
}
