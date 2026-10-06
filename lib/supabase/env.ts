export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
export const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

/** False on a fresh clone without .env.local: the app then runs on the demo data in lib/mock. */
export const supabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_KEY)
