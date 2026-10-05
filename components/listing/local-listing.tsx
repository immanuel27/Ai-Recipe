"use client"

import { SearchXIcon } from "lucide-react"

import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/shared/empty-state"
import { ListingDetail } from "@/components/listing/listing-detail"
import { creatorFromUser, useAppStore } from "@/components/providers/app-store"

/** Listings created in this browser live in client state, not mock data. */
export function LocalListing({ slug }: { slug: string }) {
  const { createdListings, user, hydrated } = useAppStore()

  if (!hydrated) return <ListingDetailSkeleton />

  const listing = createdListings.find((l) => l.slug === slug)
  if (!listing || !user) {
    return (
      <div className="py-12">
        <EmptyState
          icon={SearchXIcon}
          title="Recipe not found"
          description="It may have been removed, or the link is wrong."
          action={{ label: "Browse recipes", href: "/explore" }}
        />
      </div>
    )
  }

  return (
    <>
      <title>{`${listing.title} · AI Recipe`}</title>
      <ListingDetail
      listing={listing}
      creator={creatorFromUser(user)}
        more={createdListings.filter((l) => l.slug !== slug)}
      />
    </>
  )
}

export function ListingDetailSkeleton() {
  return (
    <div
      className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-8"
      role="status"
      aria-label="Loading recipe"
    >
      <Skeleton className="aspect-4/5 rounded-xl sm:aspect-square lg:aspect-auto lg:h-[min(78dvh,820px)]" />
      <Skeleton className="h-96 rounded-xl" />
    </div>
  )
}
