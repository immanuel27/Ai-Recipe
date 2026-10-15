-- "Welcome back": touch_presence() now also tells the page when this person was
-- last here (before this visit) and when they joined, so returning people who've
-- been away a while can see what's new. Only ever returns the caller's own info.
drop function public.touch_presence();

create function public.touch_presence()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  previous timestamptz;
  joined timestamptz;
begin
  if auth.uid() is null then return null; end if;
  select last_seen_at into previous from private.presence where auth_user_id = auth.uid();
  select created_at into joined from auth.users where id = auth.uid();
  insert into private.presence (auth_user_id, last_seen_at) values (auth.uid(), now())
  on conflict (auth_user_id) do update set last_seen_at = now();
  insert into private.daily_active (day, auth_user_id) values (current_date, auth.uid())
  on conflict do nothing;
  return jsonb_build_object('previousSeenAt', previous, 'joinedAt', joined);
end
$$;
revoke execute on function public.touch_presence() from public, anon;
grant execute on function public.touch_presence() to authenticated;
