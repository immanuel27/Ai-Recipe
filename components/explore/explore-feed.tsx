"use client"

import * as React from "react"

import { MasonryTile } from "@/components/explore/masonry-tile"
import { RecipeModal } from "@/components/explore/recipe-modal"
import type { Creator, Listing } from "@/lib/types"

export interface FeedItem {
  listing: Listing
  creator?: Creator
  size: { width: number; height: number } | null
}

/** The masonry feed. A tile opens its recipe in a modal; the URL keeps ?r= so it can be shared. */
export function ExploreFeed({ items, initialSlug }: { items: FeedItem[]; initialSlug?: string }) {
  const [openSlug, setOpenSlug] = React.useState<string | null>(initialSlug ?? null)
  const open = items.find((i) => i.listing.slug === openSlug) ?? null

  function setUrl(slug: string | null) {
    const url = new URL(window.location.href)
    if (slug) url.searchParams.set("r", slug)
    else url.searchParams.delete("r")
    window.history.replaceState(null, "", url)
  }

  return (
    <>
      <ul className="columns-2 gap-3 md:gap-4 xl:columns-3 2xl:columns-4">
        {items.map((it, i) => (
          <MasonryTile
            key={it.listing.id}
            listing={it.listing}
            creator={it.creator}
            size={it.size}
            priority={i < 4}
            onOpen={() => {
              setOpenSlug(it.listing.slug)
              setUrl(it.listing.slug)
            }}
          />
        ))}
      </ul>
      <RecipeModal
        entry={open}
        onOpenChange={(o) => {
          if (!o) {
            setOpenSlug(null)
            setUrl(null)
          }
        }}
      />
    </>
  )
}
