-- Applied to shared Supabase with explicit owner authorization for preview on 2026-11-09.
-- No historical record is deleted. Research intervention still requires ethics review.
begin;
create schema if not exists lq_private;
revoke all on schema lq_private from public, anon, authenticated;
grant usage on schema lq_private to authenticated, service_role;

create table if not exists lq_private.participating_students (
  student_id uuid primary key references public.profiles(id),
  group_id uuid not null,
  grade integer not null check (grade between 7 and 10),
  active boolean not null default true,
  alias text not null unique default ('Explorer-' || substr(replace(gen_random_uuid()::text,'-',''),1,10)),
  visible boolean not null default false,
  opted_at timestamptz,
  updated_at timestamptz not null default now()
);
create table if not exists lq_private.teacher_assignments (
  student_id uuid not null references public.profiles(id),
  teacher_id uuid not null references public.profiles(id),
  primary key(student_id,teacher_id)
);
create table if not exists lq_private.staff_roles (
  viewer_id uuid primary key references public.profiles(id),
  staff_role text not null check(staff_role in ('researcher'))
);
create table if not exists lq_private.individual_access_grants (
  viewer_id uuid not null references public.profiles(id),
  student_id uuid not null references public.profiles(id),
  purpose text not null check(length(trim(purpose)) > 0),
  granted_by uuid not null references public.profiles(id),
  expires_at timestamptz not null,
  primary key(viewer_id,student_id)
);
-- A completion earns 10 leaderboard points, once per activity. No score, XP or badge bonus contributes.
create table if not exists lq_private.activity_completions (
  student_id uuid not null references public.profiles(id),
  activity_id text not null check(length(activity_id) between 1 and 160),
  completed_at timestamptz not null default now(),
  primary key(student_id,activity_id)
);
create table if not exists lq_private.performance_access_log (
  id bigint generated always as identity primary key,
  viewer_id uuid not null,
  student_id uuid not null,
  accessed_at timestamptz not null default now()
);
revoke all on all tables in schema lq_private from public, anon, authenticated;
grant all on all tables in schema lq_private to service_role;
grant usage,select on all sequences in schema lq_private to service_role;
-- Defense in depth: private tables are not exposed through the Data API.
alter table lq_private.participating_students enable row level security;
alter table lq_private.teacher_assignments enable row level security;
alter table lq_private.staff_roles enable row level security;
alter table lq_private.individual_access_grants enable row level security;
alter table lq_private.activity_completions enable row level security;
alter table lq_private.performance_access_log enable row level security;

create or replace function lq_private.can_read_performance(p_student uuid)
returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.profiles v where v.id=auth.uid() and v.status='approved' and (
   v.id=p_student or
   (v.role='teacher' and exists(select 1 from lq_private.teacher_assignments a where a.student_id=p_student and a.teacher_id=v.id)) or
   ((v.role='admin' or exists(select 1 from lq_private.staff_roles r where r.viewer_id=v.id)) and exists(
     select 1 from lq_private.individual_access_grants g where g.viewer_id=v.id and g.student_id=p_student and g.expires_at>now()
   ))
 ));
$$;
revoke all on function lq_private.can_read_performance(uuid) from public, anon;
grant execute on function lq_private.can_read_performance(uuid) to authenticated,service_role;

-- Legacy leaderboard remains stored but cannot be downloaded, joined or exported by clients.
drop policy if exists privacy_legacy_board_deny on public.leaderboard;
create policy privacy_legacy_board_deny on public.leaderboard as restrictive for all to anon,authenticated using(false) with check(false);
alter table public.leaderboard enable row level security;

-- Restrictive gates also constrain any older permissive policy; ownership cannot be changed on writes.
do $$
declare tab text;
begin
 foreach tab in array array['student_progress','quiz_results','quest_sessions','quest_wallets','quest_ledger','quest_inventory','quest_purchases'] loop
  execute format('alter table public.%I enable row level security',tab);
  execute format('drop policy if exists privacy_performance_gate on public.%I',tab);
  execute format('create policy privacy_performance_gate on public.%I as restrictive for select to authenticated using(lq_private.can_read_performance(user_id))',tab);
  execute format('drop policy if exists privacy_authorized_read on public.%I',tab);
  -- Financial inventories and sessions stay owner-only; teacher/research access uses the limited report RPC.
  if tab in ('student_progress','quiz_results') then
   execute format('create policy privacy_authorized_read on public.%I for select to authenticated using(lq_private.can_read_performance(user_id))',tab);
  end if;
 end loop;
end $$;
-- JSON archives may contain legacy account fields. Never return them through client table queries.
do $$
declare tab text; cols text;
begin
 foreach tab in array array['student_progress','quiz_results'] loop
  execute format('revoke select on public.%I from public,anon,authenticated',tab);
  select string_agg(quote_ident(column_name),',') into cols from information_schema.columns
   where table_schema='public' and table_name=tab and column_name<>'record_data';
  execute format('grant select (%s) on public.%I to authenticated',cols,tab);
 end loop;
