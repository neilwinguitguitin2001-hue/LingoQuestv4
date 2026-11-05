-- Called only by the authenticated Edge Function with its service-role client.
create or replace function public.quest_credit(p_user uuid, p_key text, p_amount integer)
returns integer language plpgsql security definer set search_path = public as $$
declare v_balance integer; v_inserted integer;
begin
  if p_amount <= 0 then raise exception 'Invalid reward'; end if;
  insert into quest_wallets(user_id) values(p_user) on conflict do nothing;
  select balance into v_balance from quest_wallets where user_id=p_user for update;
  insert into quest_ledger(user_id,event_key,amount,balance_after)
  values(p_user,p_key,p_amount,v_balance+p_amount) on conflict (user_id,event_key) do nothing;
  get diagnostics v_inserted = row_count;
  if v_inserted = 1 then
    update quest_wallets set balance=balance+p_amount,updated_at=now() where user_id=p_user returning balance into v_balance;
  end if;
  return v_balance;
end $$;

create or replace function public.quest_public_question(p_id text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_payload jsonb; v_grid jsonb; v_options jsonb; v_pictures jsonb;
begin
  select payload into v_payload from quest_question_bank where id=p_id;
  if v_payload is null then raise exception 'Question unavailable'; end if;
  select coalesce(jsonb_agg(case when item->>'letter'=' ' then item else jsonb_set(jsonb_set(item,'{letter}','""'::jsonb),'{isGiven}','false'::jsonb) end order by ord),'[]'::jsonb)
    into v_grid from jsonb_array_elements(coalesce(v_payload->'crosswordClue'->'letterGrid','[]'::jsonb)) with ordinality as x(item,ord);
  select coalesce(jsonb_agg(value order by random()),'[]'::jsonb) into v_options
    from jsonb_array_elements(coalesce(v_payload->'options','[]'::jsonb));
  select coalesce(jsonb_agg(value order by random()),'[]'::jsonb) into v_pictures
    from jsonb_array_elements(coalesce(v_payload->'pictureOptions','[]'::jsonb));
  v_payload := v_payload - 'explanation' - 'hint' - 'source' - 'answer';
  v_payload := v_payload || jsonb_build_object('answer',regexp_replace(coalesce((select payload->>'answer' from quest_question_bank where id=p_id),''),'[[:alnum:]]','•','g'));
  if v_payload ? 'options' then v_payload := jsonb_set(v_payload,'{options}',v_options); end if;
  if v_payload ? 'pictureOptions' then v_payload := jsonb_set(v_payload,'{pictureOptions}',v_pictures); end if;
  if v_payload ? 'crosswordClue' then v_payload := jsonb_set(v_payload,'{crosswordClue,letterGrid}',v_grid); end if;
  return v_payload;
end $$;

create or replace function public.quest_current_question(p_user uuid,p_session uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_session quest_sessions%rowtype;
begin
  select * into v_session from quest_sessions where id=p_session and user_id=p_user;
  if not found or v_session.finished_at is not null then raise exception 'Session unavailable'; end if;
  if v_session.next_index >= 10 then return jsonb_build_object('complete',true); end if;
  return jsonb_build_object('sessionId',p_session,'index',v_session.next_index,'question',quest_public_question(v_session.question_ids[v_session.next_index+1]),'deadline',v_session.question_deadline);
end $$;

create or replace function public.quest_start(p_user uuid,p_module text,p_mode text,p_difficulty text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_ids text[]; v_session uuid; v_seconds integer;
begin
  if not exists(select 1 from profiles where id=p_user and role='student' and status='approved') then raise exception 'Approved student account required'; end if;
  if p_difficulty not in ('easy','moderate','hard') or p_mode not in ('all','analogyMaster','missingPiece','crosswordGame','pictureHunt','typeHunter') then raise exception 'Invalid game selection'; end if;
  if p_mode='all' then
    with ranked as (
      select q.id,q.game_mode,row_number() over(partition by q.game_mode order by
        exists(select 1 from quest_sessions s where s.user_id=p_user and q.id=any(s.question_ids) and s.started_at>now()-interval '30 days'),random()) as rn
      from quest_question_bank q where q.module_id=p_module and q.difficulty=p_difficulty
    ) select array_agg(id order by random()) into v_ids from ranked where rn<=2;
  else
    select array_agg(id order by random()) into v_ids from (
      select q.id from quest_question_bank q where q.module_id=p_module and q.game_mode=p_mode and q.difficulty=p_difficulty
      order by exists(select 1 from quest_sessions s where s.user_id=p_user and q.id=any(s.question_ids) and s.started_at>now()-interval '30 days'),random() limit 10
    ) picked;
  end if;
  if coalesce(array_length(v_ids,1),0)<>10 or (select count(distinct x) from unnest(v_ids) x)<>10 then raise exception 'This PDF game needs at least 10 verified questions'; end if;
  select coalesce((payload->>'timeLimitSeconds')::integer,60) into v_seconds from quest_question_bank where id=v_ids[1];
  insert into quest_sessions(user_id,module_id,game_mode,difficulty,question_ids,question_deadline)
    values(p_user,p_module,p_mode,p_difficulty,v_ids,now()+make_interval(secs=>v_seconds)) returning id into v_session;
  insert into quest_wallets(user_id) values(p_user) on conflict do nothing;
  return quest_current_question(p_user,v_session);
end $$;

create or replace function public.quest_submit(p_user uuid,p_session uuid,p_answer text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_session quest_sessions%rowtype; v_question jsonb; v_id text; v_correct boolean; v_expired boolean; v_answer text; v_seconds integer; v_balance integer;
begin
  select * into v_session from quest_sessions where id=p_session and user_id=p_user for update;
  if not found or v_session.finished_at is not null or v_session.next_index>=10 then raise exception 'Session unavailable'; end if;
  v_id:=v_session.question_ids[v_session.next_index+1];
  select payload into v_question from quest_question_bank where id=v_id;
  v_answer:=coalesce(v_question->>'answer','');
  v_expired:=now()>v_session.question_deadline;
  v_correct:=not v_expired and nullif(btrim(p_answer),'') is not null and
    (case when v_question->>'type'='crosswordGame'
      then regexp_replace(lower(p_answer),'[[:space:]''’\-]','','g')=regexp_replace(lower(v_answer),'[[:space:]''’\-]','','g')
      else lower(regexp_replace(btrim(p_answer),'\s+',' ','g'))=lower(regexp_replace(btrim(v_answer),'\s+',' ','g')) end);
  insert into quest_answers(session_id,question_index,question_id,submitted_answer,correct)
    values(p_session,v_session.next_index,v_id,left(p_answer,500),v_correct);
  if v_correct then v_balance:=quest_credit(p_user,'correct:'||v_id,5); end if;
  if v_session.next_index<9 then
    select coalesce((payload->>'timeLimitSeconds')::integer,60) into v_seconds from quest_question_bank where id=v_session.question_ids[v_session.next_index+2];
  end if;
  update quest_sessions set next_index=next_index+1,score=score+case when v_correct then 1 else 0 end,
    question_deadline=case when v_session.next_index<9 then now()+make_interval(secs=>v_seconds) else null end where id=p_session;
  return jsonb_build_object('correct',v_correct,'expired',v_expired,'answer',v_answer,'explanation',v_question->>'explanation','sourcePage',v_question->'source'->>'page','balance',v_balance);
end $$;

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
    if v_session.score>=8 then v_balance:=quest_credit(p_user,'module:'||v_session.module_id,50); end if;
  end if;
  select balance into v_balance from quest_wallets where user_id=p_user;
  return jsonb_build_object('score',v_session.score,'total',10,'balance',v_balance);
end $$;

create or replace function public.quest_purchase(p_user uuid,p_session uuid,p_kind text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_session quest_sessions%rowtype; v_question jsonb; v_cost integer; v_balance integer; v_data jsonb:='{}'::jsonb; v_id text; v_answer text; v_hint_answer text; v_time integer;
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
  if p_kind='fifty_fifty' and jsonb_array_length(coalesce(v_question->'options',v_question->'pictureOptions','[]'::jsonb))<4 then raise exception '50/50 needs four choices'; end if;
  insert into quest_wallets(user_id) values(p_user) on conflict do nothing;
  select balance into v_balance from quest_wallets where user_id=p_user for update;
  if v_balance<v_cost then raise exception 'Insufficient Quest Coins'; end if;
  insert into quest_powerup_uses(session_id,kind,question_index,cost) values(p_session,p_kind,case when p_kind='second_chance' then v_session.next_index-1 else v_session.next_index end,v_cost);
  update quest_wallets set balance=balance-v_cost,updated_at=now() where user_id=p_user returning balance into v_balance;
  insert into quest_ledger(user_id,event_key,amount,balance_after) values(p_user,'purchase:'||p_session||':'||p_kind,-v_cost,v_balance);
  if p_kind='smart_hint' then
    v_hint_answer:=v_answer;
    if v_question->>'type'='pictureHunt' then
      select option->>'label' into v_hint_answer from jsonb_array_elements(v_question->'pictureOptions') option where option->>'id'=v_answer;
    end if;
    v_data:=jsonb_build_object('hint','The source expression begins with “'||left(coalesce(v_hint_answer,''),1)||'” and appears on PDF page '||(v_question->'source'->>'page')||'.');
  end if;
  if p_kind='lesson_peek' then v_data:=jsonb_build_object('reminder',v_question->>'contextSentence'); end if;
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

revoke all on function public.quest_credit(uuid,text,integer),public.quest_public_question(text),public.quest_current_question(uuid,uuid),public.quest_start(uuid,text,text,text),public.quest_submit(uuid,uuid,text),public.quest_finish(uuid,uuid),public.quest_purchase(uuid,uuid,text) from public,anon,authenticated;
grant execute on function public.quest_credit(uuid,text,integer),public.quest_public_question(text),public.quest_current_question(uuid,uuid),public.quest_start(uuid,text,text,text),public.quest_submit(uuid,uuid,text),public.quest_finish(uuid,uuid),public.quest_purchase(uuid,uuid,text) to service_role;
