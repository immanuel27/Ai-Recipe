-- Admin dashboard: who's an admin, presence ("online now" / "active today"),
-- and admin-only functions for stats and verifying posts.

-- Admins (private: not exposed through the API)
create table private.admins (
  auth_user_id uuid primary key references auth.users (id) on delete cascade,
  added_at timestamptz not null default now()
);
insert into private.admins (auth_user_id)
select auth_user_id from public.profiles where username in ('ghost', 'atomthecreator') and auth_user_id is not null;

create function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from private.admins where auth_user_id = auth.uid())
$$;

-- Presence: the last time each signed-in person had the site open (private)
create table private.presence (
  auth_user_id uuid primary key references auth.users (id) on delete cascade,
  last_seen_at timestamptz not null default now(),
  first_seen_today date not null default current_date
);
create table private.daily_active (
  day date not null,
  auth_user_id uuid not null references auth.users (id) on delete cascade,
  primary key (day, auth_user_id)
);

-- Called by open pages every ~2 minutes
create function public.touch_presence()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then return; end if;
  insert into private.presence (auth_user_id, last_seen_at) values (auth.uid(), now())
  on conflict (auth_user_id) do update set last_seen_at = now();
  insert into private.daily_active (day, auth_user_id) values (current_date, auth.uid())
  on conflict do nothing;
end
$$;
revoke execute on function public.touch_presence() from public, anon;
grant execute on function public.touch_presence() to authenticated;

-- Is the caller an admin? (the page uses this to show or hide the dashboard)
create function public.am_i_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$ select private.is_admin() $$;
revoke execute on function public.am_i_admin() from public, anon;
grant execute on function public.am_i_admin() to authenticated;

-- Everything the dashboard shows, in one call. Admins only.
create function public.admin_overview()
returns jsonb
language plpgsql
stable
security definer
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
        select l.id, l.slug, l.title, p.username as creator, pr.url as proof, l.sales as unlocks, l.created_at
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
revoke execute on function public.admin_overview() from public, anon;
grant execute on function public.admin_overview() to authenticated;

-- Verify or unverify a post from the dashboard. Admins only.
create function public.admin_set_verified(target uuid, verified boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not private.is_admin() then
    raise exception 'not allowed' using errcode = '42501';
  end if;
  update public.listings set verified_at = case when verified then now() else null end where id = target;
end
$$;
revoke execute on function public.admin_set_verified(uuid, boolean) from public, anon;
grant execute on function public.admin_set_verified(uuid, boolean) to authenticated;
