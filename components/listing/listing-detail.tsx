"use client"

import * as React from "react"
import Link from "next/link"
import { toast } from "sonner"

import { BuyDialog } from "@/components/listing/buy-dialog"
import { FailuresGallery } from "@/components/listing/failures-gallery"
import { ListingMedia } from "@/components/listing/listing-media"
import { MediaCreditLine } from "@/components/listing/media-credit"
import { PurchaseCard } from "@/components/listing/purchase-card"
import { WhatsInside } from "@/components/listing/whats-inside"
import { ListingCard } from "@/components/shared/listing-card"
import { useAppStore, userCreatorId } from "@/components/providers/app-store"
import { profileHref } from "@/lib/profile"
import type { Creator, Listing } from "@/lib/types"

export function ListingDetail({
  listing,
  creator,
  more,
}: {
  listing: Listing
  creator: Creator
  more: Listing[]
}) {
  const { purchased, purchase, user } = useAppStore()
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const isOwner = !!user && listing.creatorId === userCreatorId(user.username)
  const unlocked = isOwner || purchased.includes(listing.slug)

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
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-8">
        <div className="flex flex-col gap-2 lg:col-start-1">
          <ListingMedia listing={listing} />
          {listing.credit && <MediaCreditLine credit={listing.credit} />}
        </div>
        <div className="lg:sticky lg:top-24 lg:col-start-2 lg:row-span-3 lg:row-start-1 lg:self-start">
          <PurchaseCard listing={listing} creator={creator} unlocked={unlocked} onBuy={onBuy} />
        </div>
        <div className="lg:col-start-1">
          <WhatsInside listing={listing} unlocked={unlocked} onBuy={onBuy} />
        </div>
        <div className="lg:col-start-1">
          <FailuresGallery failures={listing.recipe.failures} unlocked={unlocked} />
        </div>
      </div>

      <section className="mt-12 flex flex-col gap-4" aria-labelledby="more-heading">
        <div className="flex items-baseline justify-between gap-4">
          <h2 id="more-heading" className="text-xl font-bold tracking-tight">
            More from {creator.displayName}
          </h2>
          <Link
            href={profileHref(creator.username)}
            className="shrink-0 rounded-sm text-sm font-semibold text-primary outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            View profile
          </Link>
        </div>
        {more.length === 0 ? (
          <p className="text-sm text-muted-foreground">No other recipes from this creator yet.</p>
        ) : (
          <ul className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:px-0">
            {more.map((l) => (
              <li key={l.id} className="w-72 shrink-0 snap-start">
                <ListingCard listing={l} creator={creator} sizes="288px" />
              </li>
            ))}
          </ul>
        )}
      </section>

      <BuyDialog
        listing={listing}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onConfirm={onConfirm}
      />
    </>
  )
}
