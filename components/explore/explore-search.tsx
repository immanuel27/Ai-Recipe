import Link from "next/link"

import { CloseIcon, SearchIcon } from "@/components/icons"
import { EXPLORE_DEFAULTS, exploreHref } from "@/lib/explore-params"
import type { ExploreFilters } from "@/lib/types"

/** The search under the Explore title. Keeps the other filters when you search. */
export function ExploreSearch({ filters }: { filters: ExploreFilters }) {
  const keep = (["type", "tag", "tool", "price", "sort"] as const).filter((k) => filters[k] !== EXPLORE_DEFAULTS[k])
  return (
    <form
      action="/explore"
      role="search"
      className="glass flex h-12 w-full items-center gap-3 rounded-full pr-2 pl-5 focus-within:ring-2 focus-within:ring-ring"
    >
      <SearchIcon aria-hidden className="size-5 shrink-0 text-muted-foreground" />
      <input
        type="search"
        name="q"
        defaultValue={filters.q}
        enterKeyHint="search"
        placeholder="Search prompts, styles, tools or creators"
        aria-label="Search recipes"
        className="h-full min-w-0 flex-1 bg-transparent type-read outline-none placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:hidden"
      />
      {keep.map((k) => (
        <input key={k} type="hidden" name={k} value={filters[k]} />
      ))}
      {filters.q && (
        <Link
          href={exploreHref({ ...filters, q: "", page: 1 })}
          aria-label="Clear search"
          className="flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-foreground/8 hover:text-foreground"
        >
          <CloseIcon aria-hidden className="size-4" />
        </Link>
      )}
    </form>
  )
}
