-- Same-module choices only. Keep correct answers and all source references unchanged.
-- Do not change questions in games started in the last day that are still unfinished.
with correct_cards as materialized (
 select q.id,q.module_id,q.difficulty,option as card
 from public.quest_question_bank q
 cross join lateral jsonb_array_elements(q.payload->'pictureOptions') option
 where q.game_mode='pictureHunt' and option->>'id'=q.payload->>'answer'
), patched as (
 select q.id,jsonb_build_array(q.card)||alternatives.cards as cards
 from correct_cards q
 cross join lateral (
  select jsonb_agg(jsonb_set(candidate.card,'{id}',to_jsonb(q.id||'-alternative-'||md5(lower(candidate.card->>'label')))) order by candidate.rank) as cards
  from (
   select distinct_cards.card,md5(q.id||lower(distinct_cards.card->>'label')) as rank
   from (
    select distinct on (lower(c.card->>'label')) c.card
    from correct_cards c where c.module_id=q.module_id and c.difficulty=q.difficulty
      and lower(c.card->>'label')<>lower(q.card->>'label')
    order by lower(c.card->>'label'),c.id
   ) distinct_cards
   order by rank limit 3
  ) candidate
 ) alternatives
 where not exists(select 1 from public.quest_sessions s where s.finished_at is null and s.started_at>now()-interval '1 day' and q.id=any(s.question_ids))
)
update public.quest_question_bank q set payload=jsonb_set(q.payload,'{pictureOptions}',p.cards)
from patched p where p.id=q.id and jsonb_array_length(p.cards)=4;
