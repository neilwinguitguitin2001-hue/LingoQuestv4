-- Compatible with the existing production flow, which saves completion before starting.
-- Enforce the same prerequisite for every game mode, including direct API calls.
create or replace function public.quest_require_lesson_completion()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  if not exists (
    select 1 from public.student_progress p where p.user_id = new.user_id
      and (p.progress_by_module -> new.module_id ->> 'lessonCompleted' = 'true'
        or p.progress_by_module -> new.module_id ->> 'isBridgeRestored' = 'true'
        or coalesce(p.completed_quests, '[]'::jsonb) ? new.module_id)
  ) then
    raise exception 'Finish the lesson and mark it as complete before starting its quiz.' using errcode = 'P0001';
  end if;
  return new;
end;
$$;
revoke all on function public.quest_require_lesson_completion() from public, anon, authenticated;
drop trigger if exists quest_lesson_before_quiz on public.quest_sessions;
create trigger quest_lesson_before_quiz before insert on public.quest_sessions
for each row execute function public.quest_require_lesson_completion();
