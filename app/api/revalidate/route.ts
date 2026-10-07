import { revalidateTag } from "next/cache"
import { NextResponse } from "next/server"

import { CATALOG_TAG } from "@/lib/data"
import { createClient } from "@/lib/supabase/server"

/** Refresh the cached catalog right after a signed-in user publishes. */
export async function POST() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  if (!data?.claims) return NextResponse.json({ ok: false }, { status: 401 })
  revalidateTag(CATALOG_TAG, { expire: 0 })
  return NextResponse.json({ ok: true })
}
