import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { PDF_LESSONS, PDF_MODULES } from '../src/data/curriculum/pdfCurriculum';
import { ALL_MODULES } from '../src/data/seedData';
import { PdfLessonView } from '../src/components/PdfLessonView';
import { isStudentModuleUnlocked } from '../src/utils/progression';
import fs from 'node:fs';
import { createSourceGameSession, SOURCE_GAME_MODES } from '../src/utils/sourceGameSession';
import type { DigitalContent } from '../src/data/curriculum/digitalContent';
import type { StudentAccount } from '../src/types/lingoquest';

assert.equal(ALL_MODULES, PDF_MODULES);
assert.equal(PDF_LESSONS.length, 106);
for (const module of PDF_MODULES) {
  assert.equal(module.quizQuestions.length, 0, 'Never manufacture scored questions');
  assert.equal(module.lessonContent.culturalConnection, '');
  const html = renderToStaticMarkup(<PdfLessonView module={module} onBack={() => {}} onComplete={() => {}} />);
  assert.ok(html.includes('Lesson Concept / Overview'));
  assert.ok(html.includes(module.pdfLesson!.source.fileId));
  for (const label of ['Concepts &amp; Rules', 'Guided Analysis', 'Pitfalls &amp; Tips', 'Vocabulary Bank', 'Self-Check', 'Study Cheatsheet']) {
    assert.ok(html.includes(label), `${module.id}: ${label}`);
  }
  const assessment = renderToStaticMarkup(<PdfLessonView module={module} initialSelfCheck onBack={() => {}} onComplete={() => {}} />);
  assert.ok(assessment.includes('Source answer key / checking guide'));
}
const [first, second] = PDF_MODULES.filter((m) => m.gradeLevel === 7);
const student = { id: 'test', gradeLevel: 7, completedModules: [], progressByModule: {} } as unknown as StudentAccount;
assert.equal(isStudentModuleUnlocked(first, student, PDF_MODULES), true);
assert.equal(isStudentModuleUnlocked(second, student, PDF_MODULES), false);
student.progressByModule[first.id] = { lessonCompleted: true } as never;
assert.equal(isStudentModuleUnlocked(second, student, PDF_MODULES), false);
student.progressByModule[first.id] = { lessonCompleted: true, bestScorePercent: 80 } as never;
assert.equal(isStudentModuleUnlocked(second, student, PDF_MODULES), true);
assert.equal(isStudentModuleUnlocked(PDF_MODULES.find((m) => m.gradeLevel === 8)!, student, PDF_MODULES), false);
let playable = 0, blocked = 0;
const review = [];
for (const module of PDF_MODULES) {
 const content = JSON.parse(fs.readFileSync(`public${module.pdfLesson!.digitalContentUrl}`, 'utf8')) as DigitalContent;
 const modes: Record<string, {verified:number; status:string}> = {};
 for (const mode of [...SOURCE_GAME_MODES, 'all'] as const) {
  for (const difficulty of ['easy','moderate','hard'] as const) {
   const result = createSourceGameSession(module, content.games, mode, difficulty, () => .42);
   if (result) {
    playable++;
    assert.equal(result.length, 5);
    assert.equal(new Set(result.map(q=>q.source!.sourceId)).size, 5);
    assert.ok(result.every(q=>q.source!.fileId===module.pdfLesson!.source.fileId && q.difficulty===difficulty));
   } else blocked++;
   if (difficulty === 'easy') modes[mode] = {verified: new Set(content.games.filter(q=>q.type===mode).map(q=>q.source!.sourceId)).size, status: result?'ready':'needs-source-review'};
  }
 }
 assert.equal(createSourceGameSession(module, content.games.slice(0, 4), 'typeHunter', 'easy'), null);
 const foreign = content.games.map(q=>({...q,source:{...q.source!,fileId:'wrong-pdf'}}));
 assert.equal(createSourceGameSession(module, foreign, 'all', 'easy'), null);
 review.push({moduleId:module.id,grade:module.gradeLevel,quarter:module.quarter,sourceLabel:module.pdfLesson!.sourceLabel,modes});
}
fs.writeFileSync('docs/source-game-review.json', JSON.stringify(review,null,2)+'\n');
console.log(`PASS: 106 lessons; 1,908 session combinations checked (${playable} playable, ${blocked} safely blocked); exactly five distinct source questions per playable session. Lesson + quiz progression preserved.`);
