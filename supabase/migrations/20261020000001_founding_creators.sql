-- Founding Creators: the first 50 people outside the team to post get a permanent
-- number (#1 to #50) and a badge. Assigned automatically on their first post;
-- nobody can set or change it themselves.

alter table public.profiles add column founding_number smallint unique
  check (founding_number between 1 and 50);

-- Users can't write it (the assign trigger runs as the owner, so it can)
create function private.guard_founding_number()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if current_user in ('authenticated', 'anon') then
    if tg_op = 'INSERT' then
      new.founding_number := null;
    else
      new.founding_number := old.founding_number;
    end if;
  end if;
  return new;
end
$$;
create trigger profiles_guard_founding_number
before insert or update on public.profiles
for each row execute function private.guard_founding_number();

-- The team's accounts don't take a spot
create function private.is_team_profile(p public.profiles)
returns boolean
language sql
immutable
set search_path = ''
as $$ select p.username in ('ghost', 'davinci88', 'grant0007', 'atomthecreator') $$;

create function private.assign_founding_number()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  creator public.profiles;
  next_number smallint;
begin
  select * into creator from public.profiles where id = new.creator_id;
  if creator.id is null or creator.auth_user_id is null or creator.founding_number is not null
     or private.is_team_profile(creator) then
    return new;
  end if;
  -- One at a time, so two first posts at once can't take the same number
  perform pg_advisory_xact_lock(hashtext('founding_number'));
  select coalesce(max(founding_number), 0) + 1 into next_number from public.profiles;
  if next_number <= 50 then
    update public.profiles set founding_number = next_number where id = creator.id;
  end if;
  return new;
end
$$;
revoke execute on function private.assign_founding_number() from public, anon, authenticated;
create trigger listings_assign_founding_number
after insert on public.listings
for each row execute function private.assign_founding_number();

-- Everyone outside the team who has already posted, in order of their first post
with firsts as (
  select p.id, min(l.created_at) as first_post
  from public.profiles p
  join public.listings l on l.creator_id = p.id
  where p.auth_user_id is not null and not private.is_team_profile(p)
  group by p.id
  order by min(l.created_at)
  limit 50
)
update public.profiles p
set founding_number = f.n
from (select id, row_number() over (order by first_post) as n from firsts) f
where p.id = f.id;
