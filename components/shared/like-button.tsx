"use client"

import * as React from "react"
import { HeartIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useAppStore } from "@/components/providers/app-store"
import { formatCompact } from "@/lib/format"
import { playLikeSound } from "@/lib/sounds"
import type { Listing } from "@/lib/types"
import { cn } from "@/lib/utils"

export function useLike(listing: Listing) {
  const { liked, toggleLike } = useAppStore()
  const isLiked = liked.includes(listing.slug)
  return {
    isLiked,
    count: listing.stats.likes + (isLiked ? 1 : 0),
    toggle: () => {
      const nowLiked = toggleLike(listing.slug)
      if (nowLiked) playLikeSound()
      return nowLiked
    },
  }
}

/**
 * Heart toggle with a like count.
 * - "media": stacked icon + count for the feed's action rail over video/images
 * - "default": inline pill for light surfaces
 */
export function LikeButton({
  listing,
  variant = "default",
  className,
}: {
  listing: Listing
  variant?: "default" | "media"
  className?: string
}) {
  const { isLiked, count, toggle } = useLike(listing)
  // Bumped on each like so the pop animation replays
  const [pop, setPop] = React.useState(0)

  function onClick() {
    if (toggle()) setPop((n) => n + 1)
  }

  const heart = (
    <HeartIcon
      key={pop}
      aria-hidden
      className={cn(
        isLiked && "fill-current text-like",
        pop > 0 && isLiked && "motion-safe:animate-[like-pop_320ms_ease-out]"
      )}
    />
  )
  const label = isLiked ? `Unlike ${listing.title}` : `Like ${listing.title}`

  if (variant === "media") {
    return (
      <div className={cn("flex flex-col items-center gap-1", className)}>
        <Button
          variant="ghost"
          size="icon-pill"
          onClick={onClick}
          aria-label={label}
          aria-pressed={isLiked}
          className="bg-on-media/15 text-on-media backdrop-blur-md hover:bg-on-media/25 hover:text-on-media focus-visible:ring-on-media/60"
        >
          {heart}
        </Button>
        <span className="text-xs font-medium tabular-nums" aria-hidden>
          {formatCompact(count)}
        </span>
      </div>
    )
  }

  return (
    <Button
      variant="outline"
      size="pill-sm"
      onClick={onClick}
      aria-label={`${label} (${count} likes)`}
      aria-pressed={isLiked}
      className={cn("tabular-nums", isLiked && "border-like/30 bg-like/10 hover:bg-like/15", className)}
    >
      {heart}
      {formatCompact(count)}
    </Button>
  )
}
