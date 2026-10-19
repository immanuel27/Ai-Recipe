-- Comments on posts. Anyone signed in can read and write them on live posts;
-- authors delete their own, creators can delete any on their own post, and
-- admins can delete any. Creators are notified of new comments.

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (char_length(btrim(body)) between 1 and 500),
  created_at timestamptz not null default now()
);
create index comments_listing_idx on public.comments (listing_id, created_at desc);
create index comments_author_idx on public.comments (author_id, created_at desc);
alter table public.comments enable row level security;

create policy "Comments on live posts are visible" on public.comments
  for select to authenticated
  using (private.listing_is_live(listing_id));

create policy "Comment as yourself on live posts" on public.comments
  for insert to authenticated
  with check (author_id = (select private.current_profile_id()) and private.listing_is_live(listing_id));

create policy "Delete your comments, comments on your post, or as admin" on public.comments
  for delete to authenticated
  using (
    author_id = (select private.current_profile_id())
    or exists (select 1 from public.listings l where l.id = listing_id and l.creator_id = (select private.current_profile_id()))
    or private.is_admin()
  );

-- Comment count on the listing (like likes and saves)
alter table public.listings add column comments integer not null default 0;

create function private.sync_comment_count()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    update public.listings set comments = comments + 1 where id = new.listing_id;
    return new;
  end if;
  update public.listings set comments = greatest(comments - 1, 0) where id = old.listing_id;
  return old;
end
$$;
revoke execute on function private.sync_comment_count() from public, anon, authenticated;
create trigger comments_count after insert or delete on public.comments
for each row execute function private.sync_comment_count();

-- Slow down spam: at most 5 comments a minute per person
create function private.limit_comment_rate()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select count(*) from public.comments
      where author_id = new.author_id and created_at > now() - interval '1 minute') >= 5 then
    raise exception 'You''re commenting too fast. Wait a moment and try again.' using errcode = 'P0001';
  end if;
  return new;
end
$$;
revoke execute on function private.limit_comment_rate() from public, anon, authenticated;
create trigger comments_rate before insert on public.comments
for each row execute function private.limit_comment_rate();

-- Notify the creator (not about their own comments); deleting the comment removes it
alter table public.notifications drop constraint notifications_type_check;
alter table public.notifications add constraint notifications_type_check
  check (type in ('like', 'save', 'unlock', 'comment'));
alter table public.notifications add column comment_id uuid references public.comments (id) on delete cascade;
create index notifications_comment_idx on public.notifications (comment_id) where comment_id is not null;

create function private.notify_comment()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  owner uuid;
begin
  select l.creator_id into owner
  from public.listings l join public.profiles p on p.id = l.creator_id
  where l.id = new.listing_id and p.auth_user_id is not null;
  if owner is not null and owner is distinct from new.author_id then
    insert into public.notifications (recipient_id, actor_id, type, listing_id, comment_id)
    values (owner, new.author_id, 'comment', new.listing_id, new.id);
  end if;
  return new;
end
$$;
revoke execute on function private.notify_comment() from public, anon, authenticated;
create trigger comments_notify after insert on public.comments
for each row execute function private.notify_comment();