end $$;

-- Completion credit must originate from the existing server-validated game flow.
revoke insert,update,delete on public.quest_sessions,public.quest_answers from public,anon,authenticated;

-- Child records follow session ownership, never grade membership.
alter table public.quest_answers enable row level security;
alter table public.quest_powerup_uses enable row level security;
drop policy if exists privacy_answer_gate on public.quest_answers;
create policy privacy_answer_gate on public.quest_answers as restrictive for select to authenticated using(exists(select 1 from public.quest_sessions s where s.id=session_id and s.user_id=auth.uid()));
drop policy if exists privacy_powerup_gate on public.quest_powerup_uses;
create policy privacy_powerup_gate on public.quest_powerup_uses as restrictive for select to authenticated using(exists(select 1 from public.quest_sessions s where s.id=session_id and s.user_id=auth.uid()));

create or replace function public.privacy_grade_board(p_grade integer default null)
returns jsonb language plpgsql security definer set search_path='' as $$
declare me lq_private.participating_students; entries jsonb;
begin
 select m.* into me from lq_private.participating_students m join public.profiles p on p.id=m.student_id
 where m.student_id=auth.uid() and m.active and p.role='student' and p.status='approved' and p.grade_level=m.grade;
 if not found then raise exception 'Participating student access required' using errcode='42501'; end if;
 if p_grade is not null and p_grade<>me.grade then raise exception 'This grade is not available' using errcode='42501'; end if;
 select coalesce(jsonb_agg(to_jsonb(e) order by e.activity_points desc,e.alias),'[]'::jsonb) into entries from (
  select m.alias,(count(c.activity_id)*10)::integer as activity_points
  from lq_private.participating_students m join public.profiles p on p.id=m.student_id
  left join lq_private.activity_completions c on c.student_id=m.student_id
  where m.group_id=me.group_id and m.grade=me.grade and m.active and m.visible
    and p.role='student' and p.status='approved' and p.grade_level=m.grade
  group by m.alias
 ) e;
 return jsonb_build_object('grade',me.grade,'visible',me.visible,'my_alias',me.alias,'entries',entries);
end $$;

create or replace function public.privacy_set_board_visibility(p_visible boolean)
returns jsonb language plpgsql security definer set search_path='' as $$
begin
 if p_visible is null then raise exception 'Choose a visibility preference'; end if;
 -- Lock against simultaneous enrollment/visibility changes; group and alias never come from the client.
 perform 1 from lq_private.participating_students m join public.profiles p on p.id=m.student_id
 where m.student_id=auth.uid() and m.active and p.role='student' and p.status='approved' and p.grade_level=m.grade for update of m;
 if not found then raise exception 'Participating student access required' using errcode='42501'; end if;
 update lq_private.participating_students set visible=p_visible,opted_at=case when p_visible then now() else null end,updated_at=now() where student_id=auth.uid();
 return public.privacy_grade_board();
end $$;

-- Server-only activity ingestion. Caller must independently verify completion; clients cannot claim points.
create or replace function public.privacy_record_completion(p_student uuid,p_activity text)
returns void language plpgsql security definer set search_path='' as $$
begin
 if p_activity is null or length(p_activity) not between 1 and 160 then raise exception 'Invalid activity'; end if;
 insert into lq_private.activity_completions(student_id,activity_id) values(p_student,p_activity) on conflict do nothing;
end $$;

