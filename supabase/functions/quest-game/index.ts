import { createClient } from 'npm:@supabase/supabase-js@2.118.0';

const url = Deno.env.get('SUPABASE_URL')!;
const anon = Deno.env.get('SUPABASE_ANON_KEY')!;
const service = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const admin = createClient(url, service, { auth: { persistSession: false } });
const cors = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': 'authorization, apikey, content-type, x-client-info, x-supabase-api-version',
  'access-control-allow-methods': 'POST, OPTIONS',
  'content-type': 'application/json',
};

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response(null, { headers: cors });
  if (request.method !== 'POST') return new Response(JSON.stringify({ error: 'POST required' }), { status: 405, headers: cors });
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') || '';
  if (!token) return new Response(JSON.stringify({ error: 'Sign in required' }), { status: 401, headers: cors });
  const verifier = createClient(url, anon, { auth: { persistSession: false } });
  const { data: auth, error: authError } = await verifier.auth.getUser(token);
  if (authError || !auth.user) return new Response(JSON.stringify({ error: 'Invalid session' }), { status: 401, headers: cors });

  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: cors }); }
  const action = String(body.action || '');
  const userId = auth.user.id;
  let result: { data: unknown; error: { message: string } | null };
  if (action === 'wallet') {
    const wallet = await admin.from('quest_wallets').select('balance').eq('user_id', userId).maybeSingle();
    result = { data: { balance: wallet.data?.balance ?? 0 }, error: wallet.error };
  } else if (action === 'market') {
    const [wallet, inventory, transactions] = await Promise.all([
      admin.from('quest_wallets').select('balance').eq('user_id', userId).maybeSingle(),
      admin.from('quest_inventory').select('kind,quantity').eq('user_id', userId),
      admin.from('quest_ledger').select('event_key,amount,balance_after,created_at').eq('user_id', userId).order('created_at', { ascending: false }).limit(30),
    ]);
    result = {
      data: { balance: wallet.data?.balance ?? 0, inventory: inventory.data ?? [], transactions: transactions.data ?? [] },
      error: wallet.error || inventory.error || transactions.error,
    };
  } else if (action === 'buy') {
    result = await admin.rpc('quest_buy', { p_user: userId, p_kind: body.kind });
  } else if (action === 'start') {
    result = await admin.rpc('quest_start', { p_user: userId, p_module: body.moduleId, p_mode: body.mode, p_difficulty: body.difficulty });
  } else if (action === 'current') {
    result = await admin.rpc('quest_current_question', { p_user: userId, p_session: body.sessionId });
  } else if (action === 'submit') {
    result = await admin.rpc('quest_submit', { p_user: userId, p_session: body.sessionId, p_answer: String(body.answer ?? '') });
  } else if (action === 'finish') {
    result = await admin.rpc('quest_finish', { p_user: userId, p_session: body.sessionId });
  } else if (action === 'activate') {
    result = await admin.rpc('quest_activate', { p_user: userId, p_session: body.sessionId, p_kind: body.kind });
  } else if (action === 'purchase') {
    // Compatibility for existing preview deployments until their client updates.
    result = await admin.rpc('quest_purchase', { p_user: userId, p_session: body.sessionId, p_kind: body.kind });
  } else {
    return new Response(JSON.stringify({ error: 'Unknown action' }), { status: 400, headers: cors });
  }
  if (result.error) return new Response(JSON.stringify({ error: result.error.message }), { status: 400, headers: cors });
  return new Response(JSON.stringify(result.data), { headers: cors });
});
