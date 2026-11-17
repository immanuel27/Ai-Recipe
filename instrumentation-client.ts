import posthog from "posthog-js"

import { analyticsEnabled } from "@/lib/analytics"

// PostHog product analytics. Skipped when the env vars are missing (fresh
// clones, demo builds), so the app still runs without them.
if (analyticsEnabled) {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    defaults: "2025-05-24",
    // Only signed-in accounts become PostHog people; visitors stay anonymous
    person_profiles: "identified_only",
    capture_exceptions: true,
    // Session recordings are off here: turn them on in PostHog only if needed (they use up a separate free allowance)
    disable_session_recording: true,
    debug: process.env.NODE_ENV === "development",
  })
}
