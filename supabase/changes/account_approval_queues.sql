begin;

-- An application and its Auth account commit together. Signup metadata supplies
-- enrollment details only. Role and approval are determined here.
create or replace function lq_private.create_registration_profile()
returns trigger language plpgsql security definer set search_path='' as $$
declare
  form jsonb := new.raw_user_meta_data->'lingoquest_registration';
  kind text := form->>'role';
  applicant_name text := btrim(coalesce(form->>'name',''));
  account_name text := lower(btrim(coalesce(form->>'username','')));
  school_name text := btrim(coalesce(form->>'schoolName',''));
  code text := upper(btrim(coalesce(form->>'classCode','')));
  student_lrn text := form->>'lrn';
  employee_id text := btrim(coalesce(form->>'employeeId',''));
  grade integer;
  teacher uuid;
begin
  if form is null then return new; end if;
  if kind is null or kind not in ('teacher','student')
     or length(applicant_name) not between 2 and 120
     or length(account_name) not between 2 and 80
     or account_name ~ '[@[:space:]]' or account_name ~ '^[0-9]{12}$'
     or length(school_name) not between 2 and 180
     or new.email is null or form->>'noticeVersion' is distinct from '2026-11-09-preview-1'
     or form->'termsAccepted' is distinct from 'true'::jsonb then
    raise exception 'Invalid registration details';
  end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('lq-username:'||account_name,0));
  if exists(select 1 from public.profiles p where lower(p.username)=account_name) then
    raise exception 'Username unavailable';
  end if;
  if kind='teacher' then
    if length(employee_id) not between 1 and 80 then raise exception 'Invalid employee ID'; end if;
    code := 'LQ-'||upper(replace(new.id::text,'-',''));
  else
    if student_lrn is null or student_lrn !~ '^[0-9]{12}$'
       or coalesce(form->>'gradeLevel','') !~ '^(7|8|9|10)$'
       or length(coalesce(form->>'section',''))>80
       or length(code) not between 4 and 40 then
      raise exception 'Invalid student details';
    end if;
    grade := (form->>'gradeLevel')::integer;
    perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('lq-lrn:'||student_lrn,0));
    if exists(select 1 from public.profiles p where p.role='student' and p.lrn=student_lrn) then
      raise exception 'Learner number unavailable';
    end if;
    select p.id into strict teacher from public.profiles p
      where p.role='teacher' and p.status='approved' and upper(p.class_code)=code
      for share;
  end if;

  insert into public.profiles(id,email,display_name,role,status,grade_level,school,school_name,
    section,lrn,learner_id,class_code,teacher_id,username,profile_data)
  values(new.id,lower(new.email),applicant_name,kind,'pending',grade,school_name,school_name,
    case when kind='student' then form->>'section' end,
    case when kind='student' then student_lrn end,case when kind='student' then student_lrn end,
    code,teacher::text,account_name,
    case when kind='teacher' then jsonb_build_object('employeeId',employee_id,'department',school_name||' - English Department')
      else '{}'::jsonb end);
  insert into lq_private.notice_acknowledgements(user_id,notice_version,terms_accepted_at)
  values(new.id,form->>'noticeVersion',now());
  return new;
end $$;

revoke all on function lq_private.create_registration_profile() from public,anon,authenticated;
create trigger lq_registration_profile after insert on auth.users
for each row execute function lq_private.create_registration_profile();

create or replace function public.registration_queue()
returns jsonb language plpgsql security definer set search_path='' as $$
declare viewer public.profiles%rowtype;
begin
  select * into viewer from public.profiles where id=auth.uid() and status='approved';
  if viewer.role is null or viewer.role not in ('admin','teacher') then
    raise exception 'Staff access required' using errcode='42501';
  end if;
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'id',p.id,'display_name',p.display_name,'email',p.email,'role',p.role,'status',p.status,
      'grade_level',p.grade_level,'school_name',p.school_name,'section',p.section,
      'lrn',p.lrn,'username',p.username,'class_code',p.class_code,'teacher_id',p.teacher_id,
      'created_at',p.created_at,'employee_id',p.profile_data->>'employeeId',
      'department',p.profile_data->>'department','review_note',p.profile_data->>'registrationReviewNote'
    ) order by p.created_at desc)
    from public.profiles p
    where (viewer.role='admin' and p.role='teacher')
       or (viewer.role='teacher' and p.role='student' and p.teacher_id=viewer.id::text
         and (p.status in ('pending','rejected') or exists (
           select 1 from lq_private.teacher_assignments a where a.student_id=p.id and a.teacher_id=viewer.id
         )))
  ),'[]'::jsonb);
