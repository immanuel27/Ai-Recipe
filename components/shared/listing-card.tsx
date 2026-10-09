"use client"

import * as React from "react"
import Link from "next/link"
import { ImagesIcon, PlayIcon } from "lucide-react"

import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { CreatorAvatar } from "@/components/shared/creator-avatar"
import { MediaImage } from "@/components/shared/media-image"
import { clipSrc, useClipLoop } from "@/components/shared/use-clip"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { formatPrice } from "@/lib/format"
import { profileHref } from "@/lib/profile"
import type { Creator, Listing } from "@/lib/types"
import { cn } from "@/lib/utils"
import { VerifiedBadge } from "@/components/shared/verified-badge"

export function ListingCard({
  listing,
  creator,
  className,
  priority,
  sizes = "(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw",
}: {
  listing: Listing
  creator?: Creator
  className?: string
  priority?: boolean
  sizes?: string
}) {
  const reducedMotion = usePrefersReducedMotion()
  const [previewing, setPreviewing] = React.useState(false)
  const previewRef = React.useRef<HTMLVideoElement>(null)
  useClipLoop(previewRef, listing.clip, previewing)
  const isVideo = listing.type === "video"
  // Video loads only on hover (fine pointers) or keyboard focus; never with reduced motion
  const canPreview = isVideo && !reducedMotion

  return (
    <Card
      onPointerEnter={(e) => canPreview && e.pointerType === "mouse" && setPreviewing(true)}
      onPointerLeave={() => setPreviewing(false)}
      onFocus={() => canPreview && setPreviewing(true)}
      onBlur={() => setPreviewing(false)}
      className={cn(
        "group relative gap-0 rounded-2xl p-3 transition-shadow focus-within:ring-2 focus-within:ring-ring hover:shadow-lg",
        className
      )}
    >
      <div className="relative aspect-12/13 overflow-hidden rounded-xl bg-muted">
        <MediaImage
          src={listing.posterUrl}
          alt={listing.title}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover transition-transform duration-500 motion-safe:group-hover:scale-[1.03]"
        />
        {previewing && (
          <video
            ref={previewRef}
            src={clipSrc(listing)}
            poster={listing.posterUrl}
            muted
            loop
            playsInline
            autoPlay
            preload="auto"
            aria-hidden
            className="absolute inset-0 size-full object-cover"
          />
        )}
        {(listing.isAdult || listing.verified) && (
          <span className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            {listing.verified && <VerifiedBadge tool={listing.tool} onMedia />}
            {listing.isAdult && (
              <span className="rounded-full bg-scrim/70 px-2 py-0.5 text-xs font-semibold text-on-media backdrop-blur-md">
                18+
              </span>
            )}
          </span>
        )}
        {(listing.images?.length ?? 0) > 1 && (
          <span className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-scrim/60 px-2 py-0.5 text-xs font-semibold text-on-media backdrop-blur-md">
            <ImagesIcon className="size-3.5" aria-hidden />
            {listing.images!.length}
            <span className="sr-only">images</span>
          </span>
        )}
        {isVideo && (
          <span
            className={cn(
              "absolute right-3 bottom-3 flex size-10 items-center justify-center rounded-full bg-on-media/20 text-on-media ring-1 ring-on-media/40 backdrop-blur-md transition-opacity",
              previewing && "opacity-0"
            )}
          >
            <PlayIcon className="size-4 fill-current" aria-hidden />
            <span className="sr-only">Video</span>
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2 px-1 pt-4 pb-1">
        <h3 className="line-clamp-1 text-lg font-semibold tracking-tight">
          {/* Stretched link makes the whole card clickable with one tab stop */}
          <Link
            href={`/r/${listing.slug}`}
            className="outline-none after:absolute after:inset-0 after:rounded-2xl"
          >
            {listing.title}
          </Link>
        </h3>
        <p className="line-clamp-2 min-h-10 text-sm text-muted-foreground">
          {listing.description}
        </p>
        <div className="mt-2 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            {creator && (
              // Sits above the card's stretched link so it can go to the profile
              <Link
                href={profileHref(creator.username)}
                className="relative z-10 flex min-w-0 items-center gap-2 rounded-full outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <CreatorAvatar creator={creator} className="size-9" />
                <span className="truncate text-sm font-medium">{creator.displayName}</span>
              </Link>
            )}
          </div>
          <span className="shrink-0 text-3xl font-bold tracking-tight text-primary tabular-nums">
            {formatPrice(listing.price)}
          </span>
        </div>
      </div>
    </Card>
  )
}

export function ListingCardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn("gap-0 rounded-2xl p-3", className)} aria-hidden>
      <Skeleton className="aspect-12/13 rounded-xl" />
      <div className="flex flex-col gap-2 px-1 pt-4 pb-1">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="size-9 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-8 w-14" />
        </div>
      </div>
    </Card>
  )
}
