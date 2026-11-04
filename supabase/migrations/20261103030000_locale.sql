-- Language: the one the user last used the site in, so reminder emails go out in it too.
-- Null until their first visit after signing up (the job then falls back to English).
-- Values match LOCALES in src/lib/i18n.ts; keep both lists in sync.
create type public.locale as enum ('en', 'it');

alter table public.profiles add column locale public.locale;

grant update (locale) on public.profiles to authenticated;
