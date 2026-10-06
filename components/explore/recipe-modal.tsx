"use client"

import * as React from "react"
import Link from "next/link"

import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import {
  CheckIcon,
  CloseIcon,
  LikeIcon,
  MutedIcon,
  OpenIcon,
  PauseIcon,
  PlayIcon,
  PlusIcon,
  SaveIcon,
  ShareIcon,
  SoundIcon,
} from "@/components/icons"
import { RecipeCard } from "@/components/discover/recipe-card"
import { useAppStore, userCreatorId } from "@/components/providers/app-store"
import { CreatorAvatar } from "@/components/shared/creator-avatar"
import { LikeBurst } from "@/components/shared/like-burst"
import { useLike } from "@/components/shared/like-button"
import { MediaCarousel } from "@/components/shared/media-carousel"
import { saveToast, shareListing } from "@/components/shared/post-actions"
import { clipSrc, useClipLoop } from "@/components/shared/use-clip"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { formatCompact } from "@/lib/format"
import { profileHref } from "@/lib/profile"
import type { Creator, Listing } from "@/lib/types"
import { cn } from "@/lib/utils"

const round =
  "glass-button flex size-11 shrink-0 items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
const mediaRound =
  "glass-button-media flex size-11 items-center justify-center rounded-full text-on-media outline-none focus-visible:ring-2 focus-visible:ring-on-media"

function ModalVideo({ listing }: { listing: Listing }) {
  const videoRef = React.useRef<HTMLVideoElement>(null)
  const reducedMotion = usePrefersReducedMotion()
  const [playing, setPlaying] = React.useState(false)
  const [muted, setMuted] = React.useState(true)
  useClipLoop(videoRef, listing.clip)

  React.useEffect(() => {
    if (!reducedMotion) videoRef.current?.play().catch(() => {})
  }, [reducedMotion])

  function toggle() {
    const v = videoRef.current
    if (!v) return
    if (v.paused) v.play().catch(() => {})
    else v.pause()
  }

  return (
    <>
      <video
        ref={videoRef}
        src={clipSrc(listing)}
        poster={listing.posterUrl}
        muted={muted}
        loop
        playsInline
        preload="auto"
        aria-label={listing.title}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onClick={toggle}
        className="absolute inset-0 size-full cursor-pointer object-contain"
      />
      {!playing && (
        <span aria-hidden className="glass-button-media pointer-events-none absolute top-1/2 left-1/2 flex size-18 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-on-media">
          <PlayIcon weight="fill" className="size-8" />
        </span>
      )}
      <div className="absolute bottom-4 left-4 flex gap-2">
        <button type="button" onClick={toggle} aria-label={playing ? "Pause" : "Play"} className={mediaRound}>
          {playing ? <PauseIcon aria-hidden weight="fill" className="size-5" /> : <PlayIcon aria-hidden weight="fill" className="size-5" />}
        </button>
        <button type="button" onClick={() => setMuted((m) => !m)} aria-label={muted ? "Unmute" : "Mute"} aria-pressed={!muted} className={mediaRound}>
          {muted ? <MutedIcon aria-hidden weight="fill" className="size-5" /> : <SoundIcon aria-hidden weight="fill" className="size-5" />}
        </button>
      </div>
    </>
  )
}

