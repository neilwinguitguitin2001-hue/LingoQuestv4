import assert from 'node:assert/strict';
import test from 'node:test';
import {uid} from './harness';
const base='http://127.0.0.1:5642';
async function login(n:number,role='student'){
 const r=await fetch(base+'/api/account-login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({identifier:`fixture${n}`,password:'LocalReview!2026',role})});
 assert.equal(r.status,200);const d=await r.json();return d.session.access_token as string;
}
async function request(token:string,body:unknown){const r=await fetch(base+'/api/privacy',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify(body)});return {status:r.status,data:await r.json(),cache:r.headers.get('cache-control')};}
test('authenticated HTTP flow returns only authorized records',async()=>{
 const a=await login(1),b=await login(2),other=await login(4),teacher=await login(7,'teacher'),admin=await login(9,'admin');
 const boot=await request(a,{action:'bootstrap'});assert.equal(boot.status,200);assert.equal(boot.data.students.length,1);assert.equal(boot.data.students[0].student.id,uid(1));assert.doesNotMatch(JSON.stringify(boot.data),/NEVER-EXPOSE|password|Private Fixture 2/);assert.equal(boot.cache,'no-store');
 assert.equal((await request(a,{action:'report',studentId:uid(2)})).status,403);
 assert.equal((await request(a,{action:'export',studentId:uid(2)})).status,403);
 assert.equal((await request(a,{action:'board',grade:8})).status,403);
 assert.equal((await request(other,{action:'board',grade:7})).status,403);
 assert.equal((await request(a,{action:'visibility',visible:true,studentId:uid(2)})).status,403);
 assert.equal((await request(teacher,{action:'report',studentId:uid(1)})).status,200);
 assert.equal((await request(teacher,{action:'export',studentId:uid(2)})).status,403);
 assert.equal((await request(admin,{action:'report',studentId:uid(1)})).status,403);
 assert.equal((await request(admin,{action:'summary'})).status,200);
 const original=(await request(a,{action:'board'})).data;assert.equal(original.visible,false);
 const consent=await request(a,{action:'visibility',visible:true});assert.equal(consent.status,200);assert.equal(consent.data.visible,true);
 const peer=(await request(b,{action:'board'})).data;assert.equal(peer.entries.length,2);for(const row of peer.entries)assert.deepEqual(Object.keys(row).sort(),['activity_points','alias']);
 assert.doesNotMatch(JSON.stringify(peer.entries),/Private Fixture|student_id|grade_level|score|email|photo|id|badge/);
 const hide=await request(a,{action:'visibility',visible:false});assert.equal(hide.status,200);assert.equal((await request(b,{action:'board'})).data.entries.length,1);
 assert.equal((await request(a+'.forged',{action:'board'})).status,401);
 assert.equal((await fetch(base+'/api/privacy')).status,410);
 for(const path of ['/api/users','/api/users/'+uid(2),'/api/progress','/api/auth/session'])assert.equal((await fetch(base+path,{method:'POST'})).status,410);
});
