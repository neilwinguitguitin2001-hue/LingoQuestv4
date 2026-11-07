import assert from 'node:assert/strict';
import test from 'node:test';
import { Readable } from 'node:stream';
import handler from '../api/grammar-check';
import { validateGrammarEdits, applyGrammarEdits } from '../src/utils/grammarEdits';
import { runGrammarCheck } from '../src/utils/grammarFeedback';

const edit = (original: string, replacement: string, occurrence = 0) => ({original,replacement,occurrence,reason:'Grammar correction.'});
test('anchors repeated occurrences and applies in reverse order', () => {
  const text = 'He go. He go.';
  const edits = validateGrammarEdits(text,{edits:[edit('go','goes',1)]});
  assert.equal(applyGrammarEdits(text, edits),'He go. He goes.');
});
test('rejects hallucinated, overlapping, excessive and malformed edits', () => {
  for (const edits of [[edit('absent','x')],[edit('He go','He goes'),edit('go','goes')],[{...edit('go','goes'),occurrence:-1}],Array(31).fill(edit('go','goes')),[{original:'go'}]]) {
    assert.throws(()=>validateGrammarEdits('He go.',{edits}));
  }
});
test('AI result and fallback are honestly labelled', async () => {
  const ai = await runGrammarCheck('He go to school.',async()=>({edits:[edit('go','goes')]}));
  assert.equal(ai.checker,'groq-ai');
  assert.equal(ai.correctedVersion,'He goes to school.');
  for (const request of [async()=>{throw Error('429');},async()=>({edits:[edit('invented','new')]})]) {
    const fallback = await runGrammarCheck('I recieve teh book.',request);
    assert.equal(fallback.checker,'openquill');
    assert.equal(fallback.correctedVersion,'I receive the book.');
    assert.match(fallback.overallClarityComment,/AI is unavailable/);
  }
});
async function invoke(method: string, token?: string, body: unknown = {text:'He go to school.'}) {
  const req = Object.assign(Readable.from([]),{method,headers:{authorization:token && `Bearer ${token}`,'content-type':'application/json'},body});
  let data = ''; const headers: Record<string,string> = {};
  const res = {statusCode:0,setHeader(k:string,v:string){headers[k]=v;},end(s:string){data=s;}};
  await handler(req as never,res as never);
  return {status:res.statusCode,body:JSON.parse(data),headers};
}
test('API rejects wrong method, missing auth and oversized input', async () => {
  assert.equal((await invoke('GET')).status,405);
  assert.equal((await invoke('POST')).status,401);
  process.env.VITE_SUPABASE_URL='https://test.supabase.co';process.env.VITE_SUPABASE_ANON_KEY='test-anon';
  assert.equal((await invoke('POST','fake',{text:'a'.repeat(5001)})).status,400);
});
test('API verifies identity, handles missing key, validates output, and throttles', async () => {
  const savedFetch=globalThis.fetch; let calls=0; let authenticated=true; let invalid=false;
  const savedKey=process.env.GROQ_API_KEY;
  globalThis.fetch=async(input) => {
    if(String(input).includes('/auth/v1/user')) return new Response(JSON.stringify(authenticated ? {id:'test-student',aud:'authenticated',role:'authenticated',email:'test@example.test'} : {message:'Invalid token'}),{status:authenticated?200:401,headers:{'Content-Type':'application/json'}});
    calls++;
    return new Response(JSON.stringify({choices:[{finish_reason:'stop',message:{content:JSON.stringify({edits:[edit(invalid?'absent':'go','goes')]})}}]}),{headers:{'Content-Type':'application/json'}});
  };
  try {
    authenticated=false; assert.equal((await invoke('POST','fake')).status,401); assert.equal(calls,0);
    authenticated=true; delete process.env.GROQ_API_KEY;
    assert.equal((await invoke('POST','fake')).status,503);assert.equal(calls,0);
    process.env.GROQ_API_KEY='fake-key';
    const result=await invoke('POST','fake'); assert.equal(result.status,200);assert.equal(result.body.edits[0].index,3);assert.equal(result.headers['Cache-Control'],'no-store');
    invalid=true;assert.equal((await invoke('POST','fake')).status,503);invalid=false;
    for(let i=0;i<3;i++) assert.equal((await invoke('POST','fake')).status,200);
    assert.equal((await invoke('POST','fake')).status,429);assert.equal(calls,5);
  } finally { globalThis.fetch=savedFetch; if(savedKey) process.env.GROQ_API_KEY=savedKey;else delete process.env.GROQ_API_KEY; }
});
