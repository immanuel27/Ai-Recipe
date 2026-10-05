import { TOOLS } from "@/lib/mock/tools"
import type { ExploreFilters, ExploreSort, ExploreType, ToolId } from "@/lib/types"

export const SORT_OPTIONS: { value: ExploreSort; label: string }[] = [
  { value: "trending", label: "Trending" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
]

export const TYPE_OPTIONS: { value: ExploreType; label: string }[] = [
  { value: "all", label: "All" },
  { value: "video", label: "Video" },
  { value: "image", label: "Image" },
]

type RawParams = { [key: string]: string | string[] | undefined }

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)

/** Parse and validate explore filters from URL search params. */
export function parseExploreParams(params: RawParams): ExploreFilters {
  const type = first(params.type)
  const tool = first(params.tool)
  const sort = first(params.sort)
  const q = (first(params.q) ?? "").trim().slice(0, 80)
  const page = Number.parseInt(first(params.page) ?? "1", 10)
  return {
    type: TYPE_OPTIONS.some((o) => o.value === type) ? (type as ExploreType) : "all",
    tool: TOOLS.some((t) => t.id === tool) ? (tool as ToolId) : "all",
    sort: SORT_OPTIONS.some((o) => o.value === sort) ? (sort as ExploreSort) : "trending",
    q,
    page: Number.isFinite(page) && page > 0 ? page : 1,
  }
}

const DEFAULTS: Omit<ExploreFilters, "page"> = { type: "all", tool: "all", sort: "trending", q: "" }

/** Build an /explore URL from filters, dropping defaults. Any change resets to page 1 unless given. */
export function exploreHref(f: Partial<ExploreFilters>) {
  const sp = new URLSearchParams()
  for (const key of ["q", "type", "tool", "sort"] as const) {
    const v = f[key]
    if (v && v !== DEFAULTS[key]) sp.set(key, v)
  }
  if (f.page && f.page > 1) sp.set("page", String(f.page))
  const qs = sp.toString()
  return qs ? `/explore?${qs}` : "/explore"
}
