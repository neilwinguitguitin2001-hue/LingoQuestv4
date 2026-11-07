import type { WritingFeedbackResult } from '../types/lingoquest';
import { checkOpenQuill } from './openquillGrammar';

export function generateOpenQuillFeedback(text: string): WritingFeedbackResult {
  const { correctedText, issues } = checkOpenQuill(text);
  return {
    checker: 'openquill',
    clarityScore: 0, // Retained for existing records; not a grade and not displayed.
    overallClarityComment: issues.length
      ? `OpenQuill found ${issues.length} possible issue${issues.length === 1 ? '' : 's'}. Review each suggestion: local rules can miss errors or flag valid writing.`
      : 'No supported patterns were flagged. This does not mean your writing is error-free. OpenQuill has limited rule coverage and does not assess meaning or overall clarity.',
    correctedVersion: correctedText,
    strengthsHighlighted: [],
    grammarIssues: issues.map(issue => ({
      originalPhrase: issue.original,
      suggestion: issue.replacement,
      explanation: issue.reason,
      ruleCategory: issue.type === 'spelling' ? 'Spelling' : 'Grammar',
    })),
    constructionSuggestions: ['Compare the suggested revision with your original before using it. Ask your teacher about uncertain corrections.'],
  };
}
