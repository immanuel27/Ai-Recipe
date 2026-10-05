import type { LucideIcon } from "lucide-react"

import { EmptyState } from "@/components/shared/empty-state"
import { ListingCard } from "@/components/shared/listing-card"
import type { Creator, Listing } from "@/lib/types"

/** Grid of listing cards with an empty state. */
export function PostsGrid({
  items,
  empty,
}: {
  items: { listing: Listing; creator?: Creator }[]
  empty: {
    icon: LucideIcon
    title: string
    description: string
    action?: { label: string; href: string }
  }
}) {
  if (items.length === 0) {
    return <EmptyState {...empty} className="mx-0 mt-2" />
  }
  return (
    <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:gap-6 xl:grid-cols-3">
      {items.map(({ listing, creator }, i) => (
        <li key={listing.id}>
          <ListingCard listing={listing} creator={creator} priority={i < 3} />
        </li>
      ))}
    </ul>
  )
}
