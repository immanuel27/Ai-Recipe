"use client"

import * as React from "react"

import type { Listing } from "@/lib/types"

/** Media-fragment URL so the browser starts loading/playing at the clip start. */
export function clipSrc(listing: Pick<Listing, "mediaUrl" | "clip">) {
  return listing.clip ? `${listing.mediaUrl}#t=${listing.clip.start}` : listing.mediaUrl
}

/** Keep playback inside listing.clip, looping back to the start at the end. */
export function useClipLoop(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  clip: Listing["clip"],
  /** Re-attach when the <video> element mounts later (e.g. hover previews) */
  mounted = true
) {
  const start = clip?.start
  const end = clip?.end

  React.useEffect(() => {
    const v = videoRef.current
    if (!v || start === undefined || end === undefined || !mounted) return
    const keepInRange = () => {
      if (v.currentTime >= end || v.currentTime < start - 1) v.currentTime = start
    }
    v.addEventListener("timeupdate", keepInRange)
    return () => v.removeEventListener("timeupdate", keepInRange)
  }, [videoRef, start, end, mounted])
}
