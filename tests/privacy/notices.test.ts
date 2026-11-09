import test from 'node:test';
import assert from 'node:assert/strict';
import {database,asUser,uid} from './harness';
import {privacyAction} from '../../src/server/privacyActions';
// Real database privileges, not only UI checkbox assertions.
test('notice receipts are scoped, versioned and separate from consent/visibility',async()=>{
 const db=await database();
 try{
 await db.query('insert into lq_private.participating_students(student_id,group_id,grade) values($1,$2,7)',[uid(1),uid(100)]);
 const status=async(n:number)=>(await asUser(db,uid(n),()=>db.query<{result:{acknowledged:boolean}}>('select privacy_notice_status() as result'))).rows[0].result;
 assert.equal((await status(1)).acknowledged,false);
 await asUser(db,uid(1),()=>db.query("select privacy_acknowledge_notice('2026-11-09-preview-1',false)"));
 assert.equal((await status(1)).acknowledged,true);assert.equal((await status(2)).acknowledged,false);
 const first=(await db.query<{acknowledged_at:Date;terms_accepted_at:Date|null}>('select acknowledged_at,terms_accepted_at from lq_private.notice_acknowledgements where user_id=$1',[uid(1)])).rows[0];
 assert.equal(first.terms_accepted_at,null);
 await asUser(db,uid(1),()=>db.query("select privacy_acknowledge_notice('2026-11-09-preview-1',true)"));
 const receipt=(await db.query('select acknowledged_at,terms_accepted_at from lq_private.notice_acknowledgements where user_id=$1',[uid(1)])).rows[0];
 assert.deepEqual(receipt.acknowledged_at,first.acknowledged_at);assert.ok(receipt.terms_accepted_at);
 assert.equal((await db.query<{visible:boolean}>('select visible from lq_private.participating_students where student_id=$1',[uid(1)])).rows[0].visible,false);
 await assert.rejects(asUser(db,uid(2),()=>db.query('select * from lq_private.notice_acknowledgements')));
 await assert.rejects(asUser(db,uid(2),()=>db.query("select privacy_acknowledge_notice('invented-version',true)")));
 await assert.rejects(privacyAction({action:'acknowledgeNotice',version:'2026-11-09-preview-1',termsAccepted:true,userId:uid(1)},async()=>null));
 await assert.rejects(privacyAction({action:'acknowledgeNotice',version:'2026-11-09-preview-1',termsAccepted:'yes'},async()=>null));
 }finally{await db.close()}
});
