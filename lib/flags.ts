/**
 * Payments are off for now: every recipe is free. Prices are treated as $0
 * everywhere (lib/supabase/mappers.ts, lib/data.ts), and price, checkout, payout
 * and earnings UI is hidden. Flip to true to bring paid recipes back.
 */
export const PAYMENTS_ENABLED = false

/**
 * Email (magic link) sign-in is hidden for now: Supabase's built-in mailer is
 * rate-limited, so everyone signs up with Google. Turn on once custom SMTP
 * (e.g. Resend) is set up in Supabase.
 */
export const EMAIL_SIGNIN_ENABLED = false
