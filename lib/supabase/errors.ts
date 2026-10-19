/** Shown instead of Supabase's own wording when the backend is paused (e.g. a plan limit) */
export const MAINTENANCE_MESSAGE =
  "Ai Recipy is taking a quick break for maintenance. Please try again in a little while."

/** Supabase blocks the whole project (402) when a plan limit is hit */
export function isServiceRestricted(message: string | undefined | null) {
  return !!message && /restricted due to|exceed_\w*quota|payment required|spend cap/i.test(message)
}

/** The message people should see: never Supabase's billing or quota wording */
export function friendlyError(message: string) {
  return isServiceRestricted(message) ? MAINTENANCE_MESSAGE : message
}
