import { ClapperboardIcon } from "lucide-react"

import { Feed } from "@/components/feed/feed"
import { EmptyState } from "@/components/shared/empty-state"
import { getCreator, getFeedListings } from "@/lib/data"

export default function HomePage() {
  const items = getFeedListings().flatMap((listing) => {
    const creator = getCreator(listing.creatorId)
    return creator ? [{ listing, creator }] : []
  })

  if (items.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 pt-8 pb-28 md:pb-16">
        <EmptyState
          icon={ClapperboardIcon}
          title="Nothing in the feed yet"
          description="Be the first to share a recipe behind your shot."
          action={{ label: "Create a listing", href: "/sell" }}
        />
      </div>
    )
  }

  return <Feed items={items} />
}
