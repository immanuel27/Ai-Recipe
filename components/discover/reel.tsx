"use client"

import * as React from "react"
import Link from "next/link"

import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet"
import { MutedIcon, PlayIcon, SoundIcon } from "@/components/icons"
import { RecipeCard } from "@/components/discover/recipe-card"
import { ReelActions } from "@/components/discover/reel-actions"
import { CreatorAvatar } from "@/components/shared/creator-avatar"
import { useLike } from "@/components/shared/like-button"
import { MediaCarousel, type MediaCarouselHandle } from "@/components/shared/media-carousel"
import { HeartBursts, useDoubleTap } from "@/components/shared/use-double-tap"
import { clipSrc, useClipLoop } from "@/components/shared/use-clip"
import { formatPrice } from "@/lib/format"
import { profileHref } from "@/lib/profile"
import type { Creator, Listing } from "@/lib/types"
import { AiTagBadge } from "@/components/shared/ai-tag-badge"

export interface ReelEntry {
  listing: Listing
  creator: Creator
}

/**
 * One reel: the recipe you'd buy on the left, the shot in the middle, who made
 * it and what you can do on the right. Phones get the shot full-height with
 * the actions over it and the recipe in a sheet.
 */
export function Reel({
  entry: { listing, creator },
  index,
  active,
  near,
  muted,
  reducedMotion,
  onToggleMute,
  onHide,
}: {
  entry: ReelEntry
  index: number
  active: boolean
  near: boolean
  muted: boolean
  reducedMotion: boolean
  onToggleMute: () => void
  onHide: () => void
}) {
  const videoRef = React.useRef<HTMLVideoElement>(null)
  const carouselRef = React.useRef<MediaCarouselHandle>(null)
  const [playing, setPlaying] = React.useState(false)
  const [pop, setPop] = React.useState(0)
  const [recipeOpen, setRecipeOpen] = React.useState(false)
  // A pause you chose sticks until you tap again or swipe away
  const [userPaused, setUserPaused] = React.useState(false)
  const like = useLike(listing)
  const isVideo = listing.type === "video"
  useClipLoop(videoRef, listing.clip)

  function likeNow() {
    if (like.toggle()) setPop((n) => n + 1)
  }

  const { bursts, onTap } = useDoubleTap({
    // Double-tap only ever likes, never unlikes
    onDouble: () => {
      if (!like.isLiked) likeNow()
    },
    onSingle: isVideo
      ? () => {
          const v = videoRef.current
          if (!v) return
          if (v.paused) {
            setUserPaused(false)
            v.play().catch(() => {})
          } else {
            setUserPaused(true)
            v.pause()
          }
        }
      : undefined,
  })

  // Only the reel on screen plays. No autoplay with reduced motion. Leaving a reel clears its pause.
  React.useEffect(() => {
    const v = videoRef.current
    if (!v) return
    if (active && !reducedMotion && !userPaused) v.play().catch(() => {})
    else v.pause()
  }, [active, reducedMotion, userPaused])

  const [wasActive, setWasActive] = React.useState(active)
  if (wasActive !== active) {
    setWasActive(active)
    if (!active) setUserPaused(false)
  }

  React.useEffect(() => {
    if (videoRef.current) videoRef.current.muted = muted
  }, [muted])

  // Left/right arrows page through a photo set on the reel on screen
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

  return (
    <article
      data-reel
      data-index={index}
      aria-label={listing.title}
      className="flex h-full snap-start snap-always items-center justify-center gap-8 md:px-10 md:pt-4 md:pb-6 xl:gap-12"
    >
      <RecipeCard listing={listing} className="hidden max-h-full w-80 shrink-0 lg:flex xl:w-88" />

      {/* Phones: the reel fills the whole screen width; tablets and up: a framed 9:16 card */}
      <div className="relative h-full w-full overflow-hidden bg-scrim md:aspect-9/16 md:w-auto md:max-w-full md:rounded-3xl md:shadow-2xl md:shadow-scrim/50">
        {isVideo ? (
          <>
            <video
              ref={videoRef}
              className="absolute inset-0 size-full object-cover"
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
            {/* Tap = sound on/off (or play/pause), double-tap = like */}
            <button
              type="button"
              onClick={onTap}
              aria-label={playing ? `Pause ${listing.title}` : `Play ${listing.title}`}
              className="absolute inset-0 cursor-pointer touch-manipulation outline-none focus-visible:ring-3 focus-visible:ring-on-media/60 focus-visible:ring-inset"
            />
            {!playing && (userPaused || reducedMotion) && (
              <span aria-hidden className="glass-button-media pointer-events-none absolute top-1/2 left-1/2 flex size-18 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-on-media">
                <PlayIcon weight="fill" className="size-8" />
              </span>
            )}
            <button
              type="button"
              onClick={onToggleMute}
              aria-label={muted ? "Unmute" : "Mute"}
              aria-pressed={!muted}
              className="absolute top-4 right-4 flex size-10 items-center justify-center rounded-full bg-scrim/40 text-on-media outline-none hover:bg-scrim/60 focus-visible:ring-2 focus-visible:ring-on-media"
            >
              {muted ? <MutedIcon aria-hidden weight="fill" className="size-5" /> : <SoundIcon aria-hidden weight="fill" className="size-5" />}
            </button>
          </>
        ) : (
          <MediaCarousel
            ref={carouselRef}
            images={listing.images ?? [listing.mediaUrl]}
            alt={listing.title}
            sizes="(min-width: 1024px) 380px, 100vw"
            priority={index === 0}
            onTap={onTap}
            dotsClassName="top-4"
            className="absolute inset-0"
          />
        )}
        <HeartBursts bursts={bursts} />

        {/* Phones: who made it, what it is, and the way into the recipe */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col gap-3 bg-linear-to-t from-scrim/85 via-scrim/40 to-transparent p-4 pt-24 pr-20 text-on-media lg:hidden">
          <Link href={profileHref(creator.username)} className="pointer-events-auto flex items-center gap-2 self-start font-semibold">
            <CreatorAvatar creator={creator} className="size-8" />
            {creator.displayName}
          </Link>
          {listing.aiTag && <AiTagBadge tag={listing.aiTag} onMedia />}
          <p className="line-clamp-2 type-heading">{listing.title}</p>
          <button
            type="button"
            onClick={() => setRecipeOpen(true)}
            className="pointer-events-auto flex h-10 items-center gap-2 self-start rounded-full bg-on-media px-4 font-semibold text-scrim outline-none focus-visible:ring-2 focus-visible:ring-on-media"
          >
            See Recipe
            <span className="tabular-nums opacity-60">{formatPrice(listing.price)}</span>
          </button>
        </div>
        <ReelActions
          listing={listing}
          creator={creator}
          variant="media"
          pop={pop}
          onLike={likeNow}
          onHide={onHide}
          className="absolute right-3 bottom-6 lg:hidden"
        />
      </div>

      <ReelActions
        listing={listing}
        creator={creator}
        variant="frame"
        pop={pop}
        onLike={likeNow}
        onHide={onHide}
        className="hidden self-end pb-2 lg:flex"
      />

      <Sheet open={recipeOpen} onOpenChange={setRecipeOpen}>
        <SheetContent side="bottom" className="max-h-[85dvh] overflow-y-auto rounded-t-3xl p-2 lg:hidden">
          <SheetTitle className="sr-only">Recipe for {listing.title}</SheetTitle>
          <SheetDescription className="sr-only">What is inside and how to unlock it</SheetDescription>
          <RecipeCard listing={listing} className="border-0 bg-transparent backdrop-blur-none" />
        </SheetContent>
      </Sheet>
    </article>
  )
}
