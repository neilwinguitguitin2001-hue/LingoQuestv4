-- Preview notice receipt history. Not research consent or optional-feature permission.
begin;
create table if not exists lq_private.notice_acknowledgements (
 user_id uuid not null references public.profiles(id),
 notice_version text not null,
 acknowledged_at timestamptz not null default now(),
 terms_accepted_at timestamptz,
 primary key(user_id,notice_version)
);
alter table lq_private.notice_acknowledgements enable row level security;
revoke all on lq_private.notice_acknowledgements from public,anon,authenticated;
grant all on lq_private.notice_acknowledgements to service_role;
create or replace function public.privacy_notice_status()
returns jsonb language plpgsql security definer set search_path='' as $$
begin
 if not exists(select 1 from public.profiles where id=auth.uid() and status='approved') then raise exception 'Approved account required' using errcode='42501'; end if;
 return jsonb_build_object('acknowledged',exists(select 1 from lq_private.notice_acknowledgements where user_id=auth.uid() and notice_version='2026-11-09-preview-1'));
end $$;
create or replace function public.privacy_acknowledge_notice(p_version text,p_terms boolean default false)
returns jsonb language plpgsql security definer set search_path='' as $$
begin
 if not exists(select 1 from public.profiles where id=auth.uid() and status='approved') then raise exception 'Approved account required' using errcode='42501'; end if;
 if p_version is distinct from '2026-11-09-preview-1' or p_terms is null then raise exception 'Invalid notice version'; end if;
 insert into lq_private.notice_acknowledgements(user_id,notice_version,terms_accepted_at)
 values(auth.uid(),p_version,case when p_terms then now() else null end)
 on conflict(user_id,notice_version) do update set terms_accepted_at=coalesce(lq_private.notice_acknowledgements.terms_accepted_at,excluded.terms_accepted_at);
 return jsonb_build_object('acknowledged',true);
end $$;
revoke all on function public.privacy_notice_status(),public.privacy_acknowledge_notice(text,boolean) from public,anon,authenticated;
grant execute on function public.privacy_notice_status(),public.privacy_acknowledge_notice(text,boolean) to authenticated;
commit;
