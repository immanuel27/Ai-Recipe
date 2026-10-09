"use client"

import * as React from "react"
import Link from "next/link"
import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CopyIcon, DeleteIcon, OpenIcon, PostMenuIcon, SpinnerIcon } from "@/components/icons"
import { useAppStore, userCreatorId } from "@/components/providers/app-store"
import { copyListingLink } from "@/components/shared/post-actions"
import type { Listing } from "@/lib/types"
import { cn } from "@/lib/utils"

/** What kind of post this is, in words ("video", "website"…) */
function postNoun(listing: Listing) {
  if (listing.liveUrl) return "website"
  if (listing.type === "video") return "video"
  return (listing.images?.length ?? 1) > 1 ? "images" : "image"
}

/**
 * The creator's own controls for a post: open, copy link, delete. Renders
 * nothing for posts that aren't yours, so it's safe to drop on any card.
 * "media" floats over a thumbnail; "row" sits in a list.
 */
export function ListingOwnerMenu({
  listing,
  variant = "media",
  className,
}: {
  listing: Listing
  variant?: "media" | "row"
  className?: string
}) {
  const { user } = useAppStore()
  const [confirming, setConfirming] = React.useState(false)

  if (!user || listing.creatorId !== userCreatorId(user.username)) return null

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size={variant === "media" ? "icon" : "icon-sm"}
            aria-label={`Options for ${listing.title}`}
            className={cn(
              variant === "media" &&
                "rounded-full bg-scrim/60 text-on-media backdrop-blur-md hover:bg-scrim/80 hover:text-on-media aria-expanded:bg-scrim/80 aria-expanded:text-on-media",
              className
            )}
          >
            <PostMenuIcon aria-hidden weight="bold" className="size-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuItem asChild>
            <Link href={`/r/${listing.slug}`}>
              <OpenIcon aria-hidden />
              Open recipe page
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => copyListingLink(listing)}>
            <CopyIcon aria-hidden />
            Copy link
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onSelect={() => setConfirming(true)}>
            <DeleteIcon aria-hidden />
            Delete post
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DeleteListingDialog listing={listing} open={confirming} onOpenChange={setConfirming} />
    </>
  )
}

/** "Delete this post?" Sold posts can't be deleted: buyers would lose what they paid for. */
export function DeleteListingDialog({
  listing,
  open,
  onOpenChange,
}: {
  listing: Listing
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { deleteListing } = useAppStore()
  const [pending, setPending] = React.useState(false)
  const sales = listing.stats.sales
  const noun = postNoun(listing)

  async function confirm(e: React.MouseEvent) {
    // Keep the dialog open until the server answers
    e.preventDefault()
    setPending(true)
    try {
      await deleteListing(listing.slug)
      onOpenChange(false)
      toast.success("Post deleted")
    } catch (error) {
      console.error(error)
      toast.error(
        error instanceof Error && error.message
          ? error.message
          : "Couldn't delete the post. Check your connection and try again."
      )
    } finally {
      setPending(false)
    }
  }

  if (sales > 0) {
    return (
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>This post can&apos;t be deleted</AlertDialogTitle>
            <AlertDialogDescription>
              {sales === 1 ? "1 person has" : `${sales} people have`} bought “{listing.title}”.
              Deleting it would take the recipe away from them, so sold posts stay up.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel variant="default">Got it</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }

  return (
    <AlertDialog open={open} onOpenChange={(next) => !pending && onOpenChange(next)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this post?</AlertDialogTitle>
          <AlertDialogDescription>
            “{listing.title}” and its recipe will be removed for good, along with the {noun}.
            Likes and saves go with it. This can&apos;t be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" disabled={pending} onClick={confirm}>
            {pending && <SpinnerIcon aria-hidden className="animate-spin" />}
            {pending ? "Deleting…" : "Delete post"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
