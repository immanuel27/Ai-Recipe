import { TOOLS } from "@/lib/mock/tools"
import type { ExploreFilters, ExplorePrice, ExploreSort, ExploreType, ToolId } from "@/lib/types"

export const SORT_OPTIONS: { value: ExploreSort; label: string }[] = [
  { value: "trending", label: "Trending" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
]

export const TYPE_OPTIONS: { value: ExploreType; label: string }[] = [
  { value: "all", label: "All" },
  { value: "video", label: "Videos" },
  { value: "image", label: "Images" },
  { value: "website", label: "Websites" },
]

export const PRICE_OPTIONS: { value: ExplorePrice; label: string }[] = [
  { value: "any", label: "Any price" },
  { value: "free", label: "Free" },
  { value: "under-10", label: "Under $10" },
  { value: "10-20", label: "$10 to $20" },
  { value: "over-20", label: "Over $20" },
]

/** Styles promoted to tabs, next to the media types */
export const STYLE_TABS = [
  { tag: "cartoon", label: "Cartoon" },
  { tag: "cinematic", label: "Cinematic" },
  { tag: "anime", label: "Anime" },
  { tag: "sci-fi", label: "Sci-fi" },
]

type RawParams = { [key: string]: string | string[] | undefined }

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)

/** Parse and validate explore filters from URL search params. */
export function parseExploreParams(params: RawParams): ExploreFilters {
  const type = first(params.type)
  const tool = first(params.tool)
  const sort = first(params.sort)
  const price = first(params.price)
  const tag = (first(params.tag) ?? "").trim().toLowerCase().slice(0, 40)
  const q = (first(params.q) ?? "").trim().slice(0, 80)
  const page = Number.parseInt(first(params.page) ?? "1", 10)
  return {
    // Explore opens on Videos; ?type=all still shows everything
    type: TYPE_OPTIONS.some((o) => o.value === type) ? (type as ExploreType) : EXPLORE_DEFAULTS.type,
    tool: TOOLS.some((t) => t.id === tool) ? (tool as ToolId) : "all",
    tag,
    price: PRICE_OPTIONS.some((o) => o.value === price) ? (price as ExplorePrice) : "any",
    sort: SORT_OPTIONS.some((o) => o.value === sort) ? (sort as ExploreSort) : "trending",
    q,
    page: Number.isFinite(page) && page > 0 ? page : 1,
  }
}

export const EXPLORE_DEFAULTS: Omit<ExploreFilters, "page"> = {
  type: "video",
  tool: "all",
  tag: "",
  price: "any",
  sort: "trending",
  q: "",
}

/** Nothing narrowed: show the welcome, shelves and the full grid */
export function isBrowsing(f: ExploreFilters) {
  return (Object.keys(EXPLORE_DEFAULTS) as (keyof typeof EXPLORE_DEFAULTS)[]).every(
    (k) => f[k] === EXPLORE_DEFAULTS[k]
  ) && f.page === 1
}

/** Build an /explore URL from filters, dropping defaults. Any change resets to page 1 unless given. */
export function exploreHref(f: Partial<ExploreFilters>) {
  const sp = new URLSearchParams()
  for (const key of ["q", "type", "tag", "tool", "price", "sort"] as const) {
    const v = f[key]
    if (v && v !== EXPLORE_DEFAULTS[key]) sp.set(key, v)
  }
  if (f.page && f.page > 1) sp.set("page", String(f.page))
  const qs = sp.toString()
  return qs ? `/explore?${qs}` : "/explore"
}
