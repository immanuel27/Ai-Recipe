-- AI Recipe: core schema
-- Profiles, listings (public), recipes (locked to buyers/owners), purchases,
-- likes, saves, private seller settings. Row Level Security on everything.

-- ─── Profiles ────────────────────────────────────────────────────────────────
-- auth_user_id is null for the seeded demo creators (they have no login).
create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users (id) on delete cascade,
  username text not null unique check (username ~ '^[a-z0-9_.]{3,20}$'),
  display_name text not null,
  bio text not null default '',
  avatar_url text,
  is_seller boolean not null default false,
  created_at timestamptz not null default now()
);

-- The signed-in user's profile id (null if they haven't picked a username yet)
create function public.current_profile_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select id from public.profiles where auth_user_id = auth.uid()
$$;

-- Private seller details: only the seller can see or change them
create table public.seller_settings (
  profile_id uuid primary key references public.profiles (id) on delete cascade,
  payout_method text not null,
  country text not null,
  proof_of_work_url text not null,
  payout_currency text not null default 'USD' check (payout_currency in ('USD', 'EUR', 'GBP')),
  payout_threshold integer not null default 50 check (payout_threshold between 10 and 1000),
  created_at timestamptz not null default now()
);

-- ─── Listings (public) ──────────────────────────────────────────────────────
create table public.listings (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  creator_id uuid not null references public.profiles (id) on delete cascade,
  title text not null check (char_length(title) between 4 and 80),
  description text not null default '',
  type text not null check (type in ('video', 'image')),
  media_url text not null,
  poster_url text not null,
  images text[],
  clip jsonb,
  credit jsonb,
  ai_tag jsonb,
  tool text not null,
  tool_version text not null,
  tags text[] not null default '{}',
  price_cents integer not null check (price_cents between 0 and 50000),
  pricing jsonb not null default '{"mode": "single"}',
  is_adult boolean not null default false,
  views integer not null default 0,
  sales integer not null default 0,
  saves integer not null default 0,
  likes integer not null default 0,
  trending_score numeric not null default 0,
  -- Public teaser of the locked recipe: part counts, a cut-off first prompt,
  -- the first failed attempt and blurred thumbnails of the rest
  preview jsonb not null default '{}',
  created_at timestamptz not null default now()
);
create index listings_creator_id_idx on public.listings (creator_id);
create index listings_trending_idx on public.listings (trending_score desc);

-- ─── Recipes (locked) ───────────────────────────────────────────────────────
create table public.recipes (
  listing_id uuid primary key references public.listings (id) on delete cascade,
  prompts jsonb not null default '[]',
  settings jsonb not null default '[]',
  assets jsonb not null default '[]',
  edit_stack jsonb not null default '[]',
  failures jsonb not null default '[]'
);

-- ─── Purchases, likes, saves (per user) ─────────────────────────────────────
create table public.purchases (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  listing_id uuid not null references public.listings (id) on delete cascade,
  price_cents integer not null default 0,
  created_at timestamptz not null default now(),
  primary key (user_id, listing_id)
);
create index purchases_listing_id_idx on public.purchases (listing_id);

create table public.likes (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  listing_id uuid not null references public.listings (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, listing_id)
);
create index likes_listing_id_idx on public.likes (listing_id);

create table public.saves (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  listing_id uuid not null references public.listings (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, listing_id)
);
create index saves_listing_id_idx on public.saves (listing_id);

-- A purchase always records the listing's real price (the client can't set it)
create function public.set_purchase_price()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  select price_cents into new.price_cents from public.listings where id = new.listing_id;
  return new;
end
$$;
create trigger purchases_set_price
before insert on public.purchases
for each row execute function public.set_purchase_price();

-- Keep the public counters on listings in step with likes, saves and sales
create function public.bump_listing_counter()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  col text := case tg_table_name when 'likes' then 'likes' when 'saves' then 'saves' else 'sales' end;
  delta integer := case tg_op when 'INSERT' then 1 else -1 end;
  target uuid := coalesce(new.listing_id, old.listing_id);
begin
  execute format(
    'update public.listings set %I = greatest(0, %I + $1) where id = $2', col, col
  ) using delta, target;
  return null;
