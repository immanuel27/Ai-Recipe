-- Website recipes and proof links.
-- - listings.live_url: where a website recipe's site is live (public)
-- - listings.verified_at: set by the team after checking the proof link
-- - listing_proofs: the creator's share link from the tool (private: the
--   creator and buyers only), e.g. a Higgsfield, ChatGPT or Claude share link

alter table public.listings
  add column live_url text check (live_url is null or live_url ~ '^https://'),
  add column verified_at timestamptz;

create table public.listing_proofs (
  listing_id uuid primary key references public.listings (id) on delete cascade,
  url text not null check (url ~ '^https://' and char_length(url) <= 500),
  created_at timestamptz not null default now()
);
alter table public.listing_proofs enable row level security;

create policy "Creators and buyers can see the proof link" on public.listing_proofs
  for select to authenticated using (
    exists (
      select 1 from public.listings l
      where l.id = listing_proofs.listing_id
        and (
          l.creator_id = (select private.current_profile_id())
          or exists (
            select 1 from public.purchases p
            where p.listing_id = l.id and p.user_id = (select auth.uid())
          )
        )
    )
  );
create policy "Creators add a proof link to their listings" on public.listing_proofs
  for insert to authenticated with check (
    exists (
      select 1 from public.listings l
      where l.id = listing_proofs.listing_id and l.creator_id = (select private.current_profile_id())
    )
  );
create policy "Creators change their proof link" on public.listing_proofs
  for update to authenticated
  using (
    exists (
      select 1 from public.listings l
      where l.id = listing_proofs.listing_id and l.creator_id = (select private.current_profile_id())
    )
  );

-- Only the team (dashboard / service role) can verify. Creators can't set
-- verified_at on their own listings, but a change of proof link clears it.
create function private.guard_verified_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if current_user in ('authenticated', 'anon') then
    if tg_op = 'INSERT' then
      new.verified_at := null;
    elsif new.verified_at is not null and new.verified_at is distinct from old.verified_at then
      new.verified_at := old.verified_at;
    end if;
  end if;
  return new;
end
$$;
create trigger listings_guard_verified_at
before insert or update on public.listings
for each row execute function private.guard_verified_at();

create function private.unverify_on_new_proof()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'UPDATE' and new.url is not distinct from old.url then
    return new;
  end if;
  update public.listings set verified_at = null where id = new.listing_id;
  return new;
end
$$;
revoke execute on function private.unverify_on_new_proof() from public, anon, authenticated;
create trigger listing_proofs_unverify
after insert or update on public.listing_proofs
for each row execute function private.unverify_on_new_proof();

-- For the team: posts waiting for a check, newest first. Run in the SQL editor:
--   select l.created_at, l.slug, l.tool, l.title, pr.url as proof
--   from public.listings l join public.listing_proofs pr on pr.listing_id = l.id
--   where l.verified_at is null order by l.created_at desc;
-- Verify one:   update public.listings set verified_at = now() where slug = '…';
-- Unverify:     update public.listings set verified_at = null where slug = '…';
