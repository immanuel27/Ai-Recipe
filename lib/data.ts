import { cache } from "react"

import { CREATORS } from "@/lib/mock/creators"
import { LISTINGS } from "@/lib/mock/listings"
import { getToolName } from "@/lib/mock/tools"
import { supabaseConfigured } from "@/lib/supabase/env"
import { createClient } from "@/lib/supabase/server"
import { listingFromRow, profileToCreator, type ListingRow, type ProfileRow } from "@/lib/supabase/mappers"
import type { Creator, ExploreFilters, Listing } from "@/lib/types"

// Data access for server components. Reads from Supabase when it's configured
// (.env.local), otherwise from the demo data in lib/mock so a fresh clone runs.

const LISTING_COLUMNS =
  "id, slug, creator_id, title, description, type, media_url, poster_url, images, clip, credit, ai_tag, tool, tool_version, tags, price_cents, pricing, is_adult, views, sales, saves, likes, trending_score, preview, created_at"

/** Every listing (with teaser recipes) and creator. Fetched once per request. */
export const getCatalog = cache(async (): Promise<{ listings: Listing[]; creators: Creator[] }> => {
  if (!supabaseConfigured) return { listings: LISTINGS, creators: CREATORS }
  try {
    return await fetchCatalog()
  } catch (error) {
    // Keep the site up if Supabase is misconfigured or down; the real error is in the server logs
    console.error("[data] Supabase catalog read failed, showing demo data instead:", error)
    return { listings: LISTINGS, creators: CREATORS }
  }
})

async function fetchCatalog() {
  const supabase = await createClient()
  const [listingsRes, profilesRes] = await Promise.all([
    supabase.from("listings").select(LISTING_COLUMNS).order("trending_score", { ascending: false }),
    supabase.from("profiles").select("id, username, display_name, bio, avatar_url"),
  ])
  if (listingsRes.error) throw listingsRes.error
  if (profilesRes.error) throw profilesRes.error
  return {
    listings: (listingsRes.data as ListingRow[]).map((row) => listingFromRow(row)),
    creators: (profilesRes.data as ProfileRow[]).map(profileToCreator),
  }
}

export async function getFeedListings() {
  const { listings } = await getCatalog()
  return [...listings].sort((a, b) => b.trendingScore - a.trendingScore)
}

export async function getCreators() {
  return (await getCatalog()).creators
}

export async function getCreator(id: string) {
  return (await getCatalog()).creators.find((c) => c.id === id)
}

export async function getCreatorByUsername(username: string) {
  return (await getCatalog()).creators.find((c) => c.username === username)
}

export async function getCreatorListings(creatorId: string, excludeSlug?: string) {
  const { listings } = await getCatalog()
  return listings.filter((l) => l.creatorId === creatorId && l.slug !== excludeSlug)
}

/**
 * One listing. The full recipe is included only when the viewer may read it
 * (free, their own, or bought: enforced by Row Level Security); otherwise
 * `recipeLocked` is true and `recipe` holds the public teaser.
 */
export const getListing = cache(async (slug: string): Promise<Listing | undefined> => {
  if (!supabaseConfigured) return LISTINGS.find((l) => l.slug === slug)
  try {
    return await fetchListing(slug)
  } catch (error) {
    console.error(`[data] Supabase read of listing "${slug}" failed, showing demo data instead:`, error)
    return LISTINGS.find((l) => l.slug === slug)
  }
})

async function fetchListing(slug: string) {
  const supabase = await createClient()
  const { data: row, error } = await supabase
    .from("listings")
    .select(LISTING_COLUMNS)
    .eq("slug", slug)
    .maybeSingle()
  if (error) throw error
  if (!row) return undefined

  const { data: recipe } = await supabase
    .from("recipes")
    .select("prompts, settings, assets, edit_stack, failures")
    .eq("listing_id", (row as ListingRow).id)
    .maybeSingle()
  return listingFromRow(row as ListingRow, recipe ?? undefined)
}

export const EXPLORE_PAGE_SIZE = 24

function matchesQuery(l: Listing, q: string, creators: Creator[]) {
  if (!q) return true
  const creator = creators.find((c) => c.id === l.creatorId)
  const haystack = [
    l.title,
    l.description,
    ...l.tags,
    getToolName(l.tool),
    creator?.displayName,
    creator?.username,
  ]
    .join(" ")
    .toLowerCase()
  return q
    .toLowerCase()
    .split(/\s+/)
    .every((word) => haystack.includes(word))
}

function matchesPrice(l: Listing, price: ExploreFilters["price"]) {
  switch (price) {
    case "free":
      return l.price === 0
    case "under-10":
      return l.price < 1000
    case "10-20":
      return l.price >= 1000 && l.price <= 2000
    case "over-20":
      return l.price > 2000
    default:
      return true
  }
}

export function filterListings(
  listings: Listing[],
  f: Omit<ExploreFilters, "page">,
  creators: Creator[] = CREATORS
) {
  const out = listings.filter(
    (l) =>
      (f.type === "all" || l.type === f.type) &&
      (f.tool === "all" || l.tool === f.tool) &&
      (!f.tag || l.tags.includes(f.tag)) &&
      matchesPrice(l, f.price) &&
      matchesQuery(l, f.q, creators)
  )
  switch (f.sort) {
    case "newest":
      return out.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    case "price-asc":
      return out.sort((a, b) => a.price - b.price)
    default:
      return out.sort((a, b) => b.trendingScore - a.trendingScore)
  }
}

/** Filter, sort and paginate. */
export async function searchListings(f: ExploreFilters) {
  const { listings, creators } = await getCatalog()
  const all = filterListings([...listings], f, creators)
  const pageCount = Math.max(1, Math.ceil(all.length / EXPLORE_PAGE_SIZE))
  const page = Math.min(f.page, pageCount)
  return {
    items: all.slice((page - 1) * EXPLORE_PAGE_SIZE, page * EXPLORE_PAGE_SIZE),
    total: all.length,
    page,
    pageCount,
  }
}