end $$;

create or replace function public.review_registration(
  p_id uuid, p_decision text, p_class_code text default null,
  p_edits jsonb default '{}'::jsonb, p_note text default null
) returns void language plpgsql security definer set search_path='' as $$
declare
  viewer public.profiles%rowtype;
  applicant public.profiles%rowtype;
  code text;
  next_status text;
  next_lrn text;
  next_grade text;
  next_name text;
  next_school text;
  next_section text;
begin
  select * into viewer from public.profiles where id=auth.uid() and status='approved' for share;
  if viewer.role is null or viewer.role not in ('teacher','admin') then
    raise exception 'Staff access required' using errcode='42501';
  end if;
  if p_decision is null or p_decision not in ('approve','reject') or length(coalesce(p_note,''))>500 then
    raise exception 'Invalid review details';
  end if;
  select * into applicant from public.profiles where id=p_id for update;
  if applicant.id is null or applicant.status<>'pending'
     or not ((viewer.role='admin' and applicant.role='teacher')
       or (viewer.role='teacher' and applicant.role='student' and applicant.teacher_id is not distinct from viewer.id::text)) then
    raise exception 'This application is unavailable for review' using errcode='42501';
  end if;

  next_status := case when p_decision='approve' then 'approved' else 'rejected' end;
  if applicant.role='teacher' and next_status='approved' then
    code := upper(btrim(coalesce(nullif(p_class_code,''),applicant.class_code,'')));
    if code !~ '^[A-Z0-9-]{4,40}$' then raise exception 'Invalid class code'; end if;
    perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('lq-code:'||code,0));
    if exists(select 1 from public.profiles p where p.role='teacher' and p.id<>p_id and upper(p.class_code)=code) then
      raise exception 'Class code unavailable';
    end if;
    applicant.class_code := code;
  elsif applicant.role='student' and next_status='approved' then
    next_lrn := btrim(coalesce(p_edits->>'lrn',applicant.lrn,''));
    next_grade := coalesce(p_edits->>'gradeLevel',applicant.grade_level::text,'');
    next_name := btrim(coalesce(p_edits->>'name',applicant.display_name,''));
    next_school := btrim(coalesce(p_edits->>'schoolName',applicant.school_name,''));
    next_section := btrim(coalesce(p_edits->>'section',applicant.section,''));
    if next_lrn !~ '^[0-9]{12}$' or next_grade !~ '^(7|8|9|10)$'
       or length(next_name) not between 2 and 120 or length(next_school) not between 2 and 180
       or length(next_section)>80 then raise exception 'Invalid student details'; end if;
    perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('lq-lrn:'||next_lrn,0));
    if exists(select 1 from public.profiles p where p.role='student' and p.id<>p_id and p.lrn=next_lrn) then
      raise exception 'Learner number unavailable';
    end if;
    applicant.lrn := next_lrn;
    applicant.grade_level := next_grade::integer;
    applicant.display_name := next_name;
    applicant.school_name := next_school;
    applicant.section := next_section;
    insert into lq_private.teacher_assignments(student_id,teacher_id)
    values(p_id,viewer.id) on conflict do nothing;
  end if;
  update public.profiles set status=next_status, class_code=applicant.class_code,
    display_name=applicant.display_name, school=applicant.school_name, school_name=applicant.school_name,
    lrn=applicant.lrn, learner_id=applicant.lrn, grade_level=applicant.grade_level, section=applicant.section,
    updated_at=now(), profile_data=profile_data||jsonb_build_object(
      'registrationReviewNote',p_note,'registrationReviewedBy',viewer.id,'registrationReviewedAt',now())
  where id=p_id;
end $$;

revoke all on function public.registration_queue(),public.review_registration(uuid,text,text,jsonb,text) from public,anon,authenticated;
grant execute on function public.registration_queue(),public.review_registration(uuid,text,text,jsonb,text) to authenticated;
commit;
