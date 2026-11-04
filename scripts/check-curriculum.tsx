import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { PDF_LESSONS, PDF_MODULES } from '../src/data/curriculum/pdfCurriculum';
import { ALL_MODULES } from '../src/data/seedData';
import { PdfLessonView } from '../src/components/PdfLessonView';
import { isStudentModuleUnlocked } from '../src/utils/progression';
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
assert.equal(isStudentModuleUnlocked(second, student, PDF_MODULES), true);
assert.equal(isStudentModuleUnlocked(PDF_MODULES.find((m) => m.gradeLevel === 8)!, student, PDF_MODULES), false);
console.log('PASS: 106 lessons and self-check views render; source-only questions, grade restrictions, and sequential reading progression verified.');
