-- Fix "infinite recursion detected in policy for relation purchases": the purchase
-- insert policy read listings, whose select policy reads purchases. Check the
-- listing through security-definer helpers instead, so policies don't nest.

create function private.listing_is_live(target uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.listings where id = target and archived_at is null)
$$;

create function private.has_purchased(target uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.purchases where listing_id = target and user_id = auth.uid())
$$;

drop policy "Record your purchase" on public.purchases;
create policy "Record your purchase" on public.purchases
  for insert to authenticated with check (
    user_id = (select auth.uid()) and private.listing_is_live(listing_id)
  );

drop policy "Listings are public until deleted" on public.listings;
create policy "Listings are public until deleted" on public.listings
  for select using (
    archived_at is null
    or creator_id = (select private.current_profile_id())
    or private.has_purchased(id)
  );
