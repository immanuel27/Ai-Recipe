"use client"

import * as React from "react"

import type { ProofValues } from "@/components/sell/listing-schema"
import { createClient } from "@/lib/supabase/client"
import { supabaseConfigured } from "@/lib/supabase/env"
import { proofShotUrls } from "@/lib/supabase/proof"

const EMPTY: ProofValues = { url: "", shots: [] }

/**
 * A post's private proof (the tool's share link and any screenshots), for its
 * creator editing it, and whether it has loaded. RLS only returns it to the
 * creator and the team; screenshots come back as short-lived signed URLs.
 */
export function useProofState(listingId: string, owned: boolean) {
  const [state, setState] = React.useState<{ id: string; proof: ProofValues } | null>(null)
  const enabled = supabaseConfigured && owned && !!listingId

  React.useEffect(() => {
    if (!enabled) return
    let cancelled = false
    createClient()
      .from("listing_proofs")
      .select("url, screenshots")
      .eq("listing_id", listingId)
      .maybeSingle()
      .then(async ({ data }) => {
        const row = data as { url: string | null; screenshots: string[] | null } | null
        const paths = row?.screenshots ?? []
        const urls = await proofShotUrls(paths)
        if (cancelled) return
        setState({
          id: listingId,
          proof: { url: row?.url ?? "", shots: paths.map((path, i) => ({ path, src: urls[i] ?? "" })) },
        })
      })
    return () => {
      cancelled = true
    }
  }, [enabled, listingId])

  const current = state?.id === listingId ? state : null
  return { proof: enabled ? (current?.proof ?? EMPTY) : EMPTY, loaded: !enabled || !!current }
}
