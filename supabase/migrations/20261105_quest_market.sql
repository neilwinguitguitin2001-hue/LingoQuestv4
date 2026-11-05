-- Quest Market inventory is separate from permanent XP and from the coin ledger.
create table if not exists public.quest_inventory (
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('smart_hint','time_freeze','fifty_fifty','extra_time','second_chance','lesson_peek')),
  quantity integer not null default 0 check (quantity >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id,kind)
);
create table if not exists public.quest_purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('smart_hint','time_freeze','fifty_fifty','extra_time','second_chance','lesson_peek')),
  cost integer not null check (cost > 0),
  purchased_at timestamptz not null default now()
);
create index if not exists quest_purchases_user_recent on public.quest_purchases(user_id,purchased_at desc);
alter table public.quest_inventory enable row level security;
alter table public.quest_purchases enable row level security;
create policy quest_inventory_read on public.quest_inventory for select to authenticated using (user_id=(select auth.uid()));
create policy quest_purchases_read on public.quest_purchases for select to authenticated using (user_id=(select auth.uid()));
grant select on public.quest_inventory,public.quest_purchases to authenticated;

create or replace function public.quest_buy(p_user uuid,p_kind text)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_cost integer; v_balance integer; v_purchase uuid; v_quantity integer;
begin
  if not exists(select 1 from profiles where id=p_user and role='student' and status='approved') then raise exception 'Approved student account required'; end if;
  v_cost:=case p_kind when 'smart_hint' then 30 when 'time_freeze' then 50 when 'fifty_fifty' then 60 when 'extra_time' then 40 when 'second_chance' then 80 when 'lesson_peek' then 20 else null end;
  if v_cost is null then raise exception 'Unknown power-up'; end if;
  insert into quest_wallets(user_id) values(p_user) on conflict do nothing;
  select balance into v_balance from quest_wallets where user_id=p_user for update;
  if v_balance<v_cost then raise exception 'Insufficient Quest Coins'; end if;
  update quest_wallets set balance=balance-v_cost,updated_at=now() where user_id=p_user returning balance into v_balance;
  insert into quest_inventory(user_id,kind,quantity) values(p_user,p_kind,1)
    on conflict(user_id,kind) do update set quantity=quest_inventory.quantity+1,updated_at=now()
    returning quantity into v_quantity;
  insert into quest_purchases(user_id,kind,cost) values(p_user,p_kind,v_cost) returning id into v_purchase;
  insert into quest_ledger(user_id,event_key,amount,balance_after)
    values(p_user,'market:'||v_purchase||':'||p_kind,-v_cost,v_balance);
  return jsonb_build_object('balance',v_balance,'kind',p_kind,'quantity',v_quantity,'purchaseId',v_purchase);
end $$;

