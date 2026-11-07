import { supabase } from '../lib/supabase';
import { runGrammarCheck } from '../utils/grammarFeedback';

export function checkWriting(text: string, account?: { email?: string; password?: string }) {
  return runGrammarCheck(text, async () => {
    let session = await supabase?.auth.getSession();
    // Existing username/LRN login may restore a local account without an Auth session.
    // Verify its existing credentials with Supabase; never treat local state as identity.
    if (!session?.data.session && supabase && account?.email && account.password) {
      const verified = await supabase.auth.signInWithPassword({ email: account.email, password: account.password });
      if (verified.error) throw new Error('SIGN_IN_REQUIRED');
      session = await supabase.auth.getSession();
    }
    const token = session?.data.session?.access_token;
    if (!token) throw new Error('SIGN_IN_REQUIRED');
    const response = await fetch('/api/grammar-check', {
      method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }), signal: AbortSignal.timeout(25000),
    });
    if (!response.ok) {
      const detail = await response.json().catch(() => null);
      const known = ['AI_NOT_CONFIGURED', 'AUTH_FAILED', 'PROVIDER_AUTH', 'PROVIDER_LIMIT', 'PROVIDER_REQUEST', 'PROVIDER_TIMEOUT', 'PROVIDER_OUTPUT'];
      throw new Error(known.includes(detail?.code) ? detail.code : `HTTP_${response.status}`);
    }
    return response.json();
  });
}
