"use client"

import * as React from "react"
import Link from "next/link"

import { toast } from "sonner"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  CheckIcon,
  CopyIcon,
  HideIcon,
  LikeIcon,
  LinkIcon,
  OpenIcon,
  PlusIcon,
  PostMenuIcon,
  SaveIcon,
  ShareIcon,
  UserIcon,
} from "@/components/icons"
import { useAppStore, userCreatorId } from "@/components/providers/app-store"
import { CreatorAvatar } from "@/components/shared/creator-avatar"
import { LikeBurst } from "@/components/shared/like-burst"
import { useLike } from "@/components/shared/like-button"
import { copyListingLink, saveToast, shareListing } from "@/components/shared/post-actions"
import { ToolLogo } from "@/components/shared/tool-logo"
import { formatCompact } from "@/lib/format"
import { getTool } from "@/lib/mock/tools"
import { profileHref } from "@/lib/profile"
import type { Creator, Listing } from "@/lib/types"
import { cn } from "@/lib/utils"

/**
 * Who made it and what you can do with it. "frame" sits beside the reel on
 * desktop (round dock buttons); "media" sits over the video on phones.
 */
export function ReelActions({
  listing,
  creator,
  variant,
  pop,
  onLike,
  onHide,
  className,
}: {
  listing: Listing
  creator: Creator
  variant: "frame" | "media"
  /** Bumped on each like so the heart animation replays */
  pop: number
  onLike: () => void
  /** Take this reel out of the feed */
  onHide: () => void
  className?: string
}) {
  const { user, hydrated, saved, purchased, toggleSave, following, toggleFollow } = useAppStore()
  const like = useLike(listing)
  const isSaved = saved.includes(listing.slug)
  const isFollowing = following.includes(creator.id)
  const isOwner = !!user && listing.creatorId === userCreatorId(user.username)
  const owned = isOwner || purchased.includes(listing.slug)
  const tool = getTool(listing.tool)

  async function copyPrompt() {
    const text = listing.recipe.prompts.map((p) => `${p.label}\n${p.text}`).join("\n\n")
    try {
      await navigator.clipboard.writeText(text)
      toast.success(listing.recipe.prompts.length > 1 ? "Prompts copied" : "Prompt copied")
    } catch {
      toast.error("Couldn't copy. Open the recipe page and copy it from there.")
    }
  }
  const onMedia = variant === "media"

  const round = cn(
    "flex size-12 items-center justify-center rounded-full outline-none transition-colors duration-160 focus-visible:ring-2 focus-visible:ring-ring",
    onMedia ? "glass-button-media text-on-media" : "glass-button text-foreground"
  )
  const count = cn("type-meta font-semibold tabular-nums", onMedia && "text-on-media drop-shadow")

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <div className="relative mb-2">
        <Link href={profileHref(creator.username)} aria-label={`${creator.displayName} profile`} className="block rounded-full">
          <CreatorAvatar creator={creator} className="size-12" />
        </Link>
        {hydrated && !isOwner && (
          <button
            type="button"
            onClick={() => toggleFollow(creator.id)}
            aria-pressed={isFollowing}
            aria-label={`${isFollowing ? "Unfollow" : "Follow"} ${creator.displayName}`}
            className="absolute -bottom-2 left-1/2 flex size-5 -translate-x-1/2 items-center justify-center rounded-full bg-brand text-brand-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {isFollowing ? <CheckIcon aria-hidden weight="bold" className="size-3" /> : <PlusIcon aria-hidden weight="bold" className="size-3" />}
          </button>
        )}
      </div>

      <div className="flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={onLike}
          aria-pressed={like.isLiked}
          aria-label={`${like.isLiked ? "Unlike" : "Like"} ${listing.title}, ${like.count} likes`}
          className={cn(round, "relative")}
        >
          <LikeBurst trigger={pop} />
          <LikeIcon
            key={pop}
            aria-hidden
            weight={like.isLiked ? "fill" : "regular"}
            className={cn("size-6", like.isLiked && "text-like", pop > 0 && like.isLiked && "motion-safe:animate-[like-pop_320ms_ease-out]")}
          />
        </button>
        <span aria-hidden className={count}>{formatCompact(like.count)}</span>
      </div>

      <div className="flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={() => saveToast(toggleSave(listing.slug))}
          aria-pressed={isSaved}
          aria-label={isSaved ? "Remove from saved" : "Save"}
          className={round}
        >
          <SaveIcon aria-hidden weight={isSaved ? "fill" : "regular"} className="size-6" />
        </button>
        <span aria-hidden className={count}>{formatCompact(listing.stats.saves + (isSaved ? 1 : 0))}</span>
      </div>

      <button type="button" onClick={() => shareListing(listing)} aria-label="Share" className={round}>
        <ShareIcon aria-hidden className="size-6" />
      </button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button" aria-label="More options" className={round}>
            <PostMenuIcon aria-hidden weight="bold" className="size-6" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="left" align="end" sideOffset={12} className="w-60">
          <DropdownMenuItem asChild>
            <Link href={`/r/${listing.slug}`}>
              <OpenIcon aria-hidden />
              Open recipe page
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={profileHref(creator.username)}>
              <UserIcon aria-hidden />
              More from {creator.displayName}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {owned && (
            <DropdownMenuItem onSelect={copyPrompt}>
              <CopyIcon aria-hidden />
              {listing.recipe.prompts.length > 1 ? "Copy prompts" : "Copy prompt"}
            </DropdownMenuItem>
          )}
          {tool && (
            <DropdownMenuItem asChild>
              <a href={tool.url} target="_blank" rel="noreferrer">
                <ToolLogo tool={tool.id} className="size-4.5" />
                Open in {tool.name}
              </a>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onSelect={() => copyListingLink(listing)}>
            <LinkIcon aria-hidden />
            Copy link
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={onHide}>
            <HideIcon aria-hidden />
            Not interested
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
