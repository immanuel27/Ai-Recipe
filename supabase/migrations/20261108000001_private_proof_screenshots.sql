-- Proof is now private to the creator and the team (it used to be shown to
-- buyers too, and with every recipe free that meant everyone), and it can be
-- screenshots instead of a link: code-made motion graphics carry no AI tag, and
-- creators don't want their chat link public.
--
-- Screenshots live in a private "proofs" bucket under <auth uid>/…; only the
-- creator and admins can read them (the admin dashboard uses signed URLs).

alter table public.listing_proofs
  alter column url drop not null,
  add column screenshots text[] not null default '{}' check (cardinality(screenshots) <= 3),
  add constraint listing_proofs_has_proof check (url is not null or cardinality(screenshots) > 0);

drop policy "Creators and buyers can see the proof link" on public.listing_proofs;
create policy "Creators and the team can see the proof" on public.listing_proofs
  for select to authenticated using (
    (select private.is_admin())
    or exists (
      select 1 from public.listings l
      where l.id = listing_proofs.listing_id and l.creator_id = (select private.current_profile_id())
    )
  );

-- New screenshots also clear Verified, like a new link
create or replace function private.unverify_on_new_proof()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'UPDATE' and new.url is not distinct from old.url and new.screenshots is not distinct from old.screenshots then
    return new;
  end if;
  update public.listings set verified_at = null where id = new.listing_id;
  return new;
end
$$;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('proofs', 'proofs', false, 10485760, array['image/jpeg', 'image/png', 'image/webp']);

create policy "Creators upload proof screenshots to their folder" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'proofs' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Creators and the team see proof screenshots" on storage.objects
  for select to authenticated
  using (bucket_id = 'proofs' and ((storage.foldername(name))[1] = (select auth.uid())::text or (select private.is_admin())));
create policy "Creators remove their proof screenshots" on storage.objects
  for delete to authenticated
  using (bucket_id = 'proofs' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- The admin dashboard's "waiting for verification" list now includes screenshots
create or replace function public.admin_overview()
returns jsonb
language plpgsql
stable security definer
set search_path = ''
as $$
declare
  team text[] := array['ghost', 'davinci88', 'grant0007', 'atomthecreator'];
  result jsonb;
begin
  if not private.is_admin() then
    raise exception 'not allowed' using errcode = '42501';
  end if;

  select jsonb_build_object(
    'generatedAt', now(),
    'onlineNow', (select count(*) from private.presence where last_seen_at > now() - interval '5 minutes'),
    'activeToday', (select count(*) from private.daily_active where day = current_date),
    'activeYesterday', (select count(*) from private.daily_active where day = current_date - 1),
    'totalUsers', (select count(*) from auth.users),
    'outsideUsers', (select count(*) from auth.users u left join public.profiles p on p.auth_user_id = u.id where p.username is null or not (p.username = any (team))),
    'signupsToday', (select count(*) from auth.users where created_at >= current_date),
    'signupsYesterday', (select count(*) from auth.users where created_at >= current_date - 1 and created_at < current_date),
    'stuckNoUsername', (select count(*) from auth.users u where not exists (select 1 from public.profiles p where p.auth_user_id = u.id)),
    'withPhoto', (select count(*) from public.profiles where avatar_url is not null),
    'unlocksToday', (select count(*) from public.purchases where created_at >= current_date),
    'unlocksTotal', (select count(*) from public.purchases),
    'usersWhoUnlocked', (select count(distinct user_id) from public.purchases),
    'likesToday', (select count(*) from public.likes where created_at >= current_date),
    'likesTotal', (select count(*) from public.likes),
    'savesTotal', (select count(*) from public.saves),
    'postsToday', (select count(*) from public.listings l join public.profiles p on p.id = l.creator_id where p.auth_user_id is not null and l.archived_at is null and l.created_at >= current_date),
    'postsTotal', (select count(*) from public.listings l join public.profiles p on p.id = l.creator_id where p.auth_user_id is not null and l.archived_at is null),
    'signupsByDay', (
      select coalesce(jsonb_agg(jsonb_build_object('day', d::date, 'count', (select count(*) from auth.users where created_at::date = d::date)) order by d), '[]')
      from generate_series(current_date - 13, current_date, interval '1 day') d
    ),
    'topPosts', (
      select coalesce(jsonb_agg(t order by t.unlocks desc, t.likes desc), '[]') from (
        select l.slug, l.title, p.username as creator, l.sales as unlocks, l.likes, l.saves, l.verified_at is not null as verified
        from public.listings l join public.profiles p on p.id = l.creator_id
        where p.auth_user_id is not null and l.archived_at is null
        order by l.sales desc, l.likes desc limit 8
      ) t
    ),
    'pendingVerification', (
      select coalesce(jsonb_agg(t order by t.unlocks desc), '[]') from (
        select l.id, l.slug, l.title, p.username as creator, pr.url as proof, pr.screenshots, l.sales as unlocks, l.created_at
        from public.listings l
        join public.profiles p on p.id = l.creator_id
        join public.listing_proofs pr on pr.listing_id = l.id
        where l.verified_at is null and l.archived_at is null
        limit 20
      ) t
    ),
    'activity', (
      select coalesce(jsonb_agg(a order by a.at desc), '[]') from (
        (select 'signup' as kind, u.created_at as at, p.username as who, null::text as title, null::text as slug
          from auth.users u left join public.profiles p on p.auth_user_id = u.id order by u.created_at desc limit 15)
        union all
        (select 'post', l.created_at, p.username, l.title, l.slug
          from public.listings l join public.profiles p on p.id = l.creator_id
          where p.auth_user_id is not null order by l.created_at desc limit 10)
        union all
        (select 'unlock', x.created_at, p.username, l.title, l.slug
          from public.purchases x join public.listings l on l.id = x.listing_id left join public.profiles p on p.auth_user_id = x.user_id
          order by x.created_at desc limit 15)
        union all
        (select 'like', k.created_at, p.username, l.title, l.slug
          from public.likes k join public.listings l on l.id = k.listing_id left join public.profiles p on p.auth_user_id = k.user_id
          order by k.created_at desc limit 10)
        order by at desc limit 30
      ) a
    )
  ) into result;
  return result;
end
$$;
