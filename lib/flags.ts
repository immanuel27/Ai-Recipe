/**
 * Payments are off for now: every recipe is free. Prices are treated as $0
 * everywhere (lib/supabase/mappers.ts, lib/data.ts), and price, checkout, payout
 * and earnings UI is hidden. Flip to true to bring paid recipes back.
 */
export const PAYMENTS_ENABLED = false
