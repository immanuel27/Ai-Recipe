import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

import { SUPABASE_KEY, SUPABASE_URL, supabaseConfigured } from "@/lib/supabase/env"

/**
 * Refreshes the auth session cookie on every request (Supabase SSR pattern).
 * `signedIn` is null when Supabase isn't configured (demo mode: no sign-in wall).
 */
export async function updateSession(request: NextRequest): Promise<{ response: NextResponse; signedIn: boolean | null }> {
  let response = NextResponse.next({ request })
  if (!supabaseConfigured) return { response, signedIn: null }

  const supabase = createServerClient(SUPABASE_URL!, SUPABASE_KEY!, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        Object.entries(headers ?? {}).forEach(([key, value]) => response.headers.set(key, value))
      },
    },
  })

  // Don't run code between creating the client and getClaims(): it refreshes the session
  const { data } = await supabase.auth.getClaims()
  return { response, signedIn: !!data?.claims }
}
