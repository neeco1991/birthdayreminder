-- Gender: optional, asked for gift contacts to help with gift ideas (null = not set).
create type public.gender as enum ('male', 'female');

alter table public.contacts add column gender public.gender;
