-- Keep helper functions out of the public API (Supabase advisor 0028/0029).
-- Policies and triggers reference functions by identity, so they keep working.
create schema if not exists private;
grant usage on schema private to anon, authenticated;

alter function public.current_profile_id() set schema private;
alter function public.set_purchase_price() set schema private;
alter function public.bump_listing_counter() set schema private;

-- Trigger functions are never called directly
revoke execute on function private.set_purchase_price() from public, anon, authenticated;
revoke execute on function private.bump_listing_counter() from public, anon, authenticated;
