-- WebVerse — persistence for repository analyses.
-- Run this in the Supabase SQL editor (or via `supabase db push`) before using the app.
-- Analyses are the "living knowledge base": one row per (user, owner, repo), upserted on re-analysis.

create table if not exists public.analyses (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  owner       text not null,
  repo        text not null,
  results     jsonb not null,
  truncated   boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (user_id, owner, repo)
);

create index if not exists analyses_user_repo_idx
  on public.analyses (user_id, owner, repo);

-- Row Level Security: a user can only ever see or mutate their own analyses.
alter table public.analyses enable row level security;

drop policy if exists "analyses_select_own" on public.analyses;
create policy "analyses_select_own"
  on public.analyses for select
  using (auth.uid() = user_id);

drop policy if exists "analyses_insert_own" on public.analyses;
create policy "analyses_insert_own"
  on public.analyses for insert
  with check (auth.uid() = user_id);

drop policy if exists "analyses_update_own" on public.analyses;
create policy "analyses_update_own"
  on public.analyses for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "analyses_delete_own" on public.analyses;
create policy "analyses_delete_own"
  on public.analyses for delete
  using (auth.uid() = user_id);
