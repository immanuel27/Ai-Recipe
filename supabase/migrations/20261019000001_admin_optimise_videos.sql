-- Admins can shrink existing feed videos: the admin page downloads each big video,
-- re-encodes it in the browser, uploads the smaller copy next to the original
-- (media/<creator uid>/<slug>/media-opt-….mp4) and points the listing at it.
-- Admins only: every check goes through private.is_admin().

create policy "Admins can add optimised videos" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'media' and private.is_admin() and name like '%/media-opt-%.mp4');

create policy "Admins can read media" on storage.objects
  for select to authenticated
  using (bucket_id = 'media' and private.is_admin());

-- Video posts and the size of their stored file, biggest first
create function public.admin_videos()
returns table (id uuid, slug text, title text, media_url text, bytes bigint)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not private.is_admin() then
    raise exception 'not allowed' using errcode = '42501';
  end if;
  return query
    select l.id, l.slug, l.title, l.media_url, (o.metadata->>'size')::bigint
    from public.listings l
    join storage.objects o
      on o.bucket_id = 'media' and o.name = split_part(l.media_url, '/storage/v1/object/public/media/', 2)
    where l.type = 'video' and l.archived_at is null
    order by (o.metadata->>'size')::bigint desc;
end
$$;
revoke execute on function public.admin_videos() from public, anon;
grant execute on function public.admin_videos() to authenticated;

-- Point a video post at its optimised copy (must be in the same folder)
create function public.admin_replace_video(target uuid, new_url text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  old_url text;
begin
  if not private.is_admin() then
    raise exception 'not allowed' using errcode = '42501';
  end if;
  select media_url into old_url from public.listings where id = target and type = 'video';
  if old_url is null then
    raise exception 'not a video post';
  end if;
  -- Same folder as the original, and an optimised file name
  if regexp_replace(new_url, '/[^/]+$', '') <> regexp_replace(old_url, '/[^/]+$', '')
     or new_url !~ '/media-opt-[a-z0-9]+\.mp4$' then
    raise exception 'unexpected video address';
  end if;
  update public.listings set media_url = new_url where id = target;
end
$$;
revoke execute on function public.admin_replace_video(uuid, text) from public, anon;
grant execute on function public.admin_replace_video(uuid, text) to authenticated;
