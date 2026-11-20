import React from 'react';
import test from 'node:test';
import assert from 'node:assert/strict';
import {renderToStaticMarkup} from 'react-dom/server';
import {AnalogyVideoExplainer, ANALOGY_VIDEO_SOURCE} from '../src/components/AnalogyVideoExplainer';
test('sample video only binds to the verified Grade 7 Quarter 1 Module 1 PDF', () => {
  assert.equal(renderToStaticMarkup(<AnalogyVideoExplainer moduleId="g8-q1-m1" sourceSha256={ANALOGY_VIDEO_SOURCE}/>),'');
  assert.equal(renderToStaticMarkup(<AnalogyVideoExplainer moduleId="g7-q1-m1" sourceSha256="different-pdf"/>),'');
});
test('video is optional, accessible without streaming, and never autoplays', () => {
  const html=renderToStaticMarkup(<AnalogyVideoExplainer moduleId="g7-q1-m1" sourceSha256={ANALOGY_VIDEO_SOURCE}/>);
  assert.match(html,/<video[^>]*controls=""/); assert.match(html,/preload="none"/); assert.doesNotMatch(html,/autoplay/i);
  assert.match(html,/<track[^>]*kind="captions"[^>]*srcLang="en"/);
  assert.match(html,/Read the video transcript/); assert.match(html,/a title page is part of a book/);
  assert.match(html,/does not affect your score or lesson completion/);
});
