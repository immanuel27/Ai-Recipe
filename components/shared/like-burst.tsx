"use client"

import type * as React from "react"

import { LikeIcon } from "@/components/icons"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"

const COUNT = 10

/** Small seeded generator, so a burst looks thrown but renders the same every time. */
function seeded(seed: number) {
  let t = seed * 0x9e3779b9
  return () => {
    t = (t + 0x6d2b79f5) | 0
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

/** Hearts spread around the button and drift upward, a little uneven so it feels thrown. */
function particles(seed: number) {
  const rand = seeded(seed)
  return Array.from({ length: COUNT }, (_, i) => {
    const angle = (i / COUNT) * Math.PI * 2 + (rand() - 0.5) * 0.6
    const distance = 30 + rand() * 28
    return {
      dx: Math.cos(angle) * distance,
      dy: Math.sin(angle) * distance - 14,
      rotate: (rand() - 0.5) * 70,
      scale: 0.7 + rand() * 0.6,
      delay: rand() * 70,
      size: 10 + Math.round(rand() * 6),
    }
  })
}

function Burst({ seed }: { seed: number }) {
  return (
    <>
      <span className="absolute inset-0 animate-[like-ring_480ms_var(--ease-enter)_forwards] rounded-full border-2 border-like opacity-0" />
      {particles(seed).map((p, i) => (
        <LikeIcon
          key={i}
          weight="fill"
          className="absolute top-1/2 left-1/2 animate-[heart-fly_820ms_var(--ease-enter)_forwards] text-like opacity-0"
          style={
            {
              width: p.size,
              height: p.size,
              animationDelay: `${p.delay}ms`,
              "--dx": `${p.dx}px`,
              "--dy": `${p.dy}px`,
              "--r": `${p.rotate}deg`,
              "--s": p.scale,
            } as React.CSSProperties
          }
        />
      ))}
    </>
  )
}

/**
 * A burst of hearts and a ring around a like button. Bump `trigger` on each
 * like; a new key replays it. The parent must be `relative`. Nothing renders
 * with reduced motion, and spent hearts sit at opacity 0 until the next like.
 */
export function LikeBurst({ trigger }: { trigger: number }) {
  const reducedMotion = usePrefersReducedMotion()
  if (trigger === 0 || reducedMotion) return null
  return (
    <span aria-hidden className="pointer-events-none absolute inset-0">
      <Burst key={trigger} seed={trigger} />
    </span>
  )
}
