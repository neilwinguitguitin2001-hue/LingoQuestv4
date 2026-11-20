import React from 'react';
import test from 'node:test';
import assert from 'node:assert/strict';
import {renderToStaticMarkup} from 'react-dom/server';
import targets from '../src/data/curriculum/quizLearningTargets.json';
import {compileModuleQuestions,type ModuleTargets} from '../src/data/curriculum/tieredQuestions';
import {QuizConceptCard} from '../src/components/QuizConceptCard';
import {QuizPictureInspector} from '../src/components/QuizPictureInspector';
test('every Picture Hunt choice is unique, module-supported and keeps its original correct ID',()=>{
 for(const module of targets as ModuleTargets[]){
  const questions=compileModuleQuestions(module).filter(q=>q.type==='pictureHunt');
  for(const q of questions){
   const choices=q.pictureOptions!;assert.equal(choices.length,4,`${q.id} choices`);
   assert.equal(new Set(choices.map(c=>c.label.toLowerCase())).size,4,q.id);
   assert.equal(q.answer,`${q.id}-card-0`);
   for(const c of choices)for(const term of c.label.split(' / '))assert.ok(module.anchors.some(a=>a.quote.toLowerCase().includes(term.toLowerCase())),`${q.id}: unsupported ${term}`);
  }
 }
});
test('distractors vary across question variants instead of always using the same early entries',()=>{
 const qs=compileModuleQuestions((targets as ModuleTargets[])[0]).filter(q=>q.type==='pictureHunt'&&q.difficulty==='easy');
 assert.ok(new Set(qs.map(q=>q.pictureOptions!.slice(1).map(c=>c.label).join('|'))).size>5);
});
test('unmapped answer terms do not get an unrelated generic illustration',()=>{
 const html=renderToStaticMarkup(<QuizConceptCard tokens={['unmapped sample']} variant={0} topic="Listening"/>);
 assert.doesNotMatch(html,/data-picture-scene/);assert.match(html,/unmapped sample/);
});
test('picture inspection has no answer submission controls or correctness data',()=>{
 const q=compileModuleQuestions((targets as ModuleTargets[])[0]).find(q=>q.type==='pictureHunt')!;
 const html=renderToStaticMarkup(<QuizPictureInspector pictures={q.pictureOptions!} topic="Analogy"/>);
 assert.match(html,/Inspect pictures/);assert.match(html,/Next picture/);assert.match(html,/timer keeps running/);assert.doesNotMatch(html,/correct|Submit answer/);
});
