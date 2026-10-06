"use client"

import * as React from "react"
import Link from "next/link"
import { toast } from "sonner"

import { BuyDialog } from "@/components/listing/buy-dialog"
import { FailuresGallery } from "@/components/listing/failures-gallery"
import { ListingMedia } from "@/components/listing/listing-media"
import { MediaCreditLine } from "@/components/listing/media-credit"
import { PurchaseCard } from "@/components/listing/purchase-card"
import { RecipeBreadcrumb } from "@/components/listing/recipe-breadcrumb"
import { WhatsInside } from "@/components/listing/whats-inside"
import { MasonryTile } from "@/components/explore/masonry-tile"
import { useOwnedRecipe } from "@/components/shared/use-owned-recipe"
import { useAppStore, userCreatorId } from "@/components/providers/app-store"
import { profileHref } from "@/lib/profile"
import type { Creator, Listing } from "@/lib/types"

export function ListingDetail({
  listing: baseListing,
  creator,
  more,
}: {
  listing: Listing
  creator: Creator
  more: Listing[]
}) {
  const { purchased, purchase, user } = useAppStore()
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const isOwner = !!user && baseListing.creatorId === userCreatorId(user.username)
  const unlocked = isOwner || purchased.includes(baseListing.slug)
  // Swap in the full recipe from Supabase once it's theirs
  const listing = useOwnedRecipe(baseListing, unlocked)

  function revealRecipe() {
    requestAnimationFrame(() =>
      document.getElementById("recipe")?.scrollIntoView({ block: "start" })
    )
  }

  function onBuy() {
    if (listing.price === 0) {
      purchase(listing.slug)
      toast.success("Recipe unlocked")
      revealRecipe()
    } else {
      setDialogOpen(true)
    }
  }

  function onConfirm() {
    purchase(listing.slug)
    setDialogOpen(false)
    toast.success("Purchase complete: recipe unlocked")
    revealRecipe()
  }

  return (
    <>
      <div className="mb-6 md:mb-8">
        <RecipeBreadcrumb listing={listing} />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-8">
        <div className="flex flex-col gap-2 lg:col-start-1">
          <ListingMedia listing={listing} />
          {listing.credit && <MediaCreditLine credit={listing.credit} />}
        </div>
        <div className="lg:sticky lg:top-6 lg:col-start-2 lg:row-span-3 lg:row-start-1 lg:self-start">
          <PurchaseCard listing={listing} creator={creator} unlocked={unlocked} onBuy={onBuy} />
        </div>
        <div className="lg:col-start-1">
          <WhatsInside listing={listing} unlocked={unlocked} onBuy={onBuy} />
        </div>
        <div className="lg:col-start-1">
          <FailuresGallery failures={listing.recipe.failures} unlocked={unlocked} />
        </div>
      </div>

      {/* Only when there is more to see */}
      {more.length > 0 && (
        <section className="mt-12 flex flex-col gap-6" aria-labelledby="more-heading">
          <div className="flex items-center justify-between gap-4">
            <h2 id="more-heading" className="type-section">
              More from {creator.displayName}
            </h2>
            <Link
              href={profileHref(creator.username)}
              className="glass-button shrink-0 rounded-full px-4 py-2 type-body font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              See all
            </Link>
          </div>
          <ul className="columns-2 gap-3 md:columns-3 md:gap-4 xl:columns-4">
            {more.slice(0, 8).map((l) => (
              <MasonryTile key={l.id} listing={l} creator={creator} size={null} />
            ))}
          </ul>
        </section>
      )}

      <BuyDialog
        listing={listing}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onConfirm={onConfirm}
      />
    </>
  )
}
