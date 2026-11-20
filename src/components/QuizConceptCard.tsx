import React from 'react';
import {PictureHuntIllustration} from './PictureHuntIllustration';
import {pictureSceneFor} from '../data/curriculum/pictureIllustrations';
// Unmapped terms use a neutral word card, rather than an unrelated topic scene.
export function QuizConceptCard({tokens,variant,topic='',compact=false}:{tokens:string[];variant:number;topic?:string;compact?:boolean}){
 const mapped=pictureSceneFor(tokens[0]);
 return <div className="overflow-hidden rounded-xl border border-sky-100 bg-white motion-safe:transition-transform motion-safe:duration-200 group-hover:scale-[1.02] group-focus-visible:scale-[1.02] group-aria-pressed:border-sky-500">
  {mapped?<PictureHuntIllustration term={tokens[0]} variant={variant} className={compact?'w-full h-24':'w-full h-40 sm:h-44'}/>:<div className={`flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-sky-50 to-emerald-50 px-4 text-center ${compact?'min-h-24':'min-h-40 sm:min-h-44'}`} aria-label={tokens.join(' / ')}>{tokens.map((token,index)=><span key={index} className="break-words text-base font-bold leading-relaxed text-sky-950">{token}</span>)}</div>}
 </div>;
}