create or replace function public.privacy_individual_report(p_student uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare result jsonb;
begin
 if not lq_private.can_read_performance(p_student) then raise exception 'Record is not available' using errcode='42501'; end if;
 select jsonb_build_object(
  'student',jsonb_build_object('id',p.id,'name',p.display_name,'grade',p.grade_level,'teacher_id',case when exists(select 1 from lq_private.teacher_assignments a where a.student_id=p.id and a.teacher_id=auth.uid()) then auth.uid()::text else null end),
  'progress',coalesce((select jsonb_build_object('xp',s.xp,'badges',s.badges,'completed_quests',s.completed_quests,'progress_by_module',s.progress_by_module) from public.student_progress s where s.user_id=p.id),'{}'::jsonb),
  'quiz_results',coalesce((select jsonb_agg(jsonb_build_object('id',q.id,'quest_id',q.quest_id,'score',q.score,'total',q.total,'percentage',q.percentage,'created_at',q.created_at)) from public.quiz_results q where q.user_id=p.id),'[]'::jsonb)
 ) into result from public.profiles p where p.id=p_student and p.role='student';
 if result is null then raise exception 'Record is not available' using errcode='42501'; end if;
 insert into lq_private.performance_access_log(viewer_id,student_id) values(auth.uid(),p_student);
 return result;
end $$;

create or replace function public.privacy_admin_summary()
returns jsonb language plpgsql security definer set search_path='' as $$
begin
 if not exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin' and p.status='approved') then
  raise exception 'Administrator access required' using errcode='42501';
 end if;
 -- Aggregate-only, with small-group suppression. No identities, aliases or individual results.
 return coalesce((select jsonb_agg(to_jsonb(g)) from (
   select p.grade_level as grade,count(*) as participants,
    case when count(*)>=5 then round(avg(jsonb_array_length(coalesce(s.completed_quests,'[]'::jsonb))),1) else null end as average_completed_activities,
    count(*)<5 as detail_suppressed
   from public.profiles p left join public.student_progress s on s.user_id=p.id
   where p.role='student' and p.status='approved' group by p.grade_level
 )g),'[]'::jsonb);
end $$;

revoke all on function public.privacy_grade_board(integer),public.privacy_set_board_visibility(boolean),public.privacy_individual_report(uuid),public.privacy_admin_summary(),public.privacy_record_completion(uuid,text) from public,anon,authenticated;
grant execute on function public.privacy_grade_board(integer),public.privacy_set_board_visibility(boolean),public.privacy_individual_report(uuid),public.privacy_admin_summary() to authenticated;
grant execute on function public.privacy_record_completion(uuid,text) to service_role;

create or replace function public.privacy_bootstrap()
returns jsonb language plpgsql security definer set search_path='' as $$
declare me jsonb; students jsonb;
begin
 select jsonb_build_object('id',p.id,'email',p.email,'display_name',p.display_name,'role',p.role,'status',p.status,
  'grade_level',p.grade_level,'school_name',p.school_name,'section',p.section,'lrn',p.lrn,'username',p.username,
  'class_code',p.class_code,'teacher_id',p.teacher_id,'created_at',p.created_at)
 into me from public.profiles p where p.id=auth.uid() and p.status='approved';
 if me is null then raise exception 'Approved account required' using errcode='42501'; end if;
 select coalesce(jsonb_agg(public.privacy_individual_report(p.id)),'[]'::jsonb) into students
 from public.profiles p where p.role='student' and lq_private.can_read_performance(p.id);
 return jsonb_build_object('profile',me,'students',students);
end $$;
revoke all on function public.privacy_bootstrap() from public,anon;
grant execute on function public.privacy_bootstrap() to authenticated;

-- Only newly finished, complete game sessions receive activity completion credit. Ignore score and difficulty.
-- No backfill from XP/scores: historical academic records remain unchanged.
create or replace function lq_private.record_finished_activity()
returns trigger language plpgsql security definer set search_path='' as $$
begin
 if new.finished_at is not null and old.finished_at is null and new.next_index=10 then
  perform public.privacy_record_completion(new.user_id,'game:'||new.module_id||':'||new.game_mode);
 end if;
 return new;
end $$;
revoke all on function lq_private.record_finished_activity() from public,anon,authenticated;
drop trigger if exists privacy_activity_completed on public.quest_sessions;
create trigger privacy_activity_completed after update on public.quest_sessions for each row execute function lq_private.record_finished_activity();

-- Prevent forged teacher assignments/roles/enrollment via profile writes and JSON payloads.
-- Existing self-read is retained; staff reports are exposed only by the checked report RPC.
drop policy if exists privacy_profile_self on public.profiles;
create policy privacy_profile_self on public.profiles as restrictive for all to authenticated using(id=auth.uid()) with check(id=auth.uid());
revoke update,insert,delete on public.profiles from authenticated;
-- Membership, assignment and individual access grants require a trusted provisioning workflow.
-- Changing group/grade revokes visibility by default. Opt-out never removes points or progress.
create or replace function lq_private.hide_on_enrollment_change()
returns trigger language plpgsql set search_path='' as $$
begin
 if new.grade<>old.grade or new.group_id<>old.group_id then
  new.alias='Explorer-'||substr(replace(gen_random_uuid()::text,'-',''),1,10);
 end if;
 if new.grade<>old.grade or new.group_id<>old.group_id or not new.active then new.visible=false; new.opted_at=null; end if;
 return new;
end $$;
drop trigger if exists privacy_enrollment_change on lq_private.participating_students;
create trigger privacy_enrollment_change before update on lq_private.participating_students for each row execute function lq_private.hide_on_enrollment_change();
-- A change in the official profile also resets visibility, even before roster reconciliation.
create or replace function lq_private.hide_on_profile_change()
returns trigger language plpgsql security definer set search_path='' as $$
begin
 if new.grade_level is distinct from old.grade_level or new.status<>'approved' then
  update lq_private.participating_students set visible=false,opted_at=null,updated_at=now() where student_id=new.id;
 end if;
 return new;
end $$;
revoke all on function lq_private.hide_on_profile_change() from public,anon,authenticated;
drop trigger if exists privacy_profile_change on public.profiles;
create trigger privacy_profile_change after update of grade_level,status on public.profiles for each row execute function lq_private.hide_on_profile_change();
commit;
