import assert from 'node:assert/strict';
import test from 'node:test';
import {database,asUser,uid} from './harness';
import {privacyAction} from '../../src/server/privacyActions';

test('real PostgreSQL role, grade, consent and record boundaries',async t=>{
 const db=await database();
 const groupA=uid(100),groupB=uid(101);
 for(let n=1;n<=6;n++)await db.query(`insert into lq_private.participating_students(student_id,group_id,grade) values($1,$2,$3)`,[uid(n),n===3?groupB:groupA,n<=3?7:n===4?8:n===5?9:10]);
 await db.query(`insert into lq_private.teacher_assignments values($1,$2)`,[uid(1),uid(7)]);
 await db.query(`insert into lq_private.staff_roles values($1,'researcher')`,[uid(11)]);
 await db.query(`insert into lq_private.individual_access_grants values($1,$2,'Approved review',$3,now()+interval '1 day'),($1,$4,'Expired review',$3,now()-interval '1 day'),($5,$4,'Approved study analysis',$3,now()+interval '1 day')`,[uid(10),uid(1),uid(9),uid(2),uid(11)]);
 const rpc=async(name:string,args?:Record<string,unknown>)=>{
  const values=Object.values(args||{});const r=await db.query<any>(`select public.${name}(${values.map((_,i)=>'$'+(i+1)).join(',')}) as data`,values);return r.rows[0].data;
 };
 const board=(n:number,grade?:number)=>asUser(db,uid(n),()=>rpc('privacy_grade_board',{p_grade:grade??null}));
 const visible=(n:number,v:boolean)=>asUser(db,uid(n),()=>rpc('privacy_set_board_visibility',{p_visible:v}));
 await t.test('hidden by default, random aliases and no public identity mapping',async()=>{
  const b=await board(1);assert.equal(b.visible,false);assert.deepEqual(b.entries,[]);assert.match(b.my_alias,/^Explorer-[a-f0-9]{10}$/);
  assert.notEqual(b.my_alias,(await board(2)).my_alias);
  await assert.rejects(asUser(db,uid(1),()=>db.query('select * from lq_private.participating_students')));
 });
 await t.test('student cannot choose alias, group, identity or points through API',async()=>{
  for(const body of [{action:'visibility',visible:true,studentId:uid(2)},{action:'visibility',visible:true,alias:'My name'},{action:'board',groupId:groupB},{action:'board',userId:uid(2)},{action:'board',grade:11}])await assert.rejects(privacyAction(body,rpc));
  await assert.rejects(asUser(db,uid(1),()=>rpc('privacy_record_completion',{p_student:uid(1),p_activity:'fake'})));
  await assert.rejects(asUser(db,uid(1),()=>db.query('insert into quest_sessions(user_id,module_id,game_mode,next_index,finished_at) values($1,\'fake\',\'mode\',10,now())',[uid(1)])));
  await assert.rejects(asUser(db,uid(1),()=>db.query('insert into lq_private.activity_completions values($1,$2,now())',[uid(1),'forged'])));
 });
 await t.test('opt-in only exposes alias and activity points in same group and grade',async()=>{
  for(let n=1;n<=6;n++)await visible(n,true);
  const b=await board(1);assert.equal(b.entries.length,2);assert.equal((await board(3)).entries.length,1);
  for(const row of b.entries)assert.deepEqual(Object.keys(row).sort(),['activity_points','alias']);
  assert.doesNotMatch(JSON.stringify(b),/Private Fixture|private-badge|bestScore|email|photo|learner|student_id|percentage|99999|00000000-/);
  for(let grade=8;grade<=10;grade++)await assert.rejects(board(1,grade));
 });
 await t.test('all four grades have separate boards and cannot enumerate other grades',async()=>{
  for(const [n,g]of [[1,7],[4,8],[5,9],[6,10]]){
   const b=await board(n,g);assert.equal(b.grade,g);assert.equal(b.entries.length,g===7?2:1);
   for(const other of [7,8,9,10].filter(x=>x!==g))await assert.rejects(board(n,other));
  }
 });
 await t.test('legacy raw leaderboard and anonymous requests disclose no rows',async()=>{
  assert.deepEqual((await asUser(db,uid(1),()=>db.query('select * from public.leaderboard'))).rows,[]);
  assert.deepEqual((await asUser(db,null,()=>db.query('select * from public.leaderboard'),'anon')).rows,[]);
  await assert.rejects(asUser(db,null,()=>rpc('privacy_grade_board'),'anon'));
  for(const n of [7,9,11])await assert.rejects(board(n));
 });
 await t.test('completion points ignore grades, quiz scores, XP and repeat farming',async()=>{
  await db.query(`insert into lq_private.activity_completions(student_id,activity_id) values($1,'game:one:mode'),($2,'game:two:mode'),($2,'game:three:mode')`,[uid(1),uid(2)]);
  let b=await board(1);assert.equal(b.entries[0].activity_points,20);assert.equal(b.entries[1].activity_points,10);
  const old=JSON.stringify(b.entries);
  await db.query('update public.student_progress set xp=1234567');await db.query('update public.quiz_results set score=10,percentage=100');
  assert.equal(JSON.stringify((await board(1)).entries),old);
  await db.exec('set role service_role');await rpc('privacy_record_completion',{p_student:uid(1),p_activity:'game:one:mode'});await db.exec('reset role');
  assert.equal(JSON.stringify((await board(1)).entries),old);
 });
 await t.test('withdrawal removes entry from peer responses and preserves progress/history/points',async()=>{
  const before=(await db.query('select count(*) from student_progress')).rows;
  const a=await board(1);await visible(1,false);
  assert.equal((await board(2)).entries.length,1);assert.equal((await board(1)).visible,false);
  assert.deepEqual((await db.query('select count(*) from student_progress')).rows,before);
  assert.equal((await db.query<{count:number}>('select count(*) from public.leaderboard')).rows[0].count,1);
  await visible(1,true);assert.equal((await board(1)).my_alias,a.my_alias);assert.equal((await board(1)).entries.find((e:any)=>e.alias===a.my_alias).activity_points,10);
 });
 await t.test('student direct queries, record-ID tampering and exports cannot retrieve peers',async()=>{
  assert.equal((await asUser(db,uid(1),()=>db.query('select user_id,xp,badges from public.student_progress'))).rows.length,1);
  await assert.rejects(asUser(db,uid(1),()=>db.query('select record_data from public.student_progress')));
  await assert.rejects(asUser(db,uid(7),()=>db.query('select * from public.student_progress')));
  assert.deepEqual((await asUser(db,uid(1),()=>db.query('select user_id,xp,badges from public.student_progress where user_id=$1',[uid(2)]))).rows,[]);
  assert.deepEqual((await asUser(db,uid(1),()=>db.query('select user_id,score from public.quiz_results where user_id=$1',[uid(2)]))).rows,[]);
  for(const action of ['report','export'])await assert.rejects(asUser(db,uid(1),()=>privacyAction({action,studentId:uid(2)},rpc)));
  const own:any=await asUser(db,uid(1),()=>privacyAction({action:'export',studentId:uid(1)},rpc));assert.equal(own.student.id,uid(1));assert.doesNotMatch(JSON.stringify(own),/NEVER-EXPOSE|password|profile_data|Private Fixture 2/);
  await assert.rejects(asUser(db,uid(1),()=>db.query('update profiles set grade_level=8,role=\'admin\' where id=$1',[uid(1)])));
 });
 await t.test('teachers get only assigned students through direct queries, reports and exports',async()=>{
  assert.equal((await asUser(db,uid(7),()=>db.query('select user_id,xp,badges from student_progress'))).rows.length,1);
  const assigned:any=await asUser(db,uid(7),()=>privacyAction({action:'report',studentId:uid(1)},rpc));assert.equal(assigned.student.id,uid(1));
  await assert.rejects(asUser(db,uid(7),()=>privacyAction({action:'export',studentId:uid(2)},rpc)));
  await assert.rejects(asUser(db,uid(8),()=>rpc('privacy_individual_report',{p_student:uid(1)})));
  await assert.rejects(asUser(db,uid(7),()=>db.query('insert into lq_private.teacher_assignments values($1,$2)',[uid(2),uid(7)])));
 });
 await t.test('administrators default to aggregate-only; individual grants expire',async()=>{
  assert.deepEqual((await asUser(db,uid(9),()=>db.query('select user_id,xp,badges from student_progress'))).rows,[]);
  await assert.rejects(asUser(db,uid(9),()=>rpc('privacy_individual_report',{p_student:uid(1)})));
  const sums:any=await asUser(db,uid(9),()=>rpc('privacy_admin_summary'));assert.ok(sums.length>0);assert.doesNotMatch(JSON.stringify(sums),/student_id|Private Fixture|alias|score|percentage|00000000/);
  assert.equal((await asUser(db,uid(10),()=>rpc('privacy_individual_report',{p_student:uid(1)})) as any).student.id,uid(1));
  await assert.rejects(asUser(db,uid(10),()=>rpc('privacy_individual_report',{p_student:uid(2)})));
  await assert.rejects(asUser(db,uid(10),()=>db.query('insert into lq_private.individual_access_grants values($1,$2,\'Self grant\',$1,now()+interval \'1 day\')',[uid(10),uid(4)])));
 });
 await t.test('researcher gets only purpose-authorized individual records, not all grades',async()=>{
  assert.equal((await asUser(db,uid(11),()=>rpc('privacy_individual_report',{p_student:uid(2)})) as any).student.id,uid(2));
  await assert.rejects(asUser(db,uid(11),()=>rpc('privacy_individual_report',{p_student:uid(1)})));
  await assert.rejects(asUser(db,uid(11),()=>rpc('privacy_admin_summary')));
 });
 await t.test('grade/group transfer hides the entry; suspended or unapproved users cannot access',async()=>{
  await db.query('update lq_private.participating_students set grade=8 where student_id=$1',[uid(1)]);
  assert.equal((await db.query<{visible:boolean}>('select visible from lq_private.participating_students where student_id=$1',[uid(1)])).rows[0].visible,false);
  await assert.rejects(board(1));
  await db.query('update profiles set status=\'suspended\' where id=$1',[uid(2)]);await assert.rejects(board(2));
  assert.equal((await board(3)).entries.length,1);
 });
 await t.test('self quiz answers and session IDs do not leak to peers',async()=>{
  const id=uid(500);await db.query('insert into quest_sessions(id,user_id,module_id,game_mode,next_index) values($1,$2,\'one\',\'mode\',10)',[id,uid(4)]);
  await db.query('insert into quest_answers values($1,0,\'secret-answer\')',[id]);
  assert.equal((await asUser(db,uid(4),()=>db.query('select * from quest_answers'))).rows.length,1);
  assert.deepEqual((await asUser(db,uid(5),()=>db.query('select * from quest_answers where session_id=$1',[id]))).rows,[]);
  await db.query('update quest_sessions set finished_at=now() where id=$1',[id]);
  assert.equal((await board(4)).entries[0].activity_points,10);
 });
 await t.test('official grade/status changes reset visibility without deleting records',async()=>{
  await db.query('update profiles set grade_level=8 where id=$1',[uid(1)]);
  await visible(1,true);
  await db.query('update profiles set grade_level=9 where id=$1',[uid(1)]);
  assert.equal((await db.query<{visible:boolean}>('select visible from lq_private.participating_students where student_id=$1',[uid(1)])).rows[0].visible,false);
  await assert.rejects(board(1));
  assert.equal((await db.query<{count:number}>('select count(*) from public.leaderboard')).rows[0].count,1);
 });
 await db.close();
});
