-- Creators can delete (archive) their posts. A deleted post disappears for everyone
-- except its creator and the people who already bought it, who keep their recipe.
alter table public.listings add column archived_at timestamptz;

drop policy "Listings are public" on public.listings;
create policy "Listings are public until deleted" on public.listings
  for select using (
    archived_at is null
    or creator_id = (select private.current_profile_id())
    or exists (
      select 1 from public.purchases p
      where p.listing_id = listings.id and p.user_id = (select auth.uid())
    )
  );

-- Deleted posts can't be bought
drop policy "Record your purchase" on public.purchases;
create policy "Record your purchase" on public.purchases
  for insert to authenticated with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.listings l where l.id = listing_id and l.archived_at is null)
  );

-- Editing a post can remove its proof link
create policy "Creators remove their proof link" on public.listing_proofs
  for delete to authenticated using (
    exists (
      select 1 from public.listings l
      where l.id = listing_proofs.listing_id and l.creator_id = (select private.current_profile_id())
    )
  );
