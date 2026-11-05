import assert from 'node:assert/strict';
import fs from 'node:fs';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {PDF_LESSONS,PDF_MODULES} from '../src/data/curriculum/pdfCurriculum';
import {ALL_MODULES} from '../src/data/seedData';
import {LessonAndQuizView} from '../src/components/LessonAndQuizView';
import {SourceLessonSections} from '../src/components/SourceLessonSections';
import {SourceExcerpt} from '../src/components/SourceContent';
import {loadDigitalContent} from '../src/data/curriculum/digitalContent';
import {createSourceGameSession,SOURCE_GAME_MODES,getSessionQuestionCount} from '../src/utils/sourceGameSession';
import {getModuleVisualConfig} from '../src/data/moduleVisualConfigs';
assert.equal(ALL_MODULES,PDF_MODULES);
assert.equal(PDF_MODULES.length,106);
const originalFetch=globalThis.fetch;
globalThis.fetch=async(input)=>({ok:true,json:async()=>JSON.parse(fs.readFileSync(`public${input}`,'utf8'))}) as Response;
let ready=0,blocked=0,rendered=0;
for(let grade=7;grade<=10;grade++)for(let quarter=1;quarter<=4;quarter++){
 const batch=PDF_MODULES.filter(m=>m.gradeLevel===grade&&m.quarter===quarter);
 assert.ok(batch.length);
 for(const module of batch){
  const pdf=module.pdfLesson!;
  for (const entry of pdf.vocabularyBank) { assert.ok(!/_{2,}|\.{5,}/.test(entry.text), `${pdf.id}: unanswered vocabulary prompt`); assert.ok((pdf.source.verifiedRecallPages||pdf.source.discussionPages).includes(entry.page), `${pdf.id}: unreviewed definition page`); }
  const content=await loadDigitalContent(pdf);
  assert.equal(content.fileId,pdf.source.fileId);
  assert.equal(content.games.length,75);
  for(const type of SOURCE_GAME_MODES)for(const level of ['easy','moderate','hard'])assert.equal(content.games.filter(q=>q.type===type&&q.difficulty===level).length,5);
  for(const q of content.games){
   assert.ok(q.source?.answerSpans?.every(span=>q.source!.quote.toLowerCase().includes(span.toLowerCase())));
   if(q.type==='pictureHunt')assert.equal(q.pictureOptions?.find(p=>p.id===q.answer)?.label,q.source!.answerSpans!.join(' / '));
   else if(q.assessmentStyle!=='restore-excerpt')assert.equal(q.answer,q.source!.answerSpans!.join(' / '));
   if(q.options){assert.equal(new Set(q.options.map(s=>s.toLowerCase())).size,q.options.length);assert.ok(q.options.includes(q.answer));}
   assert.ok(q.assessmentStyle==='restore-excerpt'?q.answer.includes('________'):q.contextSentence?.includes('________'));
  }
  assert.equal(createSourceGameSession(module,content.games.filter(q=>q.difficulty==='easy'),'missingPiece','hard'),null);
  assert.ok(content.games.every(q=>q.source?.kind !== 'definition-recall' || (!/_{2,}|\.{5,}/.test(q.source.quote) && (pdf.source.verifiedRecallPages||pdf.source.discussionPages).includes(q.source.page))), `${pdf.id}: invalid definition-derived game`);
  assert.equal(content.sourceSha256,pdf.source.sha256);
  const html=renderToStaticMarkup(<LessonAndQuizView module={module} nextModule={null} isPersonalization={false} isPreviewMode previewRole="admin" onBackToMap={()=>{}} onCompleteLesson={()=>{}} onSubmitQuizResult={()=>({totalPointsAwarded:0,newlyUnlockedBadges:[],bridgeNewlyRestored:false})} onAdvanceToNextModule={()=>{}} onOpenWritingLabWithPrompt={()=>{}}/>);
  assert.ok(html.includes('Module discussion'));
  assert.ok(html.includes('Concepts &amp; Rules'));
  for (const removed of ['Interactive Concept Bridge','Mini Sorting Game','Davao Oriental Context','Vocabulary Bank','Self-Check (','Additional Activities','Answer Key','What I Know','What’s More','What I Can Do']) assert.ok(!html.includes(removed), `${pdf.id}: retired lesson panel/tab`);
  assert.ok(pdf.sourceSections && pdf.sourceSections.length > 0);
  assert.ok(content.sourceSections?.every(s=>s.kind==='discussion'));
  assert.equal(content.sourceSections?.length,1);
  const discussionHtml=renderToStaticMarkup(<SourceLessonSections module={module} content={content} dataSaver retry={()=>{}}/>);
  assert.ok(!/href="https?:/.test(discussionHtml),`${pdf.id}: external source link exposed`);
  assert.ok(!discussionHtml.includes('Open the original PDF'));
  assert.ok(!discussionHtml.includes('View original'));
  assert.ok(content.sourceSections?.every(section=>section.entries.every(entry=>entry.blockIds.every(id=>content.blocks[id]?.page===entry.page))));
  for(const sourceSection of content.sourceSections!){const view=renderToStaticMarkup(<SourceLessonSections module={module} content={content} initialSection={sourceSection.id} dataSaver retry={()=>{}}/>);assert.ok(view.includes('role="tabpanel"'));assert.ok(!view.includes('Interactive Concept Bridge'));assert.ok(!view.includes('Mini Sorting Game'));}
  const discussion=content.sourceSections!.find(s=>s.id==='concepts')!;
  assert.equal(discussion.kind,'discussion');
  for(const entry of discussion.entries)for(const id of entry.blockIds){const text=content.blocks[id]?.text||'';assert.ok(!/^(?:Directions?\s*:|(?:Activity|Assessment)\s*\d+[.:]|What[’']?s More|What I Can Do|What I Know)/i.test(text), `${pdf.id}: activity in discussion: ${text.slice(0,80)}`);}
  assert.ok(html.includes('linocut-card'));
  assert.ok(!html.includes('digital-learning'));
  for(const section of ['concepts'] as const)for(const [i,excerpt] of pdf[section].entries()){
   const sourceHtml=renderToStaticMarkup(<SourceExcerpt lesson={pdf} excerpt={excerpt} content={content} section={section} index={i}/>);
   assert.ok(sourceHtml.includes(`PDF p. ${excerpt.page}`));
   assert.ok(!sourceHtml.includes(`${pdf.source.fileId}-p`));
   rendered++;
  }
  for(const mode of [...SOURCE_GAME_MODES,'all'] as const)for(const difficulty of ['easy','moderate','hard'] as const){
   const game=createSourceGameSession(module,content.games,mode,difficulty,()=>.4);
   if(game){ready++;assert.equal(game.length,getSessionQuestionCount(mode));assert.equal(new Set(game.map(q=>q.id)).size,game.length);if(mode==='all')for(const type of SOURCE_GAME_MODES)assert.equal(game.filter(q=>q.type===type).length,3);assert.ok(game.every(q=>q.source!.fileId===pdf.source.fileId&&q.difficulty===difficulty));}
   else blocked++;
  }
  assert.equal(createSourceGameSession(module,[],'all','easy'),null);
  const visuals=getModuleVisualConfig({...module,quizQuestions:content.games});
  for(const size of [visuals.tabs.selfCheck.questions.length,visuals.tabs.concepts.miniGame.items.length,visuals.tabs.concepts.interactiveDiagram.nodes.length])assert.ok(size===0||size===5,`${pdf.id}: incomplete mini-game`);
  assert.equal(module.lessonContent.culturalConnection,'');
  assert.equal(visuals.tabs.davaoContext.hotspots.length,0);
 }
 console.log(`PASS batch Grade ${grade} Quarter ${quarter}: ${batch.length} modules`);
}
globalThis.fetch=originalFetch;
assert.equal(ready,1908);assert.equal(blocked,0);
console.log(JSON.stringify({modules:106,sourceSelectionsRendered:rendered,readyDifficultyCombinations:ready,blockedDifficultyCombinations:blocked}));
fs.writeFileSync('docs/curriculum/binding-validation.json',JSON.stringify({modules:106,sourceSelectionsRendered:rendered,readyDifficultyCombinations:ready,blockedDifficultyCombinations:blocked},null,2)+'\n');
