-- AI features: per-user daily limits, and a shared cache of gift ideas.

-- ---------------------------------------------------------------------------
-- ai_usage: how many AI calls each user made today, so a free service can cap its AI bill.
-- Only today's rows are kept: claim_ai_call deletes older ones. Service role only.
-- ---------------------------------------------------------------------------
create table public.ai_usage (
  user_id uuid not null references auth.users (id) on delete cascade,
  feature text not null check (feature in ('contact_import', 'gift_ideas')),
  day date not null default current_date,
  calls integer not null default 1 check (calls > 0),
  primary key (user_id, feature, day)
);

alter table public.ai_usage enable row level security;

revoke all on public.ai_usage from anon, authenticated;
grant all on public.ai_usage to service_role;

-- Counts one call and returns true while the user is under today's limit, false once it's reached.
-- A single upsert, so parallel requests can't overshoot the limit.
create function public.claim_ai_call(p_user_id uuid, p_feature text, p_daily_limit integer)
returns boolean
language plpgsql
set search_path = ''
as $$
declare
  counted integer;
begin
  delete from public.ai_usage where day < current_date;

  insert into public.ai_usage as u (user_id, feature, day)
  values (p_user_id, p_feature, current_date)
  on conflict (user_id, feature, day) do update set calls = u.calls + 1
    where u.calls < p_daily_limit
  returning u.calls into counted;

  return counted is not null;
end;
$$;

revoke execute on function public.claim_ai_call(uuid, text, integer) from public, anon, authenticated;
grant execute on function public.claim_ai_call(uuid, text, integer) to service_role;

-- ---------------------------------------------------------------------------
-- gift_ideas_cache: AI gift ideas per combination of interests, gender and age range.
-- The key is a SHA-256 of that combination: no names, ids or free text, so all users share it.
-- ---------------------------------------------------------------------------
create table public.gift_ideas_cache (
  key text primary key check (key ~ '^[0-9a-f]{64}$'),
  ideas text[] not null,
  created_at timestamptz not null default now()
);

alter table public.gift_ideas_cache enable row level security;

revoke all on public.gift_ideas_cache from anon, authenticated;
grant all on public.gift_ideas_cache to service_role;
