import Link from "next/link"
import { ChevronLeftIcon, ChevronRightIcon, SearchXIcon } from "lucide-react"

import { EmptyState } from "@/components/shared/empty-state"
import { ListingCard, ListingCardSkeleton } from "@/components/shared/listing-card"
import { EXPLORE_PAGE_SIZE, getCreator, searchListings } from "@/lib/data"
import { exploreHref } from "@/lib/explore-params"
import type { ExploreFilters } from "@/lib/types"
import { cn } from "@/lib/utils"

const GRID = "grid grid-cols-1 gap-5 sm:grid-cols-2 md:gap-6 lg:grid-cols-3"

export async function ExploreGrid({ filters }: { filters: ExploreFilters }) {
  const { items, total, page, pageCount } = await searchListings(filters)

  if (total === 0) {
    return (
      <div className="py-12">
        <EmptyState
          icon={SearchXIcon}
          title="No recipes match"
          description={
            filters.q
              ? `Nothing found for "${filters.q}". Try a different word or tool.`
              : "Try another tool or media type to see more results."
          }
          action={{ label: "Clear filters", href: "/explore" }}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-10">
      <p className="sr-only" aria-live="polite">
        {total} recipes, page {page} of {pageCount}
      </p>
      <ul className={GRID}>
        {items.map((listing, i) => (
          <li key={listing.id}>
            <ListingCard
              listing={listing}
              creator={getCreator(listing.creatorId)}
              priority={i < 3}
            />
          </li>
        ))}
      </ul>
      {pageCount > 1 && <Pagination filters={filters} page={page} pageCount={pageCount} />}
    </div>
  )
}

function Pagination({
  filters,
  page,
  pageCount,
}: {
  filters: ExploreFilters
  page: number
  pageCount: number
}) {
  const arrow =
    "flex size-10 items-center justify-center rounded-full bg-card ring-1 ring-foreground/10 transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-4">
      {page > 1 ? (
        <Link href={exploreHref({ ...filters, page: page - 1 })} aria-label="Previous page" className={cn(arrow, "hover:bg-muted")}>
          <ChevronLeftIcon className="size-4" aria-hidden />
        </Link>
      ) : (
        <span aria-hidden className={cn(arrow, "opacity-40")}>
          <ChevronLeftIcon className="size-4" />
        </span>
      )}
      <span className="text-sm text-muted-foreground tabular-nums" aria-current="page">
        Page {page} of {pageCount}
      </span>
      {page < pageCount ? (
        <Link href={exploreHref({ ...filters, page: page + 1 })} aria-label="Next page" className={cn(arrow, "hover:bg-muted")}>
          <ChevronRightIcon className="size-4" aria-hidden />
        </Link>
      ) : (
        <span aria-hidden className={cn(arrow, "opacity-40")}>
          <ChevronRightIcon className="size-4" />
        </span>
      )}
    </nav>
  )
}

export function ExploreGridSkeleton() {
  return (
    <div className={GRID} role="status" aria-label="Loading recipes">
      {Array.from({ length: EXPLORE_PAGE_SIZE }, (_, i) => (
        <ListingCardSkeleton key={i} />
      ))}
    </div>
  )
}
