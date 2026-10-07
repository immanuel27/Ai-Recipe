import { createClient as createSupabaseClient } from "@supabase/supabase-js"

import { SUPABASE_KEY, SUPABASE_URL } from "@/lib/supabase/env"

/**
 * A signed-out client for public data (listings, profiles). No cookies, so its
 * results can be cached and shared across visitors.
 */
export function createPublicClient() {
  return createSupabaseClient(SUPABASE_URL!, SUPABASE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