end
$$;
create trigger likes_counter after insert or delete on public.likes
for each row execute function public.bump_listing_counter();
create trigger saves_counter after insert or delete on public.saves
for each row execute function public.bump_listing_counter();
create trigger purchases_counter after insert or delete on public.purchases
for each row execute function public.bump_listing_counter();

-- ─── Row Level Security ─────────────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.seller_settings enable row level security;
alter table public.listings enable row level security;
alter table public.recipes enable row level security;
alter table public.purchases enable row level security;
alter table public.likes enable row level security;
alter table public.saves enable row level security;

-- Profiles: public read; you create and edit only your own
create policy "Profiles are public" on public.profiles
  for select using (true);
create policy "Create your own profile" on public.profiles
  for insert to authenticated with check (auth_user_id = (select auth.uid()));
create policy "Edit your own profile" on public.profiles
  for update to authenticated
  using (auth_user_id = (select auth.uid()))
  with check (auth_user_id = (select auth.uid()));

-- Seller settings: owner only
create policy "Sellers manage their own settings" on public.seller_settings
  for all to authenticated
  using (profile_id = (select public.current_profile_id()))
  with check (profile_id = (select public.current_profile_id()));

-- Listings: public read; creators manage their own
create policy "Listings are public" on public.listings
  for select using (true);
create policy "Creators publish listings" on public.listings
  for insert to authenticated with check (creator_id = (select public.current_profile_id()));
create policy "Creators edit their listings" on public.listings
  for update to authenticated
  using (creator_id = (select public.current_profile_id()))
  with check (creator_id = (select public.current_profile_id()));
create policy "Creators delete their listings" on public.listings
  for delete to authenticated using (creator_id = (select public.current_profile_id()));

-- Recipes: readable by the creator, buyers, and anyone for free listings
create policy "Owners, buyers and free listings can read recipes" on public.recipes
  for select using (
    exists (
      select 1 from public.listings l
      where l.id = recipes.listing_id
        and (
          l.price_cents = 0
          or l.creator_id = (select public.current_profile_id())
          or exists (
            select 1 from public.purchases p
            where p.listing_id = l.id and p.user_id = (select auth.uid())
          )
        )
    )
  );
create policy "Creators add recipes to their listings" on public.recipes
  for insert to authenticated with check (
    exists (
      select 1 from public.listings l
      where l.id = recipes.listing_id and l.creator_id = (select public.current_profile_id())
    )
  );
create policy "Creators edit their recipes" on public.recipes
  for update to authenticated using (
    exists (
      select 1 from public.listings l
      where l.id = recipes.listing_id and l.creator_id = (select public.current_profile_id())
    )
  );

-- Purchases: you see and create only your own.
-- NOTE: demo checkout inserts directly. With real payments, insert from a
-- payment webhook using the service role and drop the insert policy.
create policy "See your purchases" on public.purchases
  for select to authenticated using (user_id = (select auth.uid()));
create policy "Record your purchase" on public.purchases
  for insert to authenticated with check (user_id = (select auth.uid()));

-- Likes and saves: your own only
create policy "See your likes" on public.likes
  for select to authenticated using (user_id = (select auth.uid()));
create policy "Like" on public.likes
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "Unlike" on public.likes
  for delete to authenticated using (user_id = (select auth.uid()));

create policy "See your saves" on public.saves
  for select to authenticated using (user_id = (select auth.uid()));
create policy "Save" on public.saves
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "Unsave" on public.saves
  for delete to authenticated using (user_id = (select auth.uid()));

-- ─── Storage: uploaded media ────────────────────────────────────────────────
-- Public-read bucket; each user writes only inside their own folder (<user id>/...)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  true,
  209715200, -- 200 MB (largest video)
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif', 'video/mp4', 'video/webm', 'video/quicktime']
);

create policy "Upload to your own media folder" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'media' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Replace your own media" on storage.objects
  for update to authenticated
  using (bucket_id = 'media' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Delete your own media" on storage.objects
  for delete to authenticated
  using (bucket_id = 'media' and (storage.foldername(name))[1] = (select auth.uid())::text);
