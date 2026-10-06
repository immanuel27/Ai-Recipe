import { Reels } from "@/components/discover/reels"
import { VideoIcon } from "@/components/icons"
import { EmptyState } from "@/components/shared/empty-state"
import { getCatalog, getFeedListings } from "@/lib/data"

export default async function DiscoverPage() {
  const [feed, { creators }] = await Promise.all([getFeedListings(), getCatalog()])
  const items = feed.flatMap((listing) => {
    const creator = creators.find((c) => c.id === listing.creatorId)
    return creator ? [{ listing, creator }] : []
  })

  if (items.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-16">
        <EmptyState
          icon={VideoIcon}
          title="Nothing to discover yet"
          description="Be the first to share the recipe behind your shot."
          action={{ label: "Create a listing", href: "/sell" }}
        />
      </div>
    )
  }

  return <Reels items={items} />
}
