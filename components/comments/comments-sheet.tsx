"use client"

import { CommentsPanel } from "@/components/comments/comments-panel"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useIsDesktop } from "@/hooks/use-is-desktop"
import type { Listing } from "@/lib/types"

/** Comments over the feed: a bottom sheet on phones, a side panel on bigger screens. */
export function CommentsSheet({
  listing,
  open,
  onOpenChange,
  onCountChange,
}: {
  listing: Pick<Listing, "id" | "creatorId" | "title">
  open: boolean
  onOpenChange: (open: boolean) => void
  onCountChange?: (count: number) => void
}) {
  const desktop = useIsDesktop()
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={desktop ? "right" : "bottom"}
        className={desktop ? "w-full sm:max-w-md" : "max-h-[80dvh] min-h-[50dvh] rounded-t-3xl"}
      >
        <SheetHeader>
          <SheetTitle>Comments</SheetTitle>
          <SheetDescription className="truncate">{listing.title}</SheetDescription>
        </SheetHeader>
        {open && <CommentsPanel listing={listing} onCountChange={onCountChange} className="min-h-0 flex-1 px-4 pb-6" />}
      </SheetContent>
    </Sheet>
  )
}
