import {PGlite} from '@electric-sql/pglite';
import fs from 'node:fs/promises';
export const uid=(n:number)=>`00000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
export async function database(){
 const db=new PGlite();
 await db.exec(`
  create role anon;create role authenticated;create role service_role bypassrls;
  create schema auth;
  create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
  grant usage on schema public,auth to anon,authenticated,service_role;
  grant execute on function auth.uid() to anon,authenticated,service_role;
  create table public.profiles(id uuid primary key,email text,display_name text,role text,status text default 'approved',grade_level int,school_name text,section text,lrn text,username text,class_code text,teacher_id text,created_at timestamptz default now(),profile_data jsonb default '{}');
  create table public.student_progress(id uuid default gen_random_uuid(),user_id uuid unique,xp int default 0,badges jsonb default '[]',completed_quests jsonb default '[]',progress_by_module jsonb default '{}',record_data jsonb default '{}');
  create table public.quiz_results(id uuid default gen_random_uuid(),user_id uuid,quest_id text,score int,total int,percentage int,created_at timestamptz default now(),record_data jsonb default '{}');
  create table public.leaderboard(user_id uuid,display_name text,xp int,grade_level int);
  create table public.quest_sessions(id uuid primary key default gen_random_uuid(),user_id uuid,module_id text,game_mode text,difficulty text,next_index int default 0,score int default 0,finished_at timestamptz);
  create table public.quest_answers(session_id uuid,question_index int,submitted_answer text);
  create table public.quest_powerup_uses(session_id uuid,kind text);
  create table public.quest_wallets(user_id uuid,balance int);
  create table public.quest_ledger(user_id uuid,amount int);
  create table public.quest_inventory(user_id uuid,kind text);
  create table public.quest_purchases(user_id uuid,kind text);
  grant select,insert,update,delete on all tables in schema public to authenticated;
  grant select on public.leaderboard to anon;
  alter table public.profiles enable row level security;
  create policy profile_self_read on public.profiles for select to authenticated using(id=auth.uid());
  create policy leaderboard_read on public.leaderboard for select to authenticated using(true);
  create policy legacy_anon_board on public.leaderboard for select to anon using(true);
  create policy progress_self_read on public.student_progress for select to authenticated using(user_id=auth.uid());
  create policy quiz_self_read on public.quiz_results for select to authenticated using(user_id=auth.uid());
  create policy progress_self_write on public.student_progress for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
  create policy quest_sessions_self on public.quest_sessions for select to authenticated using(user_id=auth.uid());
  create policy quest_answers_self on public.quest_answers for select to authenticated using(exists(select 1 from quest_sessions s where s.id=session_id and s.user_id=auth.uid()));
  create policy quest_powerups_self on public.quest_powerup_uses for select to authenticated using(exists(select 1 from quest_sessions s where s.id=session_id and s.user_id=auth.uid()));
 `);
 for(let n=1;n<=12;n++){
  const grade=n<=3?7:n===4?8:n===5?9:n===6?10:7;
  const role=n===7||n===8?'teacher':n===9||n===10?'admin':n===11?'teacher':'student';
  await db.query(`insert into profiles(id,email,display_name,role,grade_level,username,lrn,profile_data) values($1,$2,$3,$4,$5,$6,$7,$8)`,[uid(n),`fixture${n}@example.test`,`Private Fixture ${n}`,role,grade,`fixture${n}`,String(n).padStart(12,'9'),{password:'NEVER-EXPOSE',privateMarker:n}]);
  if(role==='student'){
   await db.query(`insert into student_progress(user_id,xp,badges,completed_quests,progress_by_module,record_data) values($1,99999,'["private-badge"]','["one"]','{"one":{"bestScorePercent":73}}','{"private":"test marker"}')`,[uid(n)]);
   await db.query(`insert into quiz_results(user_id,quest_id,score,total,percentage) values($1,'private-test',3,10,30)`,[uid(n)]);
  }
 }
 await db.query(`insert into leaderboard values($1,'Historic name',456,7)`,[uid(1)]);
 await db.exec(await fs.readFile(new URL('../../supabase/changes/privacy_grade_leaderboard.sql',import.meta.url),'utf8'));
 await db.exec(await fs.readFile(new URL('../../supabase/changes/privacy_notice_acknowledgements.sql',import.meta.url),'utf8'));
 return db;
}
export async function asUser<T>(db:PGlite,id:string|null,fn:()=>Promise<T>,role='authenticated'):Promise<T>{
 await db.exec(`set role ${role}`);await db.query(`select set_config('request.jwt.claim.sub',$1,false)`,[id||'']);
 try{return await fn();}finally{await db.exec('reset role');}
}
