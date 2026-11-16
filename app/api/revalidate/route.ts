import { SeverityNumber } from "@opentelemetry/api-logs"
import { revalidateTag } from "next/cache"
import { after, NextResponse } from "next/server"

import { loggerProvider, posthogLogger } from "@/instrumentation"
import { CATALOG_TAG } from "@/lib/data"
import { createClient } from "@/lib/supabase/server"

function flushPostHogLogs() {
  const provider = loggerProvider
  if (provider) {
    after(async () => {
      await provider.forceFlush().catch(() => {})
    })
  }
}

/** Refresh the cached catalog right after a signed-in user publishes. */
export async function POST() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  if (!data?.claims) {
    posthogLogger?.emit({
      body: "catalog_revalidation_denied",
      severityNumber: SeverityNumber.WARN,
      attributes: { route: "/api/revalidate" },
    })
    flushPostHogLogs()
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  revalidateTag(CATALOG_TAG, { expire: 0 })
  posthogLogger?.emit({
    body: "catalog_revalidated",
    severityNumber: SeverityNumber.INFO,
    attributes: { route: "/api/revalidate", cache_tag: CATALOG_TAG },
  })
  flushPostHogLogs()
  return NextResponse.json({ ok: true })
}
