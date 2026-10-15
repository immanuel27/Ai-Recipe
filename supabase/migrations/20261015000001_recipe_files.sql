-- Recipes can attach a PDF to a prompt (long, detailed prompts) and reference
-- images to assets. Both go in the media bucket under the creator's folder, with
-- an unguessable file name; their links are only stored inside the locked recipe.
update storage.buckets
set allowed_mime_types = array[
  'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif',
  'video/mp4', 'video/webm', 'video/quicktime',
  'application/pdf'
]
where id = 'media';
