import { supabase } from '../lib/supabase';
import { runGrammarCheck } from '../utils/grammarFeedback';

export function checkWriting(text: string) {
  return runGrammarCheck(text, async () => {
    const session = await supabase?.auth.getSession();
    const token = session?.data.session?.access_token;
    if (!token) throw new Error('No session');
    const response = await fetch('/api/grammar-check', {
      method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }), signal: AbortSignal.timeout(25000),
    });
    if (!response.ok) throw new Error('AI unavailable');
    return response.json();
  });
}
