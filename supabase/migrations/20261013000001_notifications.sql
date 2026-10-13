-- Notifications: creators hear when someone likes, saves or unlocks their post.
-- Written only by triggers (security definer); people read and mark their own.

create table public.notifications (
  id bigint generated always as identity primary key,
  recipient_id uuid not null references public.profiles (id) on delete cascade,
  actor_id uuid references public.profiles (id) on delete cascade,
  type text not null check (type in ('like', 'save', 'unlock')),
  listing_id uuid not null references public.listings (id) on delete cascade,
  created_at timestamptz not null default now(),
  read_at timestamptz
);
create index notifications_recipient_idx on public.notifications (recipient_id, created_at desc);
create index notifications_unread_idx on public.notifications (recipient_id) where read_at is null;
alter table public.notifications enable row level security;

create policy "See your notifications" on public.notifications
  for select to authenticated using (recipient_id = (select private.current_profile_id()));
create policy "Mark your notifications read" on public.notifications
  for update to authenticated
  using (recipient_id = (select private.current_profile_id()))
  with check (recipient_id = (select private.current_profile_id()));

-- One trigger for likes, saves and purchases. Only real creators (with a login)
-- are notified, never about their own activity. Un-liking / un-saving removes the
-- notification if it hasn't been seen yet.
create function private.notify_listing_activity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  kind text := case tg_table_name when 'likes' then 'like' when 'saves' then 'save' else 'unlock' end;
  owner uuid;
  actor uuid;
begin
  if tg_op = 'INSERT' then
    select l.creator_id into owner
    from public.listings l join public.profiles p on p.id = l.creator_id
    where l.id = new.listing_id and p.auth_user_id is not null;
    select id into actor from public.profiles where auth_user_id = new.user_id;
    if owner is not null and owner is distinct from actor then
      insert into public.notifications (recipient_id, actor_id, type, listing_id)
      values (owner, actor, kind, new.listing_id);
    end if;
    return new;
  end if;

  delete from public.notifications n
  using public.profiles p
  where p.auth_user_id = old.user_id
    and n.actor_id = p.id
    and n.listing_id = old.listing_id
    and n.type = kind
    and n.read_at is null;
  return old;
end
$$;
revoke execute on function private.notify_listing_activity() from public, anon, authenticated;

create trigger likes_notify after insert or delete on public.likes
for each row execute function private.notify_listing_activity();
create trigger saves_notify after insert or delete on public.saves
for each row execute function private.notify_listing_activity();
create trigger purchases_notify after insert on public.purchases
for each row execute function private.notify_listing_activity();

-- Backfill past activity so creators see it straight away (unread)
insert into public.notifications (recipient_id, actor_id, type, listing_id, created_at)
select l.creator_id, a.id, x.kind, x.listing_id, x.created_at
from (
  select user_id, listing_id, created_at, 'like' as kind from public.likes
  union all select user_id, listing_id, created_at, 'save' from public.saves
  union all select user_id, listing_id, created_at, 'unlock' from public.purchases
) x
join public.listings l on l.id = x.listing_id
join public.profiles owner on owner.id = l.creator_id and owner.auth_user_id is not null
left join public.profiles a on a.auth_user_id = x.user_id
where a.id is distinct from l.creator_id;
