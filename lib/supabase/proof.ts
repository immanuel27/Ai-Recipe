"use client"

import { createClient } from "@/lib/supabase/client"

/** Private bucket for proof screenshots: only the creator and the team can read them */
export const PROOF_BUCKET = "proofs"

/** Signed URLs (one hour) for proof screenshots, in the same order; "" for any that failed */
export async function proofShotUrls(paths: string[]) {
  if (!paths.length) return []
  const { data } = await createClient().storage.from(PROOF_BUCKET).createSignedUrls(paths, 60 * 60)
  return paths.map((path) => data?.find((d) => d.path === path)?.signedUrl ?? "")
}
