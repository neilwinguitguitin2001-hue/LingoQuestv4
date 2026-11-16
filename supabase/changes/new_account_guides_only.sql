begin;
create table if not exists lq_private.guide_rollout (
 id boolean primary key default true check(id),
 activated_at timestamptz not null default now()
);
insert into lq_private.guide_rollout(id) values(true) on conflict do nothing;
create table if not exists lq_private.guide_receipts (
 user_id uuid primary key references public.profiles(id),
 claimed_at timestamptz not null default now()
);
alter table lq_private.guide_rollout enable row level security;
alter table lq_private.guide_receipts enable row level security;
revoke all on lq_private.guide_rollout,lq_private.guide_receipts from public,anon,authenticated;
create or replace function public.claim_new_account_guide()
returns boolean language plpgsql security definer set search_path='' as $$
declare claimed uuid;
begin
 if auth.uid() is null then return false; end if;
 if not exists(
  select 1 from public.profiles p join auth.users u on u.id=p.id
  cross join lq_private.guide_rollout r
  where p.id=auth.uid() and p.status='approved'
   and p.created_at>=r.activated_at and u.created_at>=r.activated_at
   and (p.role in ('student','teacher') or
    (p.role='admin' and p.profile_data->>'adminLevel'='sub'
     and coalesce(p.profile_data->>'isMainAdmin','false')<>'true'))
 ) then return false; end if;
 insert into lq_private.guide_receipts(user_id) values(auth.uid())
 on conflict do nothing returning user_id into claimed;
 return claimed is not null;
end $$;
revoke all on function public.claim_new_account_guide() from public,anon,authenticated;
grant execute on function public.claim_new_account_guide() to authenticated;
commit;