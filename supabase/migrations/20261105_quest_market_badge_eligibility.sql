-- Pay badge coins only when the badge was not already earned before this quiz.
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
revoke all on function public.quest_finish(uuid,uuid) from public,anon,authenticated;
grant execute on function public.quest_finish(uuid,uuid) to service_role;
