-- Posts can use more than one tool (e.g. Lovable + Claude). `tool` stays the main one.
alter table public.listings add column tools text[] not null default '{}';
update public.listings set tools = array[tool] where tools = '{}';
