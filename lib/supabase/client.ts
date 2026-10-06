import { createBrowserClient } from "@supabase/ssr"

import { SUPABASE_KEY, SUPABASE_URL } from "@/lib/supabase/env"

/** Supabase in the browser (signed-in user's session from cookies). */
export function createClient() {
  return createBrowserClient(SUPABASE_URL!, SUPABASE_KEY!)
}