create or replace function public.quest_activate(p_user uuid,p_session uuid,p_kind text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_session quest_sessions%rowtype; v_question jsonb; v_cost integer; v_balance integer; v_data jsonb:='{}'::jsonb; v_id text; v_answer text; v_hint_answer text; v_reminder text; v_reminder_page text; v_time integer;
begin
  v_cost:=case p_kind when 'smart_hint' then 30 when 'time_freeze' then 50 when 'fifty_fifty' then 60 when 'extra_time' then 40 when 'second_chance' then 80 when 'lesson_peek' then 20 else null end;
  if v_cost is null then raise exception 'Unknown power-up'; end if;
  select * into v_session from quest_sessions where id=p_session and user_id=p_user for update;
  if not found or v_session.finished_at is not null then raise exception 'Session unavailable'; end if;
  if exists(select 1 from quest_powerup_uses where session_id=p_session and kind=p_kind) then raise exception 'Power-up already used in this game'; end if;
  if p_kind='second_chance' then
    if v_session.next_index<1 or not exists(select 1 from quest_answers where session_id=p_session and question_index=v_session.next_index-1 and not correct) then raise exception 'No incorrect answer to retry'; end if;
    v_id:=v_session.question_ids[v_session.next_index];
  else
    if v_session.next_index>=10 then raise exception 'Game already answered'; end if;
    v_id:=v_session.question_ids[v_session.next_index+1];
  end if;
  select payload into v_question from quest_question_bank where id=v_id;
  v_answer:=v_question->>'answer';
  v_hint_answer:=v_answer;
  if v_question->>'type'='pictureHunt' then
    select option->>'label' into v_hint_answer from jsonb_array_elements(v_question->'pictureOptions') option where option->>'id'=v_answer;
  end if;
  if p_kind='fifty_fifty' and jsonb_array_length(coalesce(v_question->'options',v_question->'pictureOptions','[]'::jsonb))<4 then raise exception '50/50 needs four choices'; end if;
  update quest_inventory set quantity=quantity-1
    where user_id=p_user and kind=p_kind and quantity>0;
  if not found then raise exception 'No purchased power-up in inventory'; end if;
  insert into quest_powerup_uses(session_id,kind,question_index,cost)
    values(p_session,p_kind,case when p_kind='second_chance' then v_session.next_index-1 else v_session.next_index end,v_cost);
  select coalesce(balance,0) into v_balance from quest_wallets where user_id=p_user;
  if p_kind='smart_hint' then
    v_data:=jsonb_build_object('hint','The source expression begins with “'||left(coalesce(v_hint_answer,''),1)||'” and appears on PDF page '||(v_question->'source'->>'page')||'.');
  end if;
  if p_kind='lesson_peek' then
    select q.payload->'source'->>'quote',q.payload->'source'->>'page' into v_reminder,v_reminder_page
      from quest_question_bank q where q.module_id=v_session.module_id
      and q.payload->'source'->>'quote'<>v_question->'source'->>'quote'
      and position(lower(coalesce(v_hint_answer,'')) in lower(q.payload->'source'->>'quote'))=0
      order by random() limit 1;
    v_data:=jsonb_build_object('reminder',coalesce('PDF p. '||v_reminder_page||': '||v_reminder,v_question->>'contextSentence'));
  end if;
  if p_kind='fifty_fifty' then
    if v_question ? 'pictureOptions' then
      select jsonb_build_object('remove',coalesce(jsonb_agg(value->>'id'),'[]'::jsonb)) into v_data from (
        select value from jsonb_array_elements(v_question->'pictureOptions') value where value->>'id'<>v_answer order by random() limit 2
      ) x;
    else
      select jsonb_build_object('remove',coalesce(jsonb_agg(value),'[]'::jsonb)) into v_data from (
        select value from jsonb_array_elements(v_question->'options') value where value#>>'{}'<>v_answer order by random() limit 2
      ) x;
    end if;
  end if;
  if p_kind in ('time_freeze','extra_time') then
    v_time:=case when p_kind='time_freeze' then 10 else 15 end;
    update quest_sessions set question_deadline=question_deadline+make_interval(secs=>v_time) where id=p_session;
    v_data:=jsonb_build_object('seconds',v_time);
  end if;
  if p_kind='second_chance' then
    delete from quest_answers where session_id=p_session and question_index=v_session.next_index-1;
    update quest_sessions set next_index=next_index-1,question_deadline=now()+make_interval(secs=>coalesce((v_question->>'timeLimitSeconds')::integer,60)) where id=p_session;
    v_data:=jsonb_build_object('retry',true);
  end if;
  return v_data||jsonb_build_object('balance',v_balance);
end $$;

revoke all on function public.quest_buy(uuid,text),public.quest_activate(uuid,uuid,text) from public,anon,authenticated;
grant execute on function public.quest_buy(uuid,text),public.quest_activate(uuid,uuid,text) to service_role;

create or replace function public.quest_finish(p_user uuid,p_session uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_session quest_sessions%rowtype; v_balance integer;
begin
  select * into v_session from quest_sessions where id=p_session and user_id=p_user for update;
  if not found or v_session.next_index<>10 then raise exception 'Ten answers required'; end if;
  if v_session.finished_at is null then
    update quest_sessions set finished_at=now() where id=p_session;
    v_balance:=quest_credit(p_user,'game:'||v_session.module_id||':'||v_session.game_mode||':'||v_session.difficulty,15);
    if v_session.score=10 then v_balance:=quest_credit(p_user,'perfect:'||v_session.module_id||':'||v_session.game_mode||':'||v_session.difficulty,25); end if;
    v_balance:=quest_credit(p_user,'daily:'||to_char(now() at time zone 'Asia/Manila','YYYY-MM-DD'),20);
    if v_session.score>=8 then
      v_balance:=quest_credit(p_user,'module:'||v_session.module_id,50);
      -- The existing UI unlocks these two badges on a first passing quiz.
      -- Their coins are awarded once, from a verified server-graded result.
      if not exists(select 1 from student_progress where user_id=p_user and badges ? 'first_quiz_pass') then
        v_balance:=quest_credit(p_user,'badge:first_quiz_pass',10);
      end if;
      if not exists(select 1 from student_progress where user_id=p_user and badges ? 'bridge_builder_1') then
        v_balance:=quest_credit(p_user,'badge:bridge_builder_1',10);
      end if;
    end if;
  end if;
  select balance into v_balance from quest_wallets where user_id=p_user;
  return jsonb_build_object('score',v_session.score,'total',10,'balance',v_balance);
end $$;

