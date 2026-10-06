"use client"

import * as React from "react"

import { CaretLeftIcon, CaretRightIcon } from "@/components/icons"
import { FitImage } from "@/components/shared/fit-media"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface MediaCarouselHandle {
  step: (dir: 1 | -1) => void
}

/**
 * Swipeable image carousel (horizontal scroll-snap). Works with touch swipes,
 * trackpads, arrow buttons on hover and the step() handle for keyboard control.
 * Each slide letterboxes non-matching shapes over a blurred backdrop.
 */
export function MediaCarousel({
  ref,
  images,
  alt,
  sizes,
  priority,
  onTap,
  dotsClassName,
  className,
}: {
  ref?: React.Ref<MediaCarouselHandle>
  images: string[]
  alt: string
  sizes: string
  priority?: boolean
  /** Click/tap on the media (e.g. double-tap to like) */
  onTap?: (e: React.MouseEvent<HTMLElement>) => void
  dotsClassName?: string
  className?: string
}) {
  const scrollerRef = React.useRef<HTMLDivElement>(null)
  const [index, setIndex] = React.useState(0)
  const reducedMotion = usePrefersReducedMotion()
  const many = images.length > 1

  const goTo = React.useCallback(
    (i: number) => {
      const el = scrollerRef.current
      if (!el) return
      const next = Math.max(0, Math.min(images.length - 1, i))
      el.scrollTo({ left: next * el.clientWidth, behavior: reducedMotion ? "auto" : "smooth" })
    },
    [images.length, reducedMotion]
  )

  React.useImperativeHandle(ref, () => ({ step: (dir) => goTo(index + dir) }), [goTo, index])

  return (
    <div
      role={many ? "region" : undefined}
      aria-roledescription={many ? "carousel" : undefined}
      aria-label={many ? `${alt}, ${images.length} images` : undefined}
      className={cn("group/carousel relative size-full", className)}
    >
      <div
        ref={scrollerRef}
        onClick={onTap}
        onScroll={(e) => {
          const el = e.currentTarget
          setIndex(Math.round(el.scrollLeft / el.clientWidth))
        }}
        className="no-scrollbar flex size-full touch-manipulation snap-x snap-mandatory overflow-x-auto overscroll-x-contain"
      >
        {images.map((src, i) => (
          <div
            key={src + i}
            role={many ? "group" : undefined}
            aria-roledescription={many ? "slide" : undefined}
            aria-label={many ? `${i + 1} of ${images.length}` : undefined}
            className="relative h-full w-full shrink-0 snap-center snap-always"
          >
            <FitImage
              src={src}
              alt={many ? `${alt} (image ${i + 1} of ${images.length})` : alt}
              sizes={sizes}
              priority={priority && i === 0}
            />
          </div>
        ))}
      </div>

      {many && (
        <>
          <div
            aria-hidden
            className={cn(
              "pointer-events-none absolute left-1/2 flex -translate-x-1/2 gap-1 drop-shadow",
              dotsClassName ?? "bottom-3"
            )}
          >
            {images.map((_, i) => (
              <span
                key={i}
                className={cn(
                  "size-1.5 rounded-full bg-on-media transition-opacity duration-160",
                  i === index ? "opacity-100" : "opacity-40"
                )}
              />
            ))}
          </div>
          <p className="sr-only" aria-live="polite">
            Image {index + 1} of {images.length}
          </p>

          {/* Arrow buttons for mouse users; touch users swipe */}
          {index > 0 && (
            <button
              type="button"
              onClick={() => goTo(index - 1)}
              aria-label="Previous image"
              className="absolute top-1/2 left-3 z-10 hidden size-7 -translate-y-1/2 items-center justify-center rounded-full bg-on-media/85 text-scrim shadow-md opacity-0 transition-opacity outline-none group-hover/carousel:opacity-100 focus-visible:opacity-100 focus-visible:ring-3 focus-visible:ring-on-media/60 pointer-fine:flex"
            >
              <CaretLeftIcon weight="bold" className="size-4" aria-hidden />
            </button>
          )}
          {index < images.length - 1 && (
            <button
              type="button"
              onClick={() => goTo(index + 1)}
              aria-label="Next image"
              className="absolute top-1/2 right-3 z-10 hidden size-7 -translate-y-1/2 items-center justify-center rounded-full bg-on-media/85 text-scrim shadow-md opacity-0 transition-opacity outline-none group-hover/carousel:opacity-100 focus-visible:opacity-100 focus-visible:ring-3 focus-visible:ring-on-media/60 pointer-fine:flex"
            >
              <CaretRightIcon weight="bold" className="size-4" aria-hidden />
            </button>
          )}
        </>
      )}
    </div>
  )
}
