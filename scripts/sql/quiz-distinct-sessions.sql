-- Existing service-role-only RPC; keep its grants and the lesson-completion trigger.
create or replace function public.quest_start(p_user uuid,p_module text,p_mode text,p_difficulty text)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_ids text[]:='{}'; v_picked text[]; v_session uuid; v_seconds integer; v_mode text; v_count integer;
begin
 if not exists(select 1 from profiles where id=p_user and role='student' and status='approved') then raise exception 'Approved student account required'; end if;
 if p_difficulty not in ('easy','moderate','hard') or p_mode not in ('all','analogyMaster','missingPiece','crosswordGame','pictureHunt','typeHunter') then raise exception 'Invalid game selection'; end if;
 for v_mode in select mode from unnest(case when p_mode='all' then array['analogyMaster','missingPiece','crosswordGame','pictureHunt','typeHunter'] else array[p_mode] end) mode order by random() loop
  v_count:=case when p_mode='all' then 2 else 10 end;
  with candidates as (
   select q.id,lower(regexp_replace(coalesce(nullif(q.payload->>'contextSentence',''),q.payload->>'prompt',q.id),'\s+',' ','g')) as clue,
    exists(select 1 from quest_sessions s where s.user_id=p_user and q.id=any(s.question_ids) and s.started_at>now()-interval '30 days') as seen,
    random() as tie
   from quest_question_bank q where q.module_id=p_module and q.difficulty=p_difficulty and q.game_mode=v_mode
    and not exists(select 1 from quest_question_bank used where used.id=any(v_ids) and coalesce(used.payload->>'assessmentKey',used.id)=coalesce(q.payload->>'assessmentKey',q.id))
  ), unique_clues as (
   select distinct on(clue) id,seen,tie from candidates order by clue,seen,tie
  ), selected as (select id from unique_clues order by seen,tie limit v_count)
  select array_agg(id order by random()) into v_picked from selected;
  if coalesce(array_length(v_picked,1),0)<>v_count then raise exception 'This module needs source review: 10 distinct verified questions are required for this game and difficulty'; end if;
  v_ids:=v_ids||v_picked;
 end loop;
 select array_agg(id order by random()) into v_ids from unnest(v_ids) id;
 if coalesce(array_length(v_ids,1),0)<>10 or (select count(distinct x) from unnest(v_ids) x)<>10 then raise exception 'This PDF game needs at least 10 verified questions'; end if;
 select coalesce((payload->>'timeLimitSeconds')::integer,60) into v_seconds from quest_question_bank where id=v_ids[1];
 insert into quest_sessions(user_id,module_id,game_mode,difficulty,question_ids,question_deadline) values(p_user,p_module,p_mode,p_difficulty,v_ids,now()+make_interval(secs=>v_seconds)) returning id into v_session;
 insert into quest_wallets(user_id) values(p_user) on conflict do nothing;
 return quest_current_question(p_user,v_session);
end $$;
