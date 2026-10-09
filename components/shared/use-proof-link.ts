"use client"

import * as React from "react"

import { createClient } from "@/lib/supabase/client"
import { supabaseConfigured } from "@/lib/supabase/env"

/**
 * The creator's proof link (the tool's share link) once the viewer owns the
 * listing, and whether it has loaded. RLS only returns it to the creator and buyers.
 */
export function useProofLinkState(listingId: string, owned: boolean) {
  const [state, setState] = React.useState<{ id: string; url: string | null } | null>(null)
  const enabled = supabaseConfigured && owned && !!listingId

  React.useEffect(() => {
    if (!enabled) return
    let cancelled = false
    createClient()
      .from("listing_proofs")
      .select("url")
      .eq("listing_id", listingId)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) setState({ id: listingId, url: data?.url ?? null })
      })
    return () => {
      cancelled = true
    }
  }, [enabled, listingId])

  const current = state?.id === listingId ? state : null
  return { url: enabled ? (current?.url ?? null) : null, loaded: !enabled || !!current }
}

export function useProofLink(listingId: string, owned: boolean) {
  return useProofLinkState(listingId, owned).url
}
