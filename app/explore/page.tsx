import type { Metadata } from "next"
import Link from "next/link"

import { Logo } from "@/components/shell/logo"
import { ExploreChips } from "@/components/explore/explore-chips"
import { ExploreSidebar } from "@/components/explore/explore-sidebar"
import { ExploreFeed } from "@/components/explore/explore-feed"
import { ExploreSearch } from "@/components/explore/explore-search"
import { filterListings, getCatalog, getFeedListings } from "@/lib/data"
import { isBrowsing, parseExploreParams } from "@/lib/explore-params"
import { posterSize } from "@/lib/poster-size"
import { listingTools } from "@/lib/mock/tools"

export const metadata: Metadata = { title: "Explore" }

export default async function ExplorePage(props: PageProps<"/explore">) {
  const sp = await props.searchParams
  const filters = parseExploreParams(sp)
  const browsing = isBrowsing(filters)
  const [feed, { creators }] = await Promise.all([getFeedListings(), getCatalog()])
  const results = filterListings([...feed], filters, creators)

  const toolCounts: Record<string, number> = {}
  for (const l of feed) for (const t of listingTools(l)) toolCounts[t] = (toolCounts[t] ?? 0) + 1

  return (
    <>
      <div className="grid w-full gap-6 px-3 pt-4 pb-16 md:px-6 md:pt-8 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-x-12 lg:px-10">
        <aside aria-label="Browse recipes" className="hidden lg:sticky lg:top-8 lg:block lg:self-start">
          <ExploreSidebar filters={filters} toolCounts={toolCounts} />
        </aside>

        <div className="flex min-w-0 flex-col gap-8">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4">
              {/* One row with the sidebar's logo: the title (phones get the logo here) */}
              <div className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-4">
                <div className="lg:hidden">
                  <Logo />
                </div>
                <h1 className="col-span-2 type-headline lg:col-span-1 lg:col-start-1 lg:row-start-1">
                  Steal the Recipy, make it your own.
                </h1>
              </div>
              <ExploreSearch filters={filters} />
            </div>
            <ExploreChips filters={filters} count={results.length} filtered={!browsing} />
          </div>

          {results.length > 0 ? (
            <ExploreFeed
              items={results.map((l) => ({ listing: l, creator: creators.find((c) => c.id === l.creatorId), size: posterSize(l.posterUrl) }))}
              initialSlug={typeof sp.r === "string" ? sp.r : undefined}
            />
          ) : (
            <div className="glass flex flex-col items-center gap-4 rounded-3xl px-6 py-16 text-center">
              {filters.type === "website" ? (
                <>
                  <p className="type-section">No website recipes yet</p>
                  <p className="max-w-md type-read text-muted-foreground">
                    Built a site with ChatGPT, Claude, Lovable, Figma Make or Framer? Be the first to sell how.
                  </p>
                  <Link href="/sell" className="glass-button rounded-full px-5 py-2 font-semibold">
                    Post a website recipe
                  </Link>
                </>
              ) : (
                <>
                  <p className="type-section">Nothing matches yet</p>
                  <p className="max-w-md type-read text-muted-foreground">
                    Try a broader style, another tool, or clear the filters to see every recipe.
                  </p>
                  <Link href="/explore" className="glass-button rounded-full px-5 py-2 font-semibold">
                    See all recipes
                  </Link>
                </>
              )}
            </div>
          )}
        </div>

      </div>
    </>
  )
}
