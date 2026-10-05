"use client"

import * as React from "react"

import { creatorFromUser, useAppStore, userCreatorId } from "@/components/providers/app-store"
import { getCreator } from "@/lib/data"
import { LISTINGS } from "@/lib/mock/listings"
import type { Creator, Listing } from "@/lib/types"

/** Resolve listing slugs (mock + created in this browser) to listings with creators. */
export function useListingLookup() {
  const { createdListings, user } = useAppStore()

  return React.useCallback(
    (slugs: string[]) => {
      const all = [...createdListings, ...LISTINGS]
      return slugs.flatMap((slug) => {
        const listing = all.find((l) => l.slug === slug)
        if (!listing) return []
        const creator: Creator | undefined =
          user && listing.creatorId === userCreatorId(user.username)
            ? creatorFromUser(user)
            : getCreator(listing.creatorId)
        return [{ listing, creator }] as { listing: Listing; creator?: Creator }[]
      })
    },
    [createdListings, user]
  )
}
