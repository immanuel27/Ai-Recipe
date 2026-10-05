"use client"

import * as React from "react"
import {
  MaximizeIcon,
  MinimizeIcon,
  PauseIcon,
  PlayIcon,
  Volume2Icon,
  VolumeXIcon,
  XIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { useVideoAspect } from "@/components/shared/fit-media"
import { MediaCarousel } from "@/components/shared/media-carousel"
import { clipSrc, useClipLoop } from "@/components/shared/use-clip"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import type { Listing } from "@/lib/types"
import { cn } from "@/lib/utils"

const overlayButton =
  "bg-scrim/50 text-on-media backdrop-blur-md hover:bg-scrim/70 hover:text-on-media focus-visible:ring-on-media/60"

/** A phone held sideways: landscape and not much height. */
const PHONE_LANDSCAPE = "(orientation: landscape) and (max-height: 520px)"

function subscribePhoneLandscape(cb: () => void) {
  const mql = window.matchMedia(PHONE_LANDSCAPE)
  mql.addEventListener("change", cb)
  return () => mql.removeEventListener("change", cb)
}

function usePhoneLandscape() {
  return React.useSyncExternalStore(
    subscribePhoneLandscape,
    () => window.matchMedia(PHONE_LANDSCAPE).matches,
    () => false
  )
}

export function ListingMedia({ listing, className }: { listing: Listing; className?: string }) {
  if (listing.type === "video") return <ListingVideo listing={listing} className={className} />

  return (
    <div
      className={cn(
        "relative aspect-4/5 w-full overflow-hidden rounded-xl bg-scrim ring-1 ring-foreground/10 sm:aspect-square lg:aspect-auto lg:h-[min(78dvh,820px)]",
        className
      )}
    >
      <MediaCarousel
        images={listing.images ?? [listing.mediaUrl]}
        alt={listing.title}
        sizes="(min-width: 1024px) 60vw, 100vw"
        priority
      />
    </div>
  )
}

/**
 * The video in its true shape: the frame takes the video's own aspect ratio
 * (capped in height), so nothing is cropped. Rotating a phone sideways lets the
 * video take over the screen; the fullscreen button does the same on demand.
 */
function ListingVideo({ listing, className }: { listing: Listing; className?: string }) {
  const frameRef = React.useRef<HTMLDivElement>(null)
  const videoRef = React.useRef<HTMLVideoElement>(null)
  const aspect = useVideoAspect(videoRef) ?? 16 / 9
  useClipLoop(videoRef, listing.clip)
  const reducedMotion = usePrefersReducedMotion()
  const phoneLandscape = usePhoneLandscape()
  const [muted, setMuted] = React.useState(true)
  const [playing, setPlaying] = React.useState(false)
  const [inView, setInView] = React.useState(true)
  const [dismissed, setDismissed] = React.useState(false)
  const [isFullscreen, setIsFullscreen] = React.useState(false)

  // Sideways phone + video on screen → full-screen takeover (no gesture needed)
  const takeover = phoneLandscape && inView && !dismissed

  React.useEffect(() => {
    const v = videoRef.current
    if (!v) return
    if (reducedMotion) v.pause()
    else v.play().catch(() => {})
  }, [reducedMotion])

  React.useEffect(() => {
    if (videoRef.current) videoRef.current.muted = muted
  }, [muted])

  React.useEffect(() => {
    const el = frameRef.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setInView(e!.intersectionRatio >= 0.5), {
      threshold: [0, 0.5, 1],
    })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // A dismissed takeover comes back on the next rotation
  React.useEffect(() => {
    const mql = window.matchMedia(PHONE_LANDSCAPE)
    const onChange = () => setDismissed(false)
    mql.addEventListener("change", onChange)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  React.useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener("fullscreenchange", onChange)
    return () => document.removeEventListener("fullscreenchange", onChange)
  }, [])

  // Lock page scroll behind the takeover
  React.useEffect(() => {
    if (!takeover) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [takeover])

  function togglePlay() {
    const v = videoRef.current
    if (!v) return
    if (v.paused) v.play().catch(() => {})
    else v.pause()
  }

  async function toggleFullscreen() {
    const frame = frameRef.current
    const video = videoRef.current as (HTMLVideoElement & { webkitEnterFullscreen?: () => void }) | null
    if (!frame || !video) return
    if (document.fullscreenElement) {
      await document.exitFullscreen().catch(() => {})
      return
    }
    if (frame.requestFullscreen) {
      await frame.requestFullscreen().catch(() => {})
      // Turn the phone's screen sideways for landscape videos where supported (Android Chrome)
      if (aspect > 1) {
        const orientation = screen.orientation as ScreenOrientation & {
          lock?: (o: "landscape") => Promise<void>
        }
        await orientation.lock?.("landscape").catch(() => {})
      }
    } else {
      // iPhone Safari only allows the native video player to go fullscreen
      video.webkitEnterFullscreen?.()
    }
  }

  const immersive = takeover || isFullscreen

  return (
    <div className={cn("flex w-full justify-center", className)}>
      <div
        ref={frameRef}
        style={{ "--ar": aspect } as React.CSSProperties}
        className={cn(
          "relative w-full overflow-hidden bg-scrim",
          immersive
            ? "fixed inset-0 z-60 h-dvh w-dvw"
            : "aspect-(--ar) max-h-[min(78dvh,820px)] max-w-[calc(min(78dvh,820px)*var(--ar))] rounded-xl ring-1 ring-foreground/10"
        )}
      >
        <video
          ref={videoRef}
          className="absolute inset-0 size-full object-contain"
          src={clipSrc(listing)}
          poster={listing.posterUrl}
          muted
          loop
          playsInline
          preload="metadata"
          aria-label={listing.title}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
        />

        {takeover && (
          <Button
            variant="ghost"
            size="icon-pill"
            className={cn(overlayButton, "absolute top-3 left-3 size-10")}
            onClick={() => setDismissed(true)}
            aria-label="Exit full screen"
          >
            <XIcon />
          </Button>
        )}

        <div className="absolute right-3 bottom-3 flex gap-2">
          <Button
            variant="ghost"
            size="icon-pill"
            className={overlayButton}
            onClick={togglePlay}
            aria-label={playing ? "Pause video" : "Play video"}
          >
            {playing ? <PauseIcon className="fill-current" /> : <PlayIcon className="fill-current" />}
          </Button>
          <Button
            variant="ghost"
            size="icon-pill"
            className={overlayButton}
            onClick={() => setMuted((m) => !m)}
            aria-label={muted ? "Unmute" : "Mute"}
            aria-pressed={!muted}
          >
            {muted ? <VolumeXIcon /> : <Volume2Icon />}
          </Button>
          {!takeover && (
            <Button
              variant="ghost"
              size="icon-pill"
              className={overlayButton}
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? "Exit full screen" : "Full screen"}
            >
              {isFullscreen ? <MinimizeIcon /> : <MaximizeIcon />}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
