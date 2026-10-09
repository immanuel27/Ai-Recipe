"use client"

import * as React from "react"

import { createClient } from "@/lib/supabase/client"
import { supabaseConfigured } from "@/lib/supabase/env"

/**
 * The creator's proof link (the tool's share link) once the viewer owns the
 * listing. RLS only returns it to the creator and buyers.
 */
export function useProofLink(listingId: string, owned: boolean) {
  const [url, setUrl] = React.useState<string | null>(null)
  const enabled = supabaseConfigured && owned

  React.useEffect(() => {
    if (!enabled) return
    let cancelled = false
    createClient()
      .from("listing_proofs")
      .select("url")
      .eq("listing_id", listingId)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) setUrl(data?.url ?? null)
      })
    return () => {
      cancelled = true
    }
  }, [enabled, listingId])

  return enabled ? url : null
}
