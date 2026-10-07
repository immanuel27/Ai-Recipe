-- Demo Blender clips: play pre-cut 12-second files from /public/clips instead
-- of streaming the full films from Wikimedia Commons and seeking (slow).
-- The credit keeps the source and gains the clip's timecode.
update public.listings
set media_url = regexp_replace(poster_url, '^/posters/(.*)\.jpg$', '/clips/\1.mp4'),
    credit = jsonb_set(credit, '{work}', to_jsonb(
      (credit->>'work') || ' (' ||
      ((clip->>'start')::int / 60) || ':' || lpad(((clip->>'start')::int % 60)::text, 2, '0') || '–' ||
      ((clip->>'end')::int / 60) || ':' || lpad(((clip->>'end')::int % 60)::text, 2, '0') || ')')),
    clip = null
where media_url like 'https://upload.wikimedia.org/%' and clip is not null;
