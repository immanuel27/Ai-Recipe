-- Supabase stops auto-granting Data API access to new public tables on 2026-10-30.
-- Make today's grants explicit so a fresh rebuild from these migrations (new
-- project, preview branch, `supabase db reset`) keeps the API working exactly as
-- now. Row Level Security still decides which rows each person can see or change.
-- From now on, every migration that creates a public table must grant it too.

grant select, insert, update, delete on table
  public.profiles,
  public.seller_settings,
  public.listings,
  public.recipes,
  public.purchases,
  public.likes,
  public.saves,
  public.listing_proofs,
  public.notifications,
  public.comments
to anon, authenticated, service_role;
