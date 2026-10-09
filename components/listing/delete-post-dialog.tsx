"use client"

import * as React from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { SpinnerIcon } from "@/components/icons"
import { useAppStore } from "@/components/providers/app-store"
import { supabaseConfigured } from "@/lib/supabase/env"
import { deleteListing } from "@/lib/supabase/publish"
import type { Listing } from "@/lib/types"

/** Confirm, then delete one of your posts (buyers keep their recipe). */
export function DeletePostDialog({
  listing,
  open,
  onOpenChange,
  onDeleted,
}: {
  listing: Pick<Listing, "id" | "slug" | "title">
  open: boolean
  onOpenChange: (open: boolean) => void
  onDeleted?: () => void
}) {
  const { removeListing } = useAppStore()
  const [deleting, setDeleting] = React.useState(false)

  async function confirm() {
    setDeleting(true)
    try {
      if (supabaseConfigured) await deleteListing(listing.id)
      removeListing(listing.slug)
      toast.success("Post deleted")
      onOpenChange(false)
      onDeleted?.()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't delete the post. Try again.")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !deleting && onOpenChange(o)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete &ldquo;{listing.title}&rdquo;?</DialogTitle>
          <DialogDescription>
            It disappears from the feed, Explore and your profile. People who already bought it keep
            their recipe. You can&apos;t undo this.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-3">
          <Button variant="ghost" size="pill" onClick={() => onOpenChange(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button variant="destructive" size="pill" onClick={() => void confirm()} disabled={deleting}>
            {deleting && <SpinnerIcon className="animate-spin" aria-hidden />}
            {deleting ? "Deleting…" : "Delete post"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
