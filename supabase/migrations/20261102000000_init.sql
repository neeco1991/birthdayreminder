-- Pills: predefined interests that describe a contact (and, later, drive gift ideas).
-- Labels and emoji live in src/lib/pills.ts; keep both lists in sync.
create type public.pill as enum (
  'nerd',
  'gamer',
  'tech',
  'bookworm',
  'fitness',
  'sports',
  'outdoors',
  'traveler',
  'foodie',
  'coffee',
  'wine',
  'music',
  'movies',
  'art',
  'fashion',
  'beauty',
  'pets',
  'gardening',
  'diy',
  'wellness'
);

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles: one row per auth user, holding reminder preferences.
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  -- Mirrored from auth.users so the reminder job can read it through the API.
  email text,
  -- IANA zone; null until the browser reports it on first visit (job falls back to UTC).
  timezone text,
  send_hour smallint not null default 8 check (send_hour between 0 and 23),
  gift_lead_days smallint not null default 14 check (gift_lead_days between 1 and 60),
  emails_enabled boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can read their own profile"
  on public.profiles for select to authenticated
  using ((select auth.uid()) = id);

create policy "Users can update their own profile"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Users may only change their preferences, never the email the job sends to.
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (timezone, send_hour, gift_lead_days, emails_enabled) on public.profiles to authenticated;
grant all on public.profiles to service_role;

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create function public.handle_user_email_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profiles set email = new.email where id = new.id;
  return new;
end;
$$;

create trigger on_auth_user_email_changed
  after update of email on auth.users
  for each row
  when (old.email is distinct from new.email)
  execute function public.handle_user_email_change();

-- ---------------------------------------------------------------------------
-- contacts: the people a user wants to be reminded about.
-- ---------------------------------------------------------------------------
create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 100),
  birth_day smallint not null,
  birth_month smallint not null check (birth_month between 1 and 12),
  birth_year smallint check (birth_year between 1900 and 2100),
  -- Gift contacts also get an advance reminder (profiles.gift_lead_days before).
  is_gift boolean not null default false,
  pills public.pill[] not null default '{}' check (cardinality(pills) <= 10),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint contacts_valid_date check (
    birth_day between 1 and (
      case
        when birth_month = 2 then 29
        when birth_month in (4, 6, 9, 11) then 30
        else 31
      end
    )
    and (
      birth_year is null
      or not (birth_month = 2 and birth_day = 29)
      or (birth_year % 4 = 0 and (birth_year % 100 <> 0 or birth_year % 400 = 0))
    )
  )
);

create index contacts_user_id_idx on public.contacts (user_id);

create trigger contacts_set_updated_at
  before update on public.contacts
  for each row execute function public.set_updated_at();

alter table public.contacts enable row level security;

create policy "Users can read their own contacts"
  on public.contacts for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can create their own contacts"
  on public.contacts for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own contacts"
  on public.contacts for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own contacts"
  on public.contacts for delete to authenticated
  using ((select auth.uid()) = user_id);

revoke all on public.contacts from anon;
grant select, insert, update, delete on public.contacts to authenticated;
grant all on public.contacts to service_role;

-- ---------------------------------------------------------------------------
-- reminder_log: which reminders were sent, so each one goes out exactly once.
-- Only the service role (the reminder job) touches this table.
-- ---------------------------------------------------------------------------
create table public.reminder_log (
  contact_id uuid not null references public.contacts (id) on delete cascade,
  kind text not null check (kind in ('day_of', 'advance')),
  -- The birthday the reminder is about (not the day it was sent).
  occurrence_date date not null,
  sent_at timestamptz not null default now(),
  primary key (contact_id, kind, occurrence_date)
);

alter table public.reminder_log enable row level security;

revoke all on public.reminder_log from anon, authenticated;
grant all on public.reminder_log to service_role;
