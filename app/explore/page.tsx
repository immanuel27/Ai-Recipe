import { Suspense } from "react"
import type { Metadata } from "next"

import { ExploreGrid, ExploreGridSkeleton } from "@/components/explore/explore-grid"
import { ExploreHero } from "@/components/explore/explore-hero"
import { FilterBar } from "@/components/explore/filter-bar"
import { TypePills } from "@/components/explore/type-pills"
import { parseExploreParams } from "@/lib/explore-params"

export const metadata: Metadata = { title: "Explore" }

export default async function ExplorePage(props: PageProps<"/explore">) {
  const filters = parseExploreParams(await props.searchParams)

  return (
    <>
      <ExploreHero filters={filters} />
      <div className="mx-auto w-full max-w-6xl px-4 pb-12 md:px-6 md:pb-16">
        <TypePills filters={filters} />
        <div className="mt-8 mb-6 flex items-center justify-between gap-4 md:mt-12">
          <h2 className="truncate text-xl font-semibold tracking-tight">
            {filters.q ? `Results for “${filters.q}”` : "All recipes"}
          </h2>
          <FilterBar filters={filters} />
        </div>
        {/* Keyed so the skeleton shows while a new filter combination loads */}
        <Suspense key={JSON.stringify(filters)} fallback={<ExploreGridSkeleton />}>
          <ExploreGrid filters={filters} />
        </Suspense>
      </div>
    </>
  )
}
