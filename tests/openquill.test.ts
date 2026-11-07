import assert from 'node:assert/strict';
import test from 'node:test';
import { checkOpenQuill } from '../src/utils/openquillGrammar';
import { generateOpenQuillFeedback } from '../src/utils/openquillFeedback';

test('known spelling errors preserve offsets and original text', () => {
  const text = 'I recieve teh book.';
  const r = checkOpenQuill(text);
  assert.equal(r.correctedText, 'I receive the book.');
  assert.equal(r.issues.length, 2);
  for (const i of r.issues) assert.equal(text.slice(i.index, i.index + i.original.length), i.original);
});
test('multiple grammar matches terminate and use longest overlap', () => {
  assert.equal(checkOpenQuill("He don't know nothing. She don't agree.").correctedText, "He doesn't know anything. She doesn't agree.");
});
test('duplicate phrases and words', () => {
  assert.equal(checkOpenQuill('The the students read. In fact, in fact it helps.').correctedText, 'The students read. In fact it helps.');
});
test('does not guess valid words, proper names, acronyms or ambiguous phrases', () => {
  for (const text of ['The food is in the book.', 'Exercise your right to vote.', 'Neil reads with UNESCO.', 'They had had lunch.', 'I know that that is true.']) {
    assert.equal(checkOpenQuill(text).correctedText, text);
  }
});
test('leading whitespace, capitalization and contractions', () => {
  assert.equal(checkOpenQuill("  he don't agree.").correctedText, "  He doesn't agree.");
  assert.equal(checkOpenQuill('We could of read it.').correctedText, 'We could have read it.');
});
test('bounds and no fake confidence', () => {
  assert.throws(() => checkOpenQuill('a'.repeat(5001)), /5,000/);
  const r = generateOpenQuillFeedback('The book is here.');
  assert.equal(r.checker, 'openquill');
  assert.equal(r.grammarIssues.length, 0);
  assert.match(r.overallClarityComment, /does not mean.*error-free/);
});
