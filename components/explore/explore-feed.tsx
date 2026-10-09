"use client"

import * as React from "react"

import { MasonryTile } from "@/components/explore/masonry-tile"
import { RecipeModal } from "@/components/explore/recipe-modal"
import { useColumnCount } from "@/hooks/use-column-count"
import type { Creator, Listing } from "@/lib/types"

export interface FeedItem {
  listing: Listing
  creator?: Creator
  size: { width: number; height: number } | null
}

/** Tall-to-wide ratio of a tile, for balancing columns */
function ratio(it: FeedItem) {
  return it.size ? it.size.height / it.size.width : 4 / 3
}

/**
 * The masonry feed. Tiles are placed row by row into the shortest column, so the
 * first items (videos lead) sit across the top. A tile opens its recipe in a
 * modal; the URL keeps ?r= so it can be shared.
 */
export function ExploreFeed({ items, initialSlug }: { items: FeedItem[]; initialSlug?: string }) {
  const [openSlug, setOpenSlug] = React.useState<string | null>(initialSlug ?? null)
  const open = items.find((i) => i.listing.slug === openSlug) ?? null
  const count = useColumnCount()
  const columns = React.useMemo(() => {
    const cols = Array.from({ length: count }, () => ({ height: 0, items: [] as { item: FeedItem; index: number }[] }))
    items.forEach((item, index) => {
      const shortest = cols.reduce((a, b) => (b.height < a.height ? b : a))
      shortest.items.push({ item, index })
      shortest.height += ratio(item)
    })
    return cols
  }, [items, count])

  function setUrl(slug: string | null) {
    const url = new URL(window.location.href)
    if (slug) url.searchParams.set("r", slug)
    else url.searchParams.delete("r")
    window.history.replaceState(null, "", url)
  }

  return (
    <>
      <div className="flex items-start gap-3 md:gap-4">
        {columns.map((col, c) => (
          <ul key={c} className="flex min-w-0 flex-1 flex-col">
            {col.items.map(({ item: it, index: i }) => (
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
        ))}
      </div>
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
