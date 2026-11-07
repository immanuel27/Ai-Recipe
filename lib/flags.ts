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
 *
 * Off since 2026-11-07: magic links failed for most people (10 of 12), because a
 * PKCE link only works in the browser that asked for it (X's in-app browser →
 * Safari breaks it) and the built-in mailer barely delivers. Bring it back with a
 * 6-digit code typed on the same page plus Resend SMTP.
 */
export const EMAIL_SIGNIN_ENABLED = false
