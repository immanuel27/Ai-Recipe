import type { MonthlyEarning, Sale } from "@/lib/types"

/** Sample seller data (shown on Profile → Overview when "Sample data" is on). */
export const SAMPLE_SELLER_CREATOR_ID = "c1"

export const SAMPLE_SALES: Sale[] = [
  { id: "s1", listingSlug: "neon-alley-chase", buyer: "pixelpilot", price: 1200, date: "2026-10-03T08:12:00Z" },
  { id: "s2", listingSlug: "liquid-chrome-sneaker", buyer: "nora.cuts", price: 1800, date: "2026-10-02T19:40:00Z" },
  { id: "s3", listingSlug: "neon-alley-chase", buyer: "studio_halvorsen", price: 1200, date: "2026-10-02T11:05:00Z" },
  { id: "s4", listingSlug: "liquid-chrome-sneaker", buyer: "ttran", price: 1800, date: "2026-10-01T16:22:00Z" },
  { id: "s5", listingSlug: "neon-alley-chase", buyer: "loopsmith", price: 1200, date: "2026-09-30T09:48:00Z" },
  { id: "s6", listingSlug: "liquid-chrome-sneaker", buyer: "ada.motion", price: 1800, date: "2026-09-29T21:10:00Z" },
]

export const SAMPLE_EARNINGS: MonthlyEarning[] = [
  { month: "May", earnings: 41200, sales: 38 },
  { month: "Jun", earnings: 52800, sales: 47 },
  { month: "Jul", earnings: 47600, sales: 42 },
  { month: "Aug", earnings: 68900, sales: 61 },
  { month: "Sep", earnings: 83400, sales: 72 },
  { month: "Oct", earnings: 9600, sales: 8 },
]

export const SAMPLE_NEXT_PAYOUT = { date: "2026-10-15", amount: 83400 }
export const SAMPLE_CLAIMABLE_GROSS = 12000
