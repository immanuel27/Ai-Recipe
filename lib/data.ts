import { CREATORS } from "@/lib/mock/creators"
import { LISTINGS } from "@/lib/mock/listings"
import { getToolName } from "@/lib/mock/tools"
import type { ExploreFilters, Listing } from "@/lib/types"

// Thin data-access layer over mock data. Swap for real queries later.

export function getFeedListings() {
  return [...LISTINGS].sort((a, b) => b.trendingScore - a.trendingScore)
}

export function getListing(slug: string) {
  return LISTINGS.find((l) => l.slug === slug)
}

export function getCreators() {
  return CREATORS
}

export function getCreator(id: string) {
  return CREATORS.find((c) => c.id === id)
}

export function getCreatorByUsername(username: string) {
  return CREATORS.find((c) => c.username === username)
}

export function getCreatorListings(creatorId: string, excludeSlug?: string) {
  return LISTINGS.filter((l) => l.creatorId === creatorId && l.slug !== excludeSlug)
}

export const EXPLORE_PAGE_SIZE = 24

function matchesQuery(l: Listing, q: string) {
  if (!q) return true
  const creator = getCreator(l.creatorId)
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

export function filterListings(listings: Listing[], f: Omit<ExploreFilters, "page">) {
  const out = listings.filter(
    (l) =>
      (f.type === "all" || l.type === f.type) &&
      (f.tool === "all" || l.tool === f.tool) &&
      (!f.tag || l.tags.includes(f.tag)) &&
      matchesPrice(l, f.price) &&
      matchesQuery(l, f.q)
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

/** Filter, sort and paginate. Simulates network latency so loading skeletons are visible. */
export async function searchListings(f: ExploreFilters) {
  await new Promise((r) => setTimeout(r, 350))
  const all = filterListings([...LISTINGS], f)
  const pageCount = Math.max(1, Math.ceil(all.length / EXPLORE_PAGE_SIZE))
  const page = Math.min(f.page, pageCount)
  return {
    items: all.slice((page - 1) * EXPLORE_PAGE_SIZE, page * EXPLORE_PAGE_SIZE),
    total: all.length,
    page,
    pageCount,
  }
}
