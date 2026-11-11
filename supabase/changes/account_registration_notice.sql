-- A teacher-assisted enrollment does not record acceptance on behalf of a student.
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
     or jsonb_typeof(form->'termsAccepted') is distinct from 'boolean' then
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
  if form->'termsAccepted' = 'true'::jsonb then
    insert into lq_private.notice_acknowledgements(user_id,notice_version,terms_accepted_at)
    values(new.id,form->>'noticeVersion',now());
  end if;
  return new;
end $$;

