"use client"

import * as React from "react"
import Link from "next/link"

import { GoIcon } from "@/components/icons"
import { CreatorAvatar } from "@/components/shared/creator-avatar"
import { MediaImage } from "@/components/shared/media-image"
import { ToolLogo } from "@/components/shared/tool-logo"
import { clipSrc, useClipLoop } from "@/components/shared/use-clip"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { formatPrice } from "@/lib/format"
import { getToolName } from "@/lib/mock/tools"
import { profileHref } from "@/lib/profile"
import type { Creator, Listing } from "@/lib/types"
import { AiTagBadge } from "@/components/shared/ai-tag-badge"

/**
 * One shot at its true shape. Videos loop silently while on screen; hover
 * reveals what it is, the tool and the price. The whole tile opens the recipe.
 */
export function MasonryTile({
  listing,
  creator,
  size,
  priority,
  onOpen,
}: {
  listing: Listing
  creator?: Creator
  /** The poster's real pixel size, so the tile holds its shape before loading */
  size: { width: number; height: number } | null
  priority?: boolean
  /** Open the recipe in place; modified clicks still go to the full page */
  onOpen?: () => void
}) {
  const ref = React.useRef<HTMLLIElement>(null)
  const videoRef = React.useRef<HTMLVideoElement>(null)
  const [inView, setInView] = React.useState(false)
  const reducedMotion = usePrefersReducedMotion()
  const isVideo = listing.type === "video"
  useClipLoop(videoRef, listing.clip)

  React.useEffect(() => {
    const el = ref.current
    if (!el || !isVideo) return
    const io = new IntersectionObserver(([e]) => setInView(!!e?.isIntersecting), { threshold: 0.3 })
    io.observe(el)
    return () => io.disconnect()
  }, [isVideo])

  React.useEffect(() => {
    const v = videoRef.current
    if (!v) return
    if (inView && !reducedMotion) v.play().catch(() => {})
    else v.pause()
  }, [inView, reducedMotion])

  const width = size?.width ?? 900
  const height = size?.height ?? 1200

  return (
    <li ref={ref} className="mb-4 break-inside-avoid">
      <div className="group relative overflow-hidden rounded-2xl bg-muted focus-within:ring-2 focus-within:ring-ring">
        <MediaImage
          src={listing.posterUrl}
          alt=""
          width={width}
          height={height}
          sizes="(min-width: 1536px) 25vw, (min-width: 1024px) 33vw, 50vw"
          priority={priority}
          className="h-auto w-full transition-transform duration-500 ease-enter group-hover:scale-[1.03]"
        />
        {isVideo && (
          <video
            ref={videoRef}
            src={clipSrc(listing)}
            poster={listing.posterUrl}
            muted
            loop
            playsInline
            preload={inView ? "auto" : "none"}
            aria-hidden
            className="absolute inset-0 size-full object-cover transition-transform duration-500 ease-enter group-hover:scale-[1.03]"
          />
        )}

        {listing.aiTag && (
          <AiTagBadge tag={listing.aiTag} onMedia className="pointer-events-none absolute top-3 right-3" />
        )}

        {/* Revealed on hover: what it is and what it costs */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-linear-to-t from-scrim/80 via-scrim/10 to-scrim/30 opacity-0 transition-opacity duration-240 group-focus-within:opacity-100 group-hover:opacity-100"
        />
        <span className="glass-chip pointer-events-none absolute top-3 left-3 flex -translate-y-1 items-center gap-2 rounded-full px-3 py-1 type-meta font-semibold text-on-media opacity-0 transition duration-240 ease-enter group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:translate-y-0 group-hover:opacity-100">
          <ToolLogo tool={listing.tool} />
          {getToolName(listing.tool)}
          <span className="tabular-nums opacity-80">{formatPrice(listing.price)}</span>
        </span>

        <span className="absolute inset-x-0 bottom-0 flex items-end gap-3 p-3 text-on-media">
          {creator && (
            <Link
              href={profileHref(creator.username)}
              aria-label={`${creator.displayName} profile`}
              className="relative z-10 shrink-0 rounded-full outline-none ring-2 ring-on-media/40 focus-visible:ring-on-media"
            >
              <CreatorAvatar creator={creator} className="size-9" />
            </Link>
          )}
          <Link
            href={`/r/${listing.slug}`}
            onClick={(e) => {
              if (!onOpen || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
              e.preventDefault()
              onOpen()
            }}
            className="min-w-0 flex-1 translate-y-1 truncate pb-2 type-body font-semibold opacity-0 outline-none transition duration-240 ease-enter group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:translate-y-0 group-hover:opacity-100 after:absolute after:inset-0"
          >
            {listing.title}
          </Link>
          <span aria-hidden className="glass-chip relative flex size-9 shrink-0 items-center justify-center rounded-full">
            <GoIcon className="size-4" />
          </span>
        </span>
      </div>
    </li>
  )
}
