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
  } catch (error) {
    const local = generateOpenQuillFeedback(text);
    const reasons: Record<string, string> = { SIGN_IN_REQUIRED: 'A valid sign-in session is required for AI.', AI_NOT_CONFIGURED: 'The AI key is missing on this deployment.', AUTH_FAILED: 'Your login session could not be verified. Sign out and sign in again.', PROVIDER_AUTH: 'Groq rejected the configured API key.', PROVIDER_LIMIT: 'Groq has reached its usage limit. Please try later.', PROVIDER_REQUEST: 'Groq rejected the model request.', PROVIDER_TIMEOUT: 'The AI request timed out.', PROVIDER_OUTPUT: 'The AI response could not be validated.', HTTP_401: 'The request was blocked by authentication.', HTTP_403: 'The request was blocked by deployment access protection.' };
    const reason = error instanceof Error ? reasons[error.message] : undefined;
    return { ...local, overallClarityComment: (reason ? reason + ' ' : 'AI is unavailable or not configured. ') + 'This result uses limited local rules. ' + local.overallClarityComment };
  }
}
