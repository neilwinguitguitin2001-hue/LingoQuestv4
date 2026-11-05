import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import targets from '../src/data/curriculum/quizLearningTargets.json';
import {PDF_LESSONS} from '../src/data/curriculum/pdfCurriculum';
import {loadDigitalContent} from '../src/data/curriculum/digitalContent';
import {pictureSceneFor} from '../src/data/curriculum/pictureIllustrations';
import {PictureHuntIllustration} from '../src/components/PictureHuntIllustration';
let anchors=0,questions=0,cards=0;
const scenes=new Set<string>();
for(const module of targets)for(const anchor of module.anchors){
 const scene=pictureSceneFor(anchor.term);assert.ok(scene,`${module.moduleId}: missing artwork for ${anchor.term}`);scenes.add(scene);
 const svg=renderToStaticMarkup(<PictureHuntIllustration term={anchor.term}/>);
 assert.ok(svg.includes(`data-picture-scene="${scene}"`));assert.ok(svg.includes('role="img"'));assert.ok(!/<image\b|https?:\/\//.test(svg.replace('http://www.w3.org/2000/svg','')));anchors++;
}
for(const module of PDF_LESSONS){
 const data=await loadDigitalContent(module);
 const bank=data.games.filter(q=>q.type==='pictureHunt');assert.equal(bank.length,15,module.id);
 for(const q of bank){
  assert.ok(q.pictureOptions?.some(p=>p.id===q.answer),q.id);
  for(const option of q.pictureOptions!){assert.ok(option.conceptVisual?.tokens.length);assert.ok(pictureSceneFor(option.conceptVisual!.tokens[0]),`${q.id}: ${option.label}`);cards++;}
  questions++;
 }
}
assert.equal(targets.length,106);assert.equal(anchors,530);assert.equal(questions,1590);assert.equal(cards,5300);
console.log(`Verified ${targets.length} modules, ${anchors} source targets, ${scenes.size} illustration scenes, ${questions} Picture Hunt questions and ${cards} answer cards. All assessed cards have explicit artwork; answer IDs remain valid.`);
