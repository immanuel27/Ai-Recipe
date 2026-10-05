/** Public profile URL for a creator. */
export function profileHref(username: string) {
  return `/u/${encodeURIComponent(username)}`
}
