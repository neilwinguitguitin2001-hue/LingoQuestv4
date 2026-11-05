-- Quest Coins are separate from the legacy XP-derived student_progress.coins.
-- Clients may read their own wallet and sessions but cannot write rewards.
create table if not exists public.quest_wallets (
  user_id uuid primary key references auth.users(id) on delete cascade,
  balance integer not null default 0 check (balance >= 0),
  updated_at timestamptz not null default now()
);
create table if not exists public.quest_ledger (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  event_key text not null,
  amount integer not null check (amount <> 0),
  balance_after integer not null check (balance_after >= 0),
  created_at timestamptz not null default now(),
  unique (user_id, event_key)
);
create table if not exists public.quest_question_bank (
  id text primary key,
  module_id text not null,
  game_mode text not null check (game_mode in ('analogyMaster','missingPiece','crosswordGame','pictureHunt','typeHunter')),
  difficulty text not null check (difficulty in ('easy','moderate','hard')),
  pdf_file_id text not null,
  pdf_sha256 text not null,
  pdf_page integer not null check (pdf_page > 0),
  payload jsonb not null,
  created_at timestamptz not null default now()
);
create index if not exists quest_question_bank_pool on public.quest_question_bank(module_id, game_mode, difficulty);
create table if not exists public.quest_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  module_id text not null,
  game_mode text not null,
  difficulty text not null,
  question_ids text[] not null check (array_length(question_ids,1) = 10),
  next_index integer not null default 0 check (next_index between 0 and 10),
  score integer not null default 0 check (score between 0 and 10),
  started_at timestamptz not null default now(),
  question_deadline timestamptz,
  finished_at timestamptz,
  unique (id, user_id)
);
create index if not exists quest_sessions_user_recent on public.quest_sessions(user_id, started_at desc);
create table if not exists public.quest_answers (
  session_id uuid not null references public.quest_sessions(id) on delete cascade,
  question_index integer not null check (question_index between 0 and 9),
  question_id text not null references public.quest_question_bank(id),
  submitted_answer text not null,
  correct boolean not null,
  answered_at timestamptz not null default now(),
  primary key (session_id, question_index)
);
create table if not exists public.quest_powerup_uses (
  session_id uuid not null references public.quest_sessions(id) on delete cascade,
  kind text not null check (kind in ('smart_hint','time_freeze','fifty_fifty','extra_time','second_chance','lesson_peek')),
  question_index integer not null check (question_index between 0 and 9),
  cost integer not null check (cost > 0),
  used_at timestamptz not null default now(),
  primary key (session_id, kind)
);

alter table public.quest_wallets enable row level security;
alter table public.quest_ledger enable row level security;
alter table public.quest_question_bank enable row level security;
alter table public.quest_sessions enable row level security;
alter table public.quest_answers enable row level security;
alter table public.quest_powerup_uses enable row level security;

create policy quest_wallet_read on public.quest_wallets for select to authenticated using (user_id = (select auth.uid()));
create policy quest_ledger_read on public.quest_ledger for select to authenticated using (user_id = (select auth.uid()));
create policy quest_session_read on public.quest_sessions for select to authenticated using (user_id = (select auth.uid()));
create policy quest_answers_read on public.quest_answers for select to authenticated using (exists (select 1 from public.quest_sessions s where s.id=session_id and s.user_id=(select auth.uid())));
create policy quest_powerups_read on public.quest_powerup_uses for select to authenticated using (exists (select 1 from public.quest_sessions s where s.id=session_id and s.user_id=(select auth.uid())));
grant select on public.quest_wallets, public.quest_ledger, public.quest_sessions, public.quest_answers, public.quest_powerup_uses to authenticated;
revoke all on public.quest_question_bank from anon, authenticated;

-- The bank and all mutable tables are writable only by trusted server code.
-- Function grants are added with the corresponding audited RPC implementation.
