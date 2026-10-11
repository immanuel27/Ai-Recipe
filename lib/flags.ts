/**
 * Payments are off for now: every recipe is free. Prices are treated as $0
 * everywhere (lib/supabase/mappers.ts, lib/data.ts), and price, checkout, payout
 * and earnings UI is hidden. Flip to true to bring paid recipes back.
 */
export const PAYMENTS_ENABLED = false

/**
 * Email (magic link) sign-in, shown next to Google. Supabase's built-in mailer is
 * heavily rate-limited, so set up custom SMTP (e.g. Resend) in Supabase for it to
 * work reliably at scale. Set to false to show Google only.
 */
export const EMAIL_SIGNIN_ENABLED = true
