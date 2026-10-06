import type { Metadata } from "next"
import Link from "next/link"

import { CloseIcon, SearchIcon } from "@/components/icons"
import { CanvasHeader } from "@/components/shell/canvas-header"
import { ExploreChips } from "@/components/explore/explore-chips"
import { ExploreSidebar } from "@/components/explore/explore-sidebar"
import { ExploreFeed } from "@/components/explore/explore-feed"
import { filterListings, getCreator, getFeedListings } from "@/lib/data"
import { EXPLORE_DEFAULTS, exploreHref, isBrowsing, parseExploreParams } from "@/lib/explore-params"
import { posterSize } from "@/lib/poster-size"

export const metadata: Metadata = { title: "Explore" }

export default async function ExplorePage(props: PageProps<"/explore">) {
  const sp = await props.searchParams
  const filters = parseExploreParams(sp)
  const browsing = isBrowsing(filters)
  const feed = getFeedListings()
  const results = filterListings([...feed], filters)

  const toolCounts: Record<string, number> = {}
  for (const l of feed) toolCounts[l.tool] = (toolCounts[l.tool] ?? 0) + 1

  const keep = (["type", "tag", "tool", "price", "sort"] as const).filter((k) => filters[k] !== EXPLORE_DEFAULTS[k])

  return (
    <>
      <CanvasHeader />
      <div className="grid w-full gap-6 px-3 pt-6 pb-16 md:px-6 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-x-12 lg:px-10">
        <aside aria-label="Browse recipes" className="hidden lg:sticky lg:top-8 lg:block lg:self-start">
          <ExploreSidebar filters={filters} toolCounts={toolCounts} />
        </aside>

        <div className="flex min-w-0 flex-col gap-6">
          <header className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex min-w-0 flex-wrap items-baseline gap-x-4 gap-y-2">
              <h1 className="type-headline">What do you want to make?</h1>
              {!browsing && (
                <p className="flex items-baseline gap-3 type-read text-muted-foreground" aria-live="polite">
                  <span className="tabular-nums">
                    {results.length} {results.length === 1 ? "recipe" : "recipes"}
                    {filters.q && <> for “{filters.q}”</>}
                  </span>
                  <Link href="/explore" className="font-semibold text-link hover:underline">
                    Clear
                  </Link>
                </p>
              )}
            </div>
            <form
              action="/explore"
              role="search"
              className="glass flex h-11 w-full items-center gap-3 rounded-full pr-2 pl-4 focus-within:ring-2 focus-within:ring-ring sm:w-80"
            >
              <SearchIcon aria-hidden className="size-5 shrink-0 text-muted-foreground" />
              <input
                type="search"
                name="q"
                defaultValue={filters.q}
                enterKeyHint="search"
                placeholder="Search prompts, styles, creators"
                aria-label="Search recipes"
                className="h-full min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:hidden"
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
          </header>

          <ExploreChips filters={filters} />

          {results.length > 0 ? (
            <ExploreFeed
              items={results.map((l) => ({ listing: l, creator: getCreator(l.creatorId), size: posterSize(l.posterUrl) }))}
              initialSlug={typeof sp.r === "string" ? sp.r : undefined}
            />
          ) : (
            <div className="glass flex flex-col items-center gap-4 rounded-3xl px-6 py-16 text-center">
              <p className="type-section">Nothing matches yet</p>
              <p className="max-w-md type-read text-muted-foreground">
                Try a broader style, another tool, or clear the filters to see every recipe.
              </p>
              <Link href="/explore" className="glass-button rounded-full px-5 py-2 font-semibold">
                See all recipes
              </Link>
            </div>
          )}
        </div>

      </div>
    </>
  )
}
