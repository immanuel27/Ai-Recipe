"use client"

import posthog from "posthog-js"

// Product analytics (PostHog). Everything here is a no-op when the PostHog env
// vars are missing (fresh clones, demo builds), so callers never need to check.

export const analyticsEnabled = Boolean(
  process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN && process.env.NEXT_PUBLIC_POSTHOG_HOST
)

type Props = Record<string, string | number | boolean | null | undefined>

/** Record a product event, e.g. track("recipe_unlocked", { listing_type: "video" }) */
export function track(event: string, properties?: Props) {
  if (analyticsEnabled) posthog.capture(event, properties)
}

/** Report a caught error (error boundaries) */
export function trackError(error: unknown) {
  if (analyticsEnabled) posthog.captureException(error)
}

/** Tie events to the signed-in account: Supabase user id and username only, never the email */
export function identify(userId: string, properties: Props) {
  if (!analyticsEnabled) return
  const current = posthog.get_distinct_id()
  if (current === userId) return void posthog.setPersonProperties(properties)
  // A different person signed in on this device: start them fresh
  if (posthog._isIdentified()) posthog.reset()
  posthog.identify(userId, properties)
}

/** Signed out: stop linking this device's events to the last account */
export function resetIdentity() {
  if (analyticsEnabled && posthog._isIdentified()) posthog.reset()
}
