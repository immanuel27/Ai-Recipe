"use client"

import { toast } from "sonner"

import type { Listing } from "@/lib/types"

/** Native share sheet, falling back to copying the link. */
export async function shareListing(listing: Pick<Listing, "slug" | "title">) {
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

export async function copyListingLink(listing: Pick<Listing, "slug">) {
  try {
    await navigator.clipboard.writeText(`${window.location.origin}/r/${listing.slug}`)
    toast.success("Link copied")
  } catch {
    toast.error("Couldn't copy the link. Copy it from the address bar instead.")
  }
}

export function saveToast(nowSaved: boolean) {
  toast(nowSaved ? "Saved to your collection" : "Removed from saved")
}
