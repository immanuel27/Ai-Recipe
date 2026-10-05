"use client"

import * as React from "react"

import { MediaImage } from "@/components/shared/media-image"
import { cn } from "@/lib/utils"

export type FitMode = "cover" | "contain"

/** Live width/height ratio of an element (updates on resize and rotation). */
export function useFrameAspect(frameRef: React.RefObject<HTMLElement | null>) {
  const [frameAspect, setFrameAspect] = React.useState<number | null>(null)

  React.useEffect(() => {
    const el = frameRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry!.contentRect
      if (width && height) setFrameAspect(width / height)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [frameRef])

  return frameAspect
}

/**
 * TikTok/Shorts-style fit: fill the frame when the media is close to the
 * frame's shape (light cropping), otherwise show it whole and letterbox it.
 * `tolerance` is how far apart (log ratio) shapes can be and still fill: 0.3 ≈ 35%.
 */
export function fitFor(mediaAspect: number | null, frameAspect: number | null, tolerance = 0.3): FitMode {
  if (!mediaAspect || !frameAspect) return "cover"
  return Math.abs(Math.log(mediaAspect / frameAspect)) <= tolerance ? "cover" : "contain"
}

/** fitFor() against a live frame. Re-evaluates on resize (rotation, desktop vs phone). */
export function useFitMode(
  frameRef: React.RefObject<HTMLElement | null>,
  mediaAspect: number | null,
  tolerance = 0.3
): FitMode {
  return fitFor(mediaAspect, useFrameAspect(frameRef), tolerance)
}

/**
 * An image that fills its parent. When letterboxed, a blurred copy of the
 * image fills the empty space behind it.
 */
export function FitImage({
  src,
  alt,
  priority,
  sizes,
  className,
}: {
  src: string
  alt: string
  priority?: boolean
  sizes: string
  className?: string
}) {
  const frameRef = React.useRef<HTMLDivElement>(null)
  const [aspect, setAspect] = React.useState<number | null>(null)
  const mode = useFitMode(frameRef, aspect)

  return (
    <div ref={frameRef} className={cn("relative size-full overflow-hidden bg-scrim", className)}>
      {mode === "contain" && (
        <MediaImage
          src={src}
          alt=""
          aria-hidden
          fill
          sizes="64px"
          className="scale-110 object-cover opacity-70 blur-2xl"
        />
      )}
      <MediaImage
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        draggable={false}
        onLoad={(e) => {
          const img = e.currentTarget
          if (img.naturalWidth && img.naturalHeight) setAspect(img.naturalWidth / img.naturalHeight)
        }}
        className={cn("select-none", mode === "contain" ? "object-contain" : "object-cover")}
      />
    </div>
  )
}

/**
 * A video's natural aspect ratio. Also covers metadata that loaded before
 * hydration, when React's onLoadedMetadata would never fire.
 */
export function useVideoAspect(videoRef: React.RefObject<HTMLVideoElement | null>, src?: string) {
  const [aspect, setAspect] = React.useState<number | null>(null)

  React.useEffect(() => {
    const v = videoRef.current
    if (!v) return
    const read = () => {
      if (v.videoWidth && v.videoHeight) setAspect(v.videoWidth / v.videoHeight)
    }
    if (v.readyState >= HTMLMediaElement.HAVE_METADATA) read()
    v.addEventListener("loadedmetadata", read)
    return () => v.removeEventListener("loadedmetadata", read)
  }, [videoRef, src])

  return aspect
}
