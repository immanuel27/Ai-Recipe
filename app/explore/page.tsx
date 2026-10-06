import type { Metadata } from "next"
import Link from "next/link"

import { ThemeToggle } from "@/components/shell/canvas-header"
import { Logo } from "@/components/shell/logo"
import { ExploreChips } from "@/components/explore/explore-chips"
import { ExploreSidebar } from "@/components/explore/explore-sidebar"
import { ExploreFeed } from "@/components/explore/explore-feed"
import { ExploreSearch } from "@/components/explore/explore-search"
import { filterListings, getCreator, getFeedListings } from "@/lib/data"
import { isBrowsing, parseExploreParams } from "@/lib/explore-params"
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

  return (
    <>
      <div className="grid w-full gap-6 px-3 pt-4 pb-16 md:px-6 md:pt-8 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-x-12 lg:px-10">
        <aside aria-label="Browse recipes" className="hidden lg:sticky lg:top-8 lg:block lg:self-start">
          <ExploreSidebar filters={filters} toolCounts={toolCounts} />
        </aside>

        <div className="flex min-w-0 flex-col gap-8">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4">
              {/* One row with the sidebar's logo: title left, theme right (phones get the logo here) */}
              <div className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-4">
                <div className="lg:hidden">
                  <Logo />
                </div>
                <div className="col-start-2 row-start-1">
                  <ThemeToggle />
                </div>
                <h1 className="col-span-2 type-headline lg:col-span-1 lg:col-start-1 lg:row-start-1">
                  What do you want to make?
                </h1>
              </div>
              <ExploreSearch filters={filters} />
            </div>
            <ExploreChips filters={filters} count={results.length} filtered={!browsing} />
          </div>

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
