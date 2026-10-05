"use client"

import * as React from "react"
import Link from "next/link"
import {
  BookmarkIcon,
  HeartIcon,
  PlayIcon,
  Share2Icon,
  Volume2Icon,
  VolumeXIcon,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { CreatorAvatar } from "@/components/shared/creator-avatar"
import { LikeButton, useLike } from "@/components/shared/like-button"
import { fitFor, useFrameAspect, useVideoAspect } from "@/components/shared/fit-media"
import { MediaCarousel, type MediaCarouselHandle } from "@/components/shared/media-carousel"
import { clipSrc, useClipLoop } from "@/components/shared/use-clip"
import { ToolBadge } from "@/components/shared/tool-badge"
import { useAppStore } from "@/components/providers/app-store"
import { formatCompact, formatPrice } from "@/lib/format"
import { profileHref } from "@/lib/profile"
import type { Creator, Listing } from "@/lib/types"
import { cn } from "@/lib/utils"

export interface FeedEntry {
  listing: Listing
  creator: Creator
}

/** Max gap between two taps to count as a double-tap */
const DOUBLE_TAP_MS = 260

const railButton =
  "bg-on-media/15 text-on-media backdrop-blur-md hover:bg-on-media/25 hover:text-on-media focus-visible:ring-on-media/60"

export function FeedItem({
  entry: { listing, creator },
  index,
  active,
  near,
  muted,
  reducedMotion,
  onToggleMute,
}: {
  entry: FeedEntry
  index: number
  active: boolean
  near: boolean
  muted: boolean
  reducedMotion: boolean
  onToggleMute: () => void
}) {
  const articleRef = React.useRef<HTMLElement>(null)
  const videoRef = React.useRef<HTMLVideoElement>(null)
  const carouselRef = React.useRef<MediaCarouselHandle>(null)
  const [playing, setPlaying] = React.useState(false)
  
  const videoAspect = useVideoAspect(videoRef)
  useClipLoop(videoRef, listing.clip)
  const frameAspect = useFrameAspect(articleRef)
  // Upright screens: videos fill it, like TikTok/Reels. Rotated (landscape)
  // screens: show the video whole so it can be watched horizontally.
  const videoFit = frameAspect && frameAspect > 1 ? fitFor(videoAspect, frameAspect) : "cover"
  const { saved, toggleSave } = useAppStore()
  const isSaved = saved.includes(listing.slug)
  const isVideo = listing.type === "video"
  const like = useLike(listing)
  const tapTimer = React.useRef<number | null>(null)
  const [bursts, setBursts] = React.useState<{ id: number; x: number; y: number }[]>([])

  React.useEffect(
    () => () => {
      if (tapTimer.current) window.clearTimeout(tapTimer.current)
    },
    []
  )

  // Only the visible video plays. No autoplay with reduced motion.
  React.useEffect(() => {
    const v = videoRef.current
    if (!v) return
    if (active && !reducedMotion) {
      v.play().catch(() => {})
    } else {
      v.pause()
    }
  }, [active, reducedMotion])

  React.useEffect(() => {
    if (videoRef.current) videoRef.current.muted = muted
  }, [muted])

  // Left/right arrows swipe through a photo carousel on the visible item
  React.useEffect(() => {
    if (!active || isVideo) return
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement | null
      if (e.metaKey || e.ctrlKey || e.altKey || t?.closest("input,textarea,select,[role=dialog],[role=menu]")) return
      if (e.key === "ArrowRight") carouselRef.current?.step(1)
      else if (e.key === "ArrowLeft") carouselRef.current?.step(-1)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [active, isVideo])

  /**
   * One tap = mute/unmute (or play/pause). Two quick taps = like, with a heart
   * where you tapped. The single tap waits briefly to see if a second one follows.
   * Keyboard activation (detail === 0) acts immediately.
   */
  function onTap(e: React.MouseEvent<HTMLElement>) {
    if (e.detail === 0) return onSingleTap()
    if (tapTimer.current) {
      window.clearTimeout(tapTimer.current)
      tapTimer.current = null
      onDoubleTap(e)
      return
    }
    tapTimer.current = window.setTimeout(() => {
      tapTimer.current = null
      onSingleTap()
    }, DOUBLE_TAP_MS)
  }

  function onDoubleTap(e: React.MouseEvent<HTMLElement>) {
    // Double-tap only ever likes (never unlikes), like other feed apps
    if (!like.isLiked) like.toggle()
    const rect = e.currentTarget.getBoundingClientRect()
    const burst = { id: Date.now(), x: e.clientX - rect.left, y: e.clientY - rect.top }
    setBursts((b) => [...b, burst])
    window.setTimeout(() => setBursts((b) => b.filter((x) => x.id !== burst.id)), 800)
  }

  function onSingleTap() {
    const v = videoRef.current
    if (!v) return
    if (reducedMotion) {
      if (v.paused) v.play().catch(() => {})
      else v.pause()
    } else {
      onToggleMute()
    }
  }

  async function share() {
    const url = `${window.location.origin}/r/${listing.slug}`
    try {
      if (navigator.share) {
        await navigator.share({ title: listing.title, url })
        return
      }
      await navigator.clipboard.writeText(url)
      toast.success("Link copied")
    } catch {
      // User dismissed the share sheet
    }
  }

  function save() {
    const now = toggleSave(listing.slug)
    toast(now ? "Saved to your collection" : "Removed from saved")
  }

  const tapLabel = reducedMotion
    ? playing
      ? `Pause ${listing.title}`
      : `Play ${listing.title}`
    : muted
      ? "Unmute"
      : "Mute"

  return (
    <article
      ref={articleRef}
      data-feed-item
      data-index={index}
      aria-label={listing.title}
      className="relative h-full w-full snap-start snap-always overflow-hidden bg-scrim"
    >
      {isVideo ? (
        <>
          <video
            ref={videoRef}
            className={cn(
              "absolute inset-0 size-full",
              videoFit === "contain" ? "object-contain" : "object-cover"
            )}
            src={clipSrc(listing)}
            poster={listing.posterUrl}
            muted
            loop
            playsInline
            preload={active ? "auto" : near ? "metadata" : "none"}
            aria-label={listing.title}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
          />
          {/* Full-area tap target: tap = mute/unmute (or play/pause), double-tap = like */}
          <button
            type="button"
            onClick={onTap}
            aria-label={tapLabel}
            className="absolute inset-0 z-0 cursor-pointer touch-manipulation outline-none select-none focus-visible:ring-3 focus-visible:ring-on-media/60 focus-visible:ring-inset"
          />
          {reducedMotion && !playing && (
            <span
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-1/2 flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-scrim/50 text-on-media backdrop-blur-md"
            >
              <PlayIcon className="size-7 fill-current" />
            </span>
          )}
          <Button
            variant="ghost"
            size="icon-pill"
            onClick={onToggleMute}
            aria-label={muted ? "Unmute" : "Mute"}
            aria-pressed={!muted}
            className={cn(
              railButton,
              "absolute top-[calc(env(safe-area-inset-top)+4.25rem)] right-3 z-10 size-10 md:top-4 short:top-3! short:right-auto! short:left-3"
            )}
          >
            {muted ? <VolumeXIcon /> : <Volume2Icon />}
          </Button>
        </>
      ) : (
        // Swipe through photos; tapping the media catches double-tap to like.
        // Keyboard and screen-reader users use the like button in the rail.
        <MediaCarousel
          ref={carouselRef}
          images={listing.images ?? [listing.mediaUrl]}
          alt={listing.title}
          sizes="(min-width: 768px) 420px, 100vw"
          priority={index === 0}
          onTap={onTap}
          dotsClassName="top-[calc(env(safe-area-inset-top)+4.5rem)] md:top-4"
          className="absolute inset-0"
        />
      )}

      {/* Heart burst where the user double-tapped */}
      {bursts.map((b) => (
        <HeartIcon
          key={b.id}
          aria-hidden
          // Centre the 96px heart on the tap point (offsets, not translate, which the animation uses)
          style={{ left: b.x - 48, top: b.y - 48 }}
          className="pointer-events-none absolute z-20 size-24 fill-current text-like drop-shadow-lg motion-safe:animate-[heart-burst_800ms_ease-out_forwards]"
        />
      ))}

      {/* Bottom gradient overlay */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-linear-to-t from-scrim/90 via-scrim/45 to-transparent px-4 pt-28 pr-36 pb-[calc(env(safe-area-inset-bottom)+5.5rem)] text-on-media md:pb-6">
        <div className="pointer-events-auto flex flex-col gap-2">
          <Link
            href={profileHref(creator.username)}
            className="flex items-center gap-2 self-start rounded-full pr-2 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-on-media/60"
          >
            <CreatorAvatar creator={creator} className="size-8 ring-2 ring-on-media/30" />
            <span className="truncate text-sm font-semibold">@{creator.username}</span>
          </Link>
          <h2 className="line-clamp-2 text-lg leading-snug font-semibold text-balance">
            {listing.title}
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <ToolBadge tool={listing.tool} version={listing.toolVersion} onMedia />
            <span className="text-base font-bold tabular-nums">{formatPrice(listing.price)}</span>
          </div>
        </div>
      </div>

      {/* Right-side action rail */}
      <div className="absolute right-3 bottom-[calc(env(safe-area-inset-bottom)+5.5rem)] z-10 flex flex-col items-end gap-4 text-on-media md:bottom-6 short:bottom-3! short:gap-1.5">
        <LikeButton listing={listing} variant="media" />
        <div className="flex flex-col items-center gap-1">
          <Button
            variant="ghost"
            size="icon-pill"
            onClick={save}
            aria-label={isSaved ? "Remove from saved" : "Save"}
            aria-pressed={isSaved}
            className={railButton}
          >
            <BookmarkIcon className={cn(isSaved && "fill-current")} />
          </Button>
          <span className="text-xs font-medium tabular-nums">
            {formatCompact(listing.stats.saves + (isSaved ? 1 : 0))}
          </span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <Button
            variant="ghost"
            size="icon-pill"
            onClick={share}
            aria-label="Share"
            className={railButton}
          >
            <Share2Icon />
          </Button>
          <span className="text-xs font-medium">Share</span>
        </div>
        <Button asChild size="pill" className="shadow-lg">
          <Link href={`/r/${listing.slug}`}>Get recipe</Link>
        </Button>
      </div>
    </article>
  )
}
