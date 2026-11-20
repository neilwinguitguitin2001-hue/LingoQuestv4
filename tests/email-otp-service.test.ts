import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import vm from 'node:vm';
import {transformSync} from 'esbuild';
import * as validation from '../src/utils/emailOtpValidation';
function harness(options:any={}){
 const calls:any[]=[];
 const user={id:'verified-user'};
 const session={access_token:'test-access',refresh_token:'test-refresh'};
 const auth={
  signInWithOtp:async (x:any)=>{calls.push(['request',x]);return {error:options.requestError};},
  resend:async(x:any)=>{calls.push(['resend',x]);return {error:options.requestError};},
  verifyOtp:async(x:any)=>{calls.push(['verify',x]);return {data:options.empty?{}:{user,session},error:options.verifyError};},
  signOut:async(x:any)=>{calls.push(['temporary-signout',x]);return {error:null};}
 };
 const client={auth,from:(table:string)=>{calls.push(['table',table]);return {select:(fields:string)=>{calls.push(['select',fields]);return {eq:(key:string,id:string)=>{calls.push(['identity',key,id]);return {maybeSingle:async()=>({data:options.profile??{id:user.id,role:'student',status:'approved'},error:options.profileError})};}};}};}};
 const persistent={auth:{setSession:async(x:any)=>{calls.push(['install',x]);return {error:options.sessionError};},getSession:async()=>({data:{session:{user:{id:options.currentUser??user.id}}}}),signOut:async()=>{calls.push(['persistent-signout']);}}};
 const exports:any={};const module={exports};
 const code=transformSync(fs.readFileSync(new URL('../src/services/emailOtp.ts',import.meta.url),'utf8'),{loader:'ts',format:'cjs',target:'es2022'}).code;
 vm.runInNewContext(code,{exports,module,window:{location:{origin:'https://preview.example'}},require:(path:string)=>{
  if(path==='../lib/supabase')return {createSignupClient:()=>client,supabase:persistent};
  if(path==='./privacyService')return {privateBootstrap:async()=>{calls.push(['bootstrap']);if(options.bootstrapError)throw Error('failed');return {users:options.users??[{id:user.id,role:'student'}]};}};
  if(path==='../utils/emailOtpValidation')return validation;
  throw Error('Unexpected import');
 }});
 return {api:module.exports,calls};
}
test('login requests normalize email and explicitly prevent account creation',async()=>{
 const {api,calls}=harness();await api.requestEmailCode(' Learner@Example.edu ','login');
 assert.equal(calls[0][1].email,'learner@example.edu');assert.equal(calls[0][1].options.shouldCreateUser,false);
});
test('registration resend uses signup verification without creating a login request',async()=>{
 const {api,calls}=harness();await api.requestEmailCode('learner@example.edu','registration');
 assert.equal(calls[0][0],'resend');assert.equal(calls[0][1].type,'signup');
});
test('invalid, expired, reused or missing-session verification never installs a session',async()=>{
 for(const options of [{verifyError:{code:'otp_expired'}},{verifyError:{code:'otp_disabled'}},{empty:true}]){
  const {api,calls}=harness(options);await assert.rejects(api.verifyEmailCode('a@example.edu','00123456','login','student'),/invalid or expired/);assert.equal(calls.some(x=>x[0]==='install'),false);
 }
});
test('signup verification discards temporary session and never opens or approves a portal',async()=>{
 const {api,calls}=harness();assert.equal(await api.verifyEmailCode('a@example.edu','00123456','registration','teacher'),null);
 assert.equal(calls[0][1].type,'signup');assert.equal(calls.some(x=>x[0]==='temporary-signout'),true);assert.equal(calls.some(x=>['install','table','bootstrap'].includes(x[0])),false);
});
test('portal mismatch, suspension and profile lookup errors prevent persistent login',async()=>{
 for(const options of [{profile:{role:'teacher',status:'approved'}},{profile:{role:'student',status:'suspended'}},{profileError:{message:'denied'}}]){
  const {api,calls}=harness(options);await assert.rejects(api.verifyEmailCode('a@example.edu','00123456','login','student'),/unavailable/);
  assert.equal(calls.some(x=>x[0]==='install'),false);assert.equal(calls.some(x=>x[0]==='temporary-signout'),true);
 }
});
test('valid login queries only verified identity and returns its own bootstrap record',async()=>{
 const {api,calls}=harness();const result=await api.verifyEmailCode('a@example.edu','00123456','login','student');assert.equal(result.id,'verified-user');
 assert.equal(calls[0][1].type,'email');assert.equal(calls[0][1].token,'00123456');
 const query=calls.find(x=>x[0]==='identity');assert.equal(query[1],'id');assert.equal(query[2],'verified-user');assert.equal(calls.filter(x=>x[0]==='install').length,1);
});
test('failed account bootstrap removes only the session just installed',async()=>{
 for(const currentUser of ['verified-user','another-user']){
  const {api,calls}=harness({bootstrapError:true,currentUser});await assert.rejects(api.verifyEmailCode('a@example.edu','00123456','login','student'),/could not be opened/);
  assert.equal(calls.some(x=>x[0]==='persistent-signout'),currentUser==='verified-user');
 }
});
test('delivery failures surface a generic error while missing accounts remain undisclosed',async()=>{
 const missing=harness({requestError:{code:'user_not_found'}});await missing.api.requestEmailCode('a@example.edu','login');
 const limited=harness({requestError:{code:'over_email_send_rate_limit'}});await assert.rejects(limited.api.requestEmailCode('a@example.edu','login'),/Wait a minute/);
});
