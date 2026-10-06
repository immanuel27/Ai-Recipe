"use client"

import * as React from "react"

import { LikeIcon } from "@/components/icons"

/** Max gap between two taps to count as a double-tap */
const DOUBLE_TAP_MS = 260

interface Burst {
  id: number
  x: number
  y: number
}

/**
 * One tap runs onSingle after a short wait; a second tap inside the window
 * runs onDouble instead and drops a heart where it landed. Keyboard
 * activation (detail === 0) acts as a single tap immediately.
 */
export function useDoubleTap({ onSingle, onDouble }: { onSingle?: () => void; onDouble: () => void }) {
  const timer = React.useRef<number | null>(null)
  const handlers = React.useRef({ onSingle, onDouble })
  const [bursts, setBursts] = React.useState<Burst[]>([])

  React.useEffect(() => {
    handlers.current = { onSingle, onDouble }
  })

  React.useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current)
    },
    []
  )

  const onTap = React.useCallback((e: React.MouseEvent<HTMLElement>) => {
    if (e.detail === 0) return handlers.current.onSingle?.()
    if (timer.current) {
      window.clearTimeout(timer.current)
      timer.current = null
      handlers.current.onDouble()
      const rect = e.currentTarget.getBoundingClientRect()
      const burst = { id: Date.now(), x: e.clientX - rect.left, y: e.clientY - rect.top }
      setBursts((b) => [...b, burst])
      window.setTimeout(() => setBursts((b) => b.filter((x) => x.id !== burst.id)), 800)
      return
    }
    timer.current = window.setTimeout(() => {
      timer.current = null
      handlers.current.onSingle?.()
    }, DOUBLE_TAP_MS)
  }, [])

  return { bursts, onTap }
}

/** Hearts that pop where the user double-tapped. Parent must be `relative`. */
export function HeartBursts({ bursts }: { bursts: Burst[] }) {
  return bursts.map((b) => (
    <LikeIcon
      key={b.id}
      aria-hidden
      weight="fill"
      // Centre the 96px heart on the tap point (offsets, not translate, which the animation uses)
      style={{ left: b.x - 48, top: b.y - 48 }}
      className="pointer-events-none absolute z-20 size-24 text-like drop-shadow-lg motion-safe:animate-[heart-burst_800ms_ease-out_forwards]"
    />
  ))
}
