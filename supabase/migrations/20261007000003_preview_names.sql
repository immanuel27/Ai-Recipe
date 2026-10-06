-- Locked recipes show setting names, asset names and edit tools as a teaser
-- (values, notes and prompts stay hidden). Backfill them into listings.preview.
update public.listings l
set preview = l.preview || jsonb_build_object(
  'settingKeys', coalesce((select jsonb_agg(s->>'key') from jsonb_array_elements(r.settings) s), '[]'::jsonb),
  'assetNames', coalesce((select jsonb_agg(a->>'name') from jsonb_array_elements(r.assets) a), '[]'::jsonb),
  'editTools', coalesce((select jsonb_agg(e->>'tool') from jsonb_array_elements(r.edit_stack) e), '[]'::jsonb)
)
from public.recipes r
where r.listing_id = l.id;
