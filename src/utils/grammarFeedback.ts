import type { WritingFeedbackResult } from '../types/lingoquest';
import { generateOpenQuillFeedback } from './openquillFeedback';
import { applyGrammarEdits, validateGrammarEdits } from './grammarEdits';

export async function runGrammarCheck(text: string, request: () => Promise<unknown>): Promise<WritingFeedbackResult> {
  if (text.trim().length < 10 || text.length > 5000) throw new Error('Enter 10–5,000 characters.');
  try {
    const edits = validateGrammarEdits(text, await request());
    return {
      checker: 'groq-ai', clarityScore: 0,
      overallClarityComment: edits.length
        ? 'AI suggestions may contain mistakes. Review every change for accuracy and meaning; this is not a grade.'
        : 'AI did not flag an error. This does not guarantee error-free writing. Ask your teacher about uncertain grammar.',
      correctedVersion: applyGrammarEdits(text, edits), strengthsHighlighted: [],
      grammarIssues: edits.map(e => ({ originalPhrase: e.original, suggestion: e.replacement, explanation: e.reason, ruleCategory: 'AI grammar suggestion' })),
      constructionSuggestions: ['Your original draft has not been changed. Review the suggested revision before copying it.'],
    };
  } catch {
    const local = generateOpenQuillFeedback(text);
    return { ...local, overallClarityComment: 'AI is unavailable or not configured, so this result uses limited local rules. ' + local.overallClarityComment };
  }
}
