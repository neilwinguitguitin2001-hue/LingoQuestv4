import {useEffect,useId,useRef,useState} from 'react';
import {ZoomIn,X,ChevronLeft,ChevronRight} from 'lucide-react';
import type {QuizQuestion} from '../types/lingoquest';
import {QuizConceptCard} from './QuizConceptCard';
import {SourceGraphic} from './SourceContent';
import {PictureHuntArtwork} from './PictureHuntArtwork';
/** Inspection never submits an answer, pauses the timer, or reveals correctness. */
export function QuizPictureInspector({pictures,topic}:{pictures:NonNullable<QuizQuestion['pictureOptions']>;topic:string}){
 const dialog=useRef<HTMLDialogElement>(null),title=useId();
 const [open,setOpen]=useState(false),[index,setIndex]=useState(0);
 useEffect(()=>{if(open&&!dialog.current?.open)dialog.current?.showModal();if(!open&&dialog.current?.open)dialog.current.close();},[open]);
 const picture=pictures[index];
 if(!picture)return null;
 const move=(delta:number)=>setIndex(current=>(current+delta+pictures.length)%pictures.length);
 return <>
  <button type="button" onClick={()=>{setIndex(0);setOpen(true);}} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-sky-300 bg-white px-4 text-sm font-semibold text-sky-900 hover:bg-sky-50 focus-visible:outline-2 focus-visible:outline-sky-600"><ZoomIn size={17} aria-hidden="true"/> Inspect pictures</button>
  <dialog ref={dialog} aria-labelledby={title} onCancel={()=>setOpen(false)} onClose={()=>setOpen(false)} onKeyDown={event=>{if(event.key==='ArrowLeft'){event.preventDefault();move(-1);}if(event.key==='ArrowRight'){event.preventDefault();move(1);}}} className="m-auto w-[min(94vw,680px)] max-h-[90dvh] overflow-y-auto rounded-2xl border-2 border-sky-700 bg-white p-5 text-slate-900 backdrop:bg-slate-950/70">
   <div className="mb-4 flex items-center justify-between gap-3"><h3 id={title} className="text-lg font-bold">Inspect the answer pictures</h3><button type="button" aria-label="Close picture inspection" onClick={()=>setOpen(false)} className="grid size-11 place-items-center rounded-lg border border-slate-200"><X size={18}/></button></div>
   <p className="mb-3 text-sm text-slate-600">Compare the details, then return to the question to answer. The question timer keeps running.</p>
   <div className="rounded-xl border border-sky-200 bg-sky-50 p-3" aria-live="polite">
    {picture.conceptVisual?<QuizConceptCard {...picture.conceptVisual} topic={topic}/>:picture.sourceGraphic?<SourceGraphic block={picture.sourceGraphic}/>:picture.sourceImageUrl?<img src={picture.sourceImageUrl} alt={picture.caption||picture.label} className="mx-auto max-h-[45vh] w-full object-contain"/>:<PictureHuntArtwork sceneId={picture.sceneId} className="mx-auto max-h-[45vh] w-full"/>}
    <p className="mt-3 text-center font-bold">{String.fromCharCode(65+index)}. {picture.label}</p>
   </div>
   <div className="mt-4 flex items-center justify-between gap-3"><button type="button" aria-label="Previous picture" onClick={()=>move(-1)} className="grid size-11 place-items-center rounded-lg border border-sky-300"><ChevronLeft/></button><span className="text-sm tabular-nums">Picture {index+1} of {pictures.length}</span><button type="button" aria-label="Next picture" onClick={()=>move(1)} className="grid size-11 place-items-center rounded-lg border border-sky-300"><ChevronRight/></button></div>
  </dialog>
 </>;
}
