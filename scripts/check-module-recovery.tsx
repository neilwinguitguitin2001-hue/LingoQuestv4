import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {PDF_LESSONS,PDF_MODULES} from '../src/data/curriculum/pdfCurriculum';
import {loadDigitalContent} from '../src/data/curriculum/digitalContent';
import {isQuizAnswerCorrect,normalizeQuizResponse,clozeSegments,formatCrosswordResponse} from '../src/utils/quizResponses';
import {LessonAndQuizView} from '../src/components/LessonAndQuizView';
import {CrosswordLetters} from '../src/components/CrosswordLetters';
const fetchBefore=globalThis.fetch;let networkCalls=0;
globalThis.fetch=async()=>{networkCalls++;throw new TypeError('Failed to fetch');};
let questions=0;
for(const pdf of PDF_LESSONS){
 const data=await loadDigitalContent(pdf);assert.equal(data.fileId,pdf.source.fileId);assert.equal(data.sourceSha256,pdf.source.sha256);assert.equal(data.games.length,75);assert.ok(data.sourceSections?.[0].entries.length);
 await assert.rejects(loadDigitalContent({...pdf,source:{...pdf.source,sha256:'wrong'}}));
 await assert.rejects(loadDigitalContent({...pdf,source:{...pdf.source,fileId:'another-module'}}));
 for(const q of data.games){
  const spans=q.source!.answerSpans!;const cloze=q.assessmentStyle==='restore-excerpt'?q.answer:q.contextSentence!;
  const reconstructed=clozeSegments(cloze,spans.join('/')).map(p=>p.gap?p.value:p.text).join('');
  assert.equal(normalizeQuizResponse(reconstructed),normalizeQuizResponse(q.source!.quote),q.id);
  if(spans.length===2){assert.ok(cloze.includes('[1] ________'),q.id);assert.ok(cloze.includes('[2] ________'),q.id);}
  assert.ok(isQuizAnswerCorrect(q,`  ${q.answer.toUpperCase().replace(/ \/ /g,'/')}  `),q.id);
  assert.ok(!isQuizAnswerCorrect(q,'definitely not an answer'),q.id);
  if(q.type==='crosswordGame'){
   assert.ok(isQuizAnswerCorrect(q,q.answer.replace(/[ -]/g,'')));
   assert.equal(normalizeQuizResponse(formatCrosswordResponse(q.answer,q.answer.replace(/[^A-Za-z]/g,''))),normalizeQuizResponse(q.answer));
   const grid=renderToStaticMarkup(<CrosswordLetters question={q} value="" onChange={()=>{}} onSubmit={()=>{}} locked={false}/>);
   const given=new Set(q.crosswordClue?.letterGrid?.filter(l=>l.isGiven).map(l=>l.index));
   const free=[...q.answer].filter((c,i)=>/[A-Za-z]/.test(c)&&!given.has(i)).length;
   assert.equal((grid.match(/aria-label="Crossword letter /g)||[]).length,free,q.id);
  }
  questions++;
 }
}
assert.equal(formatCrosswordResponse('non-linear','NONLINEAR'),'NON-LINEAR');
assert.equal(formatCrosswordResponse('zero conditional','zeroc'),'zero c');
assert.equal(formatCrosswordResponse('main clause','mainclauseEXTRA'),'main clauseEXTRA');
assert.equal(networkCalls,0);assert.equal(questions,7950);
assert.deepEqual(clozeSegments('[2] ________ before [1] ________','first / second').filter(p=>p.gap).map(p=>p.value),['second','first']);
for(const m of PDF_MODULES){
 assert.equal(m.quizQuestions.length,75);
 const setup=renderToStaticMarkup(<LessonAndQuizView module={m} nextModule={null} initialStage="QUIZ_SETUP" isPersonalization={false} isPreviewMode previewRole="admin" onBackToMap={()=>{}} onCompleteLesson={()=>{}} onSubmitQuizResult={()=>({totalPointsAwarded:0,newlyUnlockedBadges:[],bridgeNewlyRestored:false})} onAdvanceToNextModule={()=>{}} onOpenWritingLabWithPrompt={()=>{}}/>);
 const launch=setup.match(/<button\b([^>]*)>(?:(?!<\/button>)[\s\S])*?Launch Gamified Quiz Now/);
 assert.ok(launch,m.id);assert.ok(!launch[1].includes('disabled'),m.id);
}
globalThis.fetch=fetchBefore;
console.log('PASS all 106 lessons with network disabled; 7,950 exact gap reconstructions and answer checks; editable crossword grids; wrong module/hash rejected.');
