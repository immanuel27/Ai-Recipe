"use client"

import * as React from "react"

import { Skeleton } from "@/components/ui/skeleton"
import { LockIcon } from "@/components/icons"
import { userCreatorId } from "@/components/providers/app-store"
import { CreateListingForm } from "@/components/sell/create-listing-form"
import { EmptyState } from "@/components/shared/empty-state"
import { useProofLinkState } from "@/components/shared/use-proof-link"
import { useRequireUser } from "@/hooks/use-require-user"
import { createClient } from "@/lib/supabase/client"
import { supabaseConfigured } from "@/lib/supabase/env"
import { listingFromRow, type ListingRow, type RecipeRow } from "@/lib/supabase/mappers"
import type { Listing } from "@/lib/types"

/**
 * Edit one of your posts. It comes from your own listings in the store (with the
 * full recipe), or straight from Supabase when it isn't there yet (another device).
 */
export function EditPost({ slug }: { slug: string }) {
  const { ready, user, createdListings } = useRequireUser()
  const stored = createdListings.find((l) => l.slug === slug)
  const [fetched, setFetched] = React.useState<Listing | null | undefined>(undefined)
  const listing = stored ?? fetched ?? null
  const ownerId = user ? userCreatorId(user.username) : null
  const isOwner = !!listing && listing.creatorId === ownerId

  React.useEffect(() => {
    if (!ready || stored || !supabaseConfigured) return
    let cancelled = false
    createClient()
      .from("listings")
      .select("*, recipes(prompts, settings, assets, edit_stack, failures)")
      .eq("slug", slug)
      .is("archived_at", null)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return
        const row = data as (ListingRow & { recipes: RecipeRow | null }) | null
        setFetched(row ? listingFromRow(row, row.recipes ?? undefined) : null)
      })
    return () => {
      cancelled = true
    }
  }, [ready, stored, slug])

  // The private proof link, so it shows in the form
  const proof = useProofLinkState(listing?.id ?? "", isOwner)
  const loading = !ready || (!stored && supabaseConfigured && fetched === undefined)

  if (loading || !proof.loaded) {
    return (
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4" role="status" aria-label="Loading">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    )
  }

  if (!listing || !isOwner) {
    return (
      <EmptyState
        icon={LockIcon}
        title="You can't edit this post"
        description="Only the creator of a post can edit it."
        action={{ label: "Back to your profile", href: "/profile" }}
      />
    )
  }

  return <CreateListingForm key={listing.id} editing={{ listing, proofUrl: proof.url ?? "" }} />
}
