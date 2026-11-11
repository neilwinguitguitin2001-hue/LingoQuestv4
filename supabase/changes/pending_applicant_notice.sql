-- Let confirmed applicants read and save their own privacy notice receipt while awaiting review.
create or replace function public.privacy_notice_status()
returns jsonb language plpgsql security definer set search_path='' as $$
begin
 if not exists (
   select 1 from public.profiles p
   where p.id=auth.uid() and (
     p.status='approved' or (
       p.status='pending' and p.role in ('teacher','student')
       and exists(select 1 from auth.users u where u.id=p.id and u.email_confirmed_at is not null)
     )
   )
 ) then
   raise exception 'Confirmed applicant or approved account required' using errcode='42501';
 end if;
 return jsonb_build_object('acknowledged',exists(select 1 from lq_private.notice_acknowledgements where user_id=auth.uid() and notice_version='2026-11-09-preview-1'));
end $$;
create or replace function public.privacy_acknowledge_notice(p_version text,p_terms boolean default false)
returns jsonb language plpgsql security definer set search_path='' as $$
begin
 if not exists (
   select 1 from public.profiles p
   where p.id=auth.uid() and (
     p.status='approved' or (
       p.status='pending' and p.role in ('teacher','student')
       and exists(select 1 from auth.users u where u.id=p.id and u.email_confirmed_at is not null)
     )
   )
 ) then
   raise exception 'Confirmed applicant or approved account required' using errcode='42501';
 end if;
 if p_version is distinct from '2026-11-09-preview-1' or p_terms is null then raise exception 'Invalid notice version'; end if;
 insert into lq_private.notice_acknowledgements(user_id,notice_version,terms_accepted_at)
 values(auth.uid(),p_version,case when p_terms then now() else null end)
 on conflict(user_id,notice_version) do update set terms_accepted_at=coalesce(lq_private.notice_acknowledgements.terms_accepted_at,excluded.terms_accepted_at);
 return jsonb_build_object('acknowledged',true);
end $$;
