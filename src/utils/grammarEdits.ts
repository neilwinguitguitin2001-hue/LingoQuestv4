export const GRAMMAR_SCHEMA = {
  type: 'object', properties: { edits: { type: 'array', items: {
    type: 'object', properties: { original: { type: 'string' }, replacement: { type: 'string' }, reason: { type: 'string' }, occurrence: { type: 'integer' } },
    required: ['original', 'replacement', 'reason', 'occurrence'], additionalProperties: false,
  } } }, required: ['edits'], additionalProperties: false,
};
export interface GrammarEdit { original: string; replacement: string; reason: string; occurrence: number; index: number }

// Model output is untrusted. Only edits anchored to the exact draft are accepted.
export function validateGrammarEdits(text: string, value: unknown): GrammarEdit[] {
  const edits = (value as { edits?: unknown } | null)?.edits;
  if (!Array.isArray(edits) || edits.length > 30) throw new Error('Invalid edits');
  const out: GrammarEdit[] = [];
  for (const edit of edits) {
    if (!edit || typeof edit.original !== 'string' || !edit.original.length || edit.original.length > 1000 ||
        typeof edit.replacement !== 'string' || edit.replacement.length > 1500 ||
        typeof edit.reason !== 'string' || !edit.reason.length || edit.reason.length > 500 ||
        !Number.isInteger(edit.occurrence) || edit.occurrence < 0 || edit.occurrence > 5000) throw new Error('Invalid edit');
    let index = -1;
    for (let i = 0; i <= edit.occurrence; i++) {
      index = text.indexOf(edit.original, index + 1);
      if (index < 0) throw new Error('Unanchored edit');
    }
    if (out.some(e => index < e.index + e.original.length && e.index < index + edit.original.length)) throw new Error('Overlapping edits');
    if (edit.original !== edit.replacement) out.push({ original: edit.original, replacement: edit.replacement, reason: edit.reason, occurrence: edit.occurrence, index });
  }
  return out.sort((a, b) => a.index - b.index);
}
export function applyGrammarEdits(text: string, edits: GrammarEdit[]): string {
  return [...edits].sort((a, b) => b.index - a.index).reduce((s, e) => s.slice(0, e.index) + e.replacement + s.slice(e.index + e.original.length), text);
}
