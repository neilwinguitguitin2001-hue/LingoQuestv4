import React from 'react';
import {PictureHuntIllustration} from './PictureHuntIllustration';
// Labels remain selectable outside the image. Artwork requires no image downloads.
export function QuizConceptCard({tokens,variant,topic='',compact=false}:{tokens:string[];variant:number;topic?:string;compact?:boolean}){
 return <div className="overflow-hidden rounded-xl border border-sky-100 bg-white"><PictureHuntIllustration term={tokens[0]} topic={topic} variant={variant} className={compact?'w-full h-24':'w-full h-40 sm:h-44 motion-safe:transition-transform motion-safe:duration-200 group-hover:scale-[1.025]'}/></div>;
}
