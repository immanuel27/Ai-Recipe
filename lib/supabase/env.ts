export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL

/**
 * The browser-safe key. Accepts the new publishable key or the legacy anon key
 * (the Supabase ↔ Vercel integration sets NEXT_PUBLIC_SUPABASE_ANON_KEY).
 * NEXT_PUBLIC_* values are baked in at build time: redeploy after changing them.
 */
export const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

/** False on a fresh clone without .env.local: the app then runs on the demo data in lib/mock. */
export const supabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_KEY)
