-- Additive reporting endpoint: no changes to existing access rules or records.
create or replace function public.privacy_monthly_report(p_period text,p_kind text,p_grade integer default null,p_section text default null)
returns jsonb language plpgsql security definer set search_path='' as $$
declare viewer public.profiles; start_at timestamptz; end_at timestamptz; result jsonb; rows_data jsonb; total_rows integer; main_staff boolean;
begin
 select * into viewer from public.profiles where id=auth.uid() and status='approved';
 if viewer.id is null or viewer.role not in ('teacher','admin') then raise exception 'Staff report access required' using errcode='42501'; end if;
 if p_period is null or p_kind is null or p_period !~ '^(20[0-9]{2}|2100)-(0[1-9]|1[0-2])$' or p_kind not in ('games','activities') or (p_grade is not null and p_grade not between 7 and 10) or length(coalesce(p_section,''))>100 then raise exception 'Invalid report filters'; end if;
 start_at:=(p_period||'-01')::timestamp at time zone 'Asia/Manila';
 end_at:=((p_period||'-01')::date+interval '1 month')::timestamp at time zone 'Asia/Manila';
 if viewer.role='admin' then
  -- Institution-scoped summaries. Principals/sub-admins cannot request other schools.
  select exists(select 1 from lq_private.staff_roles r where r.viewer_id=viewer.id and r.staff_role in ('division_admin','main_admin','coordinator')) into main_staff;
  with scope as (
   select p.id,p.grade_level from public.profiles p where p.role='student' and p.status='approved' and p.created_at<end_at
    and (p_grade is null or p.grade_level=p_grade) and (p_section is null or p.section=p_section)
    and (main_staff or (nullif(viewer.school_name,'') is not null and p.school_name=viewer.school_name))
  ), counts as (
   select s.grade_level grade,count(*) participants,
    sum(case when p_kind='games' then (select count(*) from public.quest_sessions q where q.user_id=s.id and q.finished_at>=start_at and q.finished_at<end_at and q.next_index=10)
      else (select count(*) from lq_private.activity_completions a where a.student_id=s.id and a.completed_at>=start_at and a.completed_at<end_at) end) records
   from scope s group by s.grade_level
  ) select coalesce(jsonb_agg(jsonb_build_object('grade',grade,'participants',participants,'records',case when participants>=5 then records else null end,'note',case when participants<5 then 'Withheld: fewer than 5 learners' else '' end) order by grade),'[]'::jsonb) into rows_data from counts;
  result:=jsonb_build_object('scope','aggregate','columns',jsonb_build_array(jsonb_build_object('key','grade','label','Grade'),jsonb_build_object('key','participants','label','Learners in scope'),jsonb_build_object('key','records','label','Monthly completed records'),jsonb_build_object('key','note','label','Privacy note')),'rows',rows_data,'total',jsonb_array_length(rows_data),'limited',false);
 else
  with scope as (
   select p.id,p.display_name,p.grade_level,p.section,p.school_name from public.profiles p
   where p.role='student' and p.status='approved' and lq_private.can_read_performance(p.id)
    and exists(select 1 from lq_private.teacher_assignments a where a.teacher_id=viewer.id and a.student_id=p.id)
    and (p_grade is null or p.grade_level=p_grade) and (p_section is null or p.section=p_section)
  ), records as (
   select s.display_name student,s.grade_level grade,s.section,s.school_name school,q.module_id module,q.game_mode activity,q.difficulty,
    q.finished_at occurred_at,q.score correct_answers,10 questions
   from scope s join public.quest_sessions q on q.user_id=s.id
   where p_kind='games' and q.finished_at>=start_at and q.finished_at<end_at and q.next_index=10
   union all
   select s.display_name,s.grade_level,s.section,s.school_name,split_part(a.activity_id,':',2),a.activity_id,null,a.completed_at,null,null
   from scope s join lq_private.activity_completions a on a.student_id=s.id
   where p_kind='activities' and a.completed_at>=start_at and a.completed_at<end_at
  ), bounded as (select * from records order by occurred_at,student limit 1000)
  select coalesce((select jsonb_agg(to_jsonb(b) order by b.occurred_at,b.student) from bounded b),'[]'::jsonb),(select count(*) from records) into rows_data,total_rows;
  result:=jsonb_build_object('scope','assigned-students','columns',jsonb_build_array(
   jsonb_build_object('key','student','label','Student'),jsonb_build_object('key','grade','label','Grade'),jsonb_build_object('key','section','label','Section'),jsonb_build_object('key','school','label','School'),jsonb_build_object('key','module','label','Module'),jsonb_build_object('key','activity','label','Activity / mode'),jsonb_build_object('key','difficulty','label','Difficulty'),jsonb_build_object('key','occurred_at','label','Completed (Philippine time)')) || case when p_kind='games' then jsonb_build_array(jsonb_build_object('key','correct_answers','label','Correct answers'),jsonb_build_object('key','questions','label','Questions')) else '[]'::jsonb end,
   'rows',rows_data,'total',total_rows,'limited',total_rows>1000);
 end if;
 return result||jsonb_build_object('period',p_period,'kind',p_kind,'generated_at',now(),'timezone','Asia/Manila','grade',p_grade,'section',p_section,'notes',jsonb_build_array(
  'Monthly activity, not lifetime progress or a historical roster snapshot. Current permissions and assignments apply.',
  case when p_kind='games' then 'Completed server-graded 10-question games only; unfinished games and legacy quiz-result records are excluded to avoid double counting.' else 'Dated activity-completion events only. Undated legacy progress, badge totals and writing drafts are not assigned to a month.' end,
  'Dates use Philippine time. The start of the next month is excluded.'));
end $$;
revoke all on function public.privacy_monthly_report(text,text,integer,text) from public,anon;
grant execute on function public.privacy_monthly_report(text,text,integer,text) to authenticated;
