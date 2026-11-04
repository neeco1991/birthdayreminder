-- Custom pills: free-text interests a user adds next to the predefined `pill` values.
-- Limits match src/lib/pills.ts (MAX_CUSTOM_PILLS, MAX_CUSTOM_PILL_LENGTH).

-- Check constraints can't use subqueries, so the per-item check goes through a function.
create function public.texts_within_length(items text[], max_length integer)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select coalesce(bool_and(item is not null and char_length(item) between 1 and max_length), true)
  from unnest(items) as item;
$$;

alter table public.contacts
  add column custom_pills text[] not null default '{}',
  add constraint contacts_custom_pills_check check (
    cardinality(custom_pills) <= 10 and public.texts_within_length(custom_pills, 30)
  );
