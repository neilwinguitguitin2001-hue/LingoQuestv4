import React from 'react';
import {clozeSegments} from '../utils/quizResponses';
export function QuizCloze({text,response}:{text:string;response:string}){
 return <>{clozeSegments(text,response).map((part,i)=>part.gap?<React.Fragment key={i}><span>{part.text}</span><span className="inline-block mx-1.5 px-3 py-0.5 rounded-lg bg-white border-2 border-dashed border-amber-500 font-mono text-sm font-bold text-amber-900">{part.value||'? MISSING PIECE ?'}</span></React.Fragment>:<span key={i}>{part.text}</span>)}</>;
}
