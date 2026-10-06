"use client"

import * as React from "react"

import { creatorFromUser, useAppStore, userCreatorId } from "@/components/providers/app-store"
import { CREATORS } from "@/lib/mock/creators"
import { LISTINGS } from "@/lib/mock/listings"
import { createClient } from "@/lib/supabase/client"
import { supabaseConfigured } from "@/lib/supabase/env"
import { listingFromRow, profileToCreator, type ListingRow, type ProfileRow } from "@/lib/supabase/mappers"
import type { Creator, Listing } from "@/lib/types"

type Entry = { listing: Listing; creator?: Creator }

/**
 * Resolve the slugs in your Library (purchased, saved, liked) to listings with
 * creators. Fetches them from Supabase; falls back to the demo data.
 */
export function useListingLookup() {
  const { createdListings, user, purchased, saved, liked } = useAppStore()
  const [remote, setRemote] = React.useState<Map<string, Entry>>(new Map())

  const wanted = React.useMemo(
    () => [...new Set([...purchased, ...saved, ...liked])].sort(),
    [purchased, saved, liked]
  )
  const wantedKey = wanted.join(",")

  React.useEffect(() => {
    if (!supabaseConfigured || wanted.length === 0) return
    let cancelled = false
    const supabase = createClient()
    supabase
      .from("listings")
      .select("*, creator:profiles!listings_creator_id_fkey(id, username, display_name, bio, avatar_url)")
      .in("slug", wanted)
      .then(({ data }) => {
        if (cancelled || !data) return
        const next = new Map<string, Entry>()
        for (const row of data as (ListingRow & { creator: ProfileRow | null })[]) {
          next.set(row.slug, {
            listing: listingFromRow(row),
            creator: row.creator ? profileToCreator(row.creator) : undefined,
          })
        }
        setRemote(next)
      })
    return () => {
      cancelled = true
    }
    // wantedKey captures the slug list
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wantedKey])

  return React.useCallback(
    (slugs: string[]): Entry[] =>
      slugs.flatMap((slug) => {
        if (supabaseConfigured) {
          const hit = remote.get(slug)
          return hit ? [hit] : []
        }
        const listing = [...createdListings, ...LISTINGS].find((l) => l.slug === slug)
        if (!listing) return []
        const creator =
          user && listing.creatorId === userCreatorId(user.username)
            ? creatorFromUser(user)
            : CREATORS.find((c) => c.id === listing.creatorId)
        return [{ listing, creator }]
      }),
    [remote, createdListings, user]
  )
}