/** A recipe without leaving Explore: the shot on the left, who made it, what's inside and the price on the right. */
export function RecipeModal({
  entry,
  onOpenChange,
}: {
  entry: { listing: Listing; creator?: Creator } | null
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={!!entry} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="h-[calc(100dvh-1rem)] max-w-[calc(100vw-1rem)] grid-rows-[minmax(0,2fr)_minmax(0,3fr)] gap-0 overflow-hidden rounded-3xl p-0 sm:max-w-[min(72rem,calc(100vw-4rem))] md:h-[min(88dvh,52rem)] md:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] md:grid-rows-1"
      >
        {entry && <ModalBody listing={entry.listing} creator={entry.creator} close={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  )
}

function ModalBody({ listing, creator, close }: { listing: Listing; creator?: Creator; close: () => void }) {
  const { user, hydrated, saved, toggleSave, following, toggleFollow } = useAppStore()
  const like = useLike(listing)
  const [pop, setPop] = React.useState(0)
  const isSaved = saved.includes(listing.slug)
  const isOwner = !!user && listing.creatorId === userCreatorId(user.username)
  const isFollowing = !!creator && following.includes(creator.id)

  return (
    <>
      <DialogTitle className="sr-only">{listing.title}</DialogTitle>
      <DialogDescription className="sr-only">{listing.description}</DialogDescription>

      <div className="relative min-h-0 bg-scrim">
        {listing.type === "video" ? (
          <ModalVideo key={listing.id} listing={listing} />
        ) : (
          <MediaCarousel
            images={listing.images ?? [listing.mediaUrl]}
            alt={listing.title}
            sizes="(min-width: 768px) 640px, 100vw"
            className="absolute inset-0"
          />
        )}
      </div>

      <div className="flex min-h-0 flex-col gap-6 overflow-y-auto p-5 md:p-6">
        <div className="flex items-center gap-3">
          {creator && (
            <>
              <Link href={profileHref(creator.username)} className="rounded-full" aria-label={`${creator.displayName} profile`}>
                <CreatorAvatar creator={creator} className="size-11" />
              </Link>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <Link href={profileHref(creator.username)} className="truncate font-semibold hover:underline">
                  {creator.displayName}
                </Link>
                <span className="truncate type-meta text-muted-foreground">@{creator.username}</span>
              </div>
              {hydrated && !isOwner && (
                <button
                  type="button"
                  onClick={() => toggleFollow(creator.id)}
                  aria-pressed={isFollowing}
                  className="glass-button flex h-9 items-center gap-2 rounded-full px-4 type-body font-semibold"
                >
                  {isFollowing ? <CheckIcon aria-hidden weight="bold" className="size-4" /> : <PlusIcon aria-hidden weight="bold" className="size-4" />}
                  {isFollowing ? "Following" : "Follow"}
                </button>
              )}
            </>
          )}
          <button type="button" onClick={close} aria-label="Close" className={cn(round, "size-9")}>
            <CloseIcon aria-hidden className="size-4" />
          </button>
        </div>

        <p className="type-body leading-6 text-muted-foreground">{listing.description}</p>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              if (like.toggle()) setPop((n) => n + 1)
            }}
            aria-pressed={like.isLiked}
            aria-label={`${like.isLiked ? "Unlike" : "Like"} ${listing.title}, ${like.count} likes`}
            className="glass-button relative flex h-11 items-center gap-2 rounded-full px-4 font-semibold tabular-nums"
          >
            <LikeBurst trigger={pop} />
            <LikeIcon aria-hidden weight={like.isLiked ? "fill" : "regular"} className={cn("size-5", like.isLiked && "text-like")} />
            {formatCompact(like.count)}
          </button>
          <button
            type="button"
            onClick={() => saveToast(toggleSave(listing.slug))}
            aria-pressed={isSaved}
            aria-label={isSaved ? "Remove from saved" : "Save"}
            className={round}
          >
            <SaveIcon aria-hidden weight={isSaved ? "fill" : "regular"} className="size-5" />
          </button>
          <button type="button" onClick={() => shareListing(listing)} aria-label="Share" className={round}>
            <ShareIcon aria-hidden className="size-5" />
          </button>
          <Link
            href={`/r/${listing.slug}`}
            className="ml-auto flex items-center gap-2 type-body font-semibold text-link hover:underline"
          >
            Full page
            <OpenIcon aria-hidden className="size-4" />
          </Link>
        </div>

        <RecipeCard listing={listing} className="shrink-0" />
      </div>
    </>
  )
}
