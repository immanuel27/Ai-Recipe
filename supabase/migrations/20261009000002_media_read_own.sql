-- Uploads failed with "new row violates row-level security policy for table objects":
-- Storage writes with INSERT ... RETURNING (and upserts), so the new row must also pass
-- a SELECT policy. Let users read their own folder's object rows. (Files are still
-- served to everyone through the public bucket URL; this doesn't expose listings of
-- other users' files.)
create policy "Read your own media" on storage.objects
  for select to authenticated
  using (bucket_id = 'media' and (storage.foldername(name))[1] = (select auth.uid())::text);
