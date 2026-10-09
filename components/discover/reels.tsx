"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { CanvasHeader, ScopeTabs } from "@/components/shell/canvas-header"
import { Reel, type ReelEntry } from "@/components/discover/reel"
import { useAppStore } from "@/components/providers/app-store"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { applyAmbient, sampleAmbient } from "@/lib/ambient"

const SCOPES = [
  { value: "all", label: "For you" },
  { value: "following", label: "Following" },
]
const NEXT_KEYS = ["ArrowDown", "PageDown", "j"]
const PREV_KEYS = ["ArrowUp", "PageUp", "k"]

function isTypingTarget(el: EventTarget | null) {
  if (!(el instanceof HTMLElement)) return false
  return (
    el.isContentEditable ||
    ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName) ||
    !!el.closest("[role=dialog],[role=menu],[role=listbox]")
  )
}

/** Discover as reels. The canvas glow takes its colour from the reel on screen. */
export function Reels({ items }: { items: ReelEntry[] }) {
  const scrollerRef = React.useRef<HTMLDivElement>(null)
  const [scope, setScope] = React.useState("all")
  const [active, setActive] = React.useState(0)
  // Reels you said you're not interested in, for this visit
  const [hidden, setHidden] = React.useState<string[]>([])
  const reducedMotion = usePrefersReducedMotion()
  // Sound is on by default. Browsers refuse sound until the visitor's first tap, so until then
  // reels play muted with a "Tap for sound" chip; any tap or key turns sound on from there.
  const [soundOn, setSoundOn] = React.useState(true)
  const [soundBlocked, setSoundBlocked] = React.useState(false)
  const { resolvedTheme } = useTheme()
  const { following } = useAppStore()

  const list = React.useMemo(
    () =>
      (scope === "following" ? items.filter((e) => following.includes(e.creator.id)) : items).filter(
        (e) => !hidden.includes(e.listing.slug)
      ),
    [scope, items, following, hidden]
  )

  function hide(slug: string) {
    setHidden((h) => [...h, slug])
    toast("Hidden from your feed", {
      action: { label: "Undo", onClick: () => setHidden((h) => h.filter((s) => s !== slug)) },
    })
  }

  function changeScope(next: string) {
    setScope(next)
    setActive(0)
    scrollerRef.current?.scrollTo({ top: 0 })
    window.scrollTo({ top: 0 })
  }

  // Phones scroll the page itself (so the browser can hide its toolbar): snap it reel by reel
  React.useEffect(() => {
    document.documentElement.classList.add("snap-feed")
    return () => document.documentElement.classList.remove("snap-feed")
  }, [])

  // The first tap or key anywhere unlocks sound: unmute the reel on screen inside that gesture
  React.useEffect(() => {
    if (!soundBlocked) return
    function unlock() {
      const v = document.querySelector<HTMLVideoElement>("[data-reel][data-active] video")
      if (v) {
        v.muted = false
        // iOS may pause a video unmuted outside a gesture; fall back to muted playback
        v.play().catch(() => {
          v.muted = true
          v.play().catch(() => {})
        })
      }
      setSoundBlocked(false)
      setSoundOn(true)
    }
    const opts = { capture: true, once: true } as const
    window.addEventListener("click", unlock, opts)
    window.addEventListener("touchend", unlock, opts)
    window.addEventListener("keydown", unlock, opts)
    return () => {
      window.removeEventListener("click", unlock, opts)
      window.removeEventListener("touchend", unlock, opts)
      window.removeEventListener("keydown", unlock, opts)
    }
  }, [soundBlocked])

  // Which reel is on screen (viewport-based: works for the page scroll on phones and the
  // inner scroller on larger screens)
  React.useEffect(() => {
    const root = scrollerRef.current
    if (!root) return
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.index))
        }
      },
      { threshold: 0.6 }
    )
    root.querySelectorAll("[data-reel]").forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [list])

  // Repaint the glow from the reel on screen; hand it back to the theme on the way out
  const current = list[active]?.listing
  React.useEffect(() => {
    if (!current) return
    let live = true
    sampleAmbient(current.posterUrl, resolvedTheme !== "light").then((a) => {
      if (live && a) applyAmbient(a)
    })
    return () => {
      live = false
    }
  }, [current, resolvedTheme])
  React.useEffect(() => () => applyAmbient(null), [])

  const goTo = React.useCallback(
    (i: number) => {
      const clamped = Math.max(0, Math.min(list.length - 1, i))
      scrollerRef.current
        ?.querySelector(`[data-reel][data-index="${clamped}"]`)
        ?.scrollIntoView({ block: "start", behavior: reducedMotion ? "auto" : "smooth" })
    },
    [list.length, reducedMotion]
  )

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey || isTypingTarget(e.target)) return
      if (NEXT_KEYS.includes(e.key)) {
        e.preventDefault()
        goTo(active + 1)
      } else if (PREV_KEYS.includes(e.key)) {
        e.preventDefault()
        goTo(active - 1)
      } else if (e.key === "m") {
        setSoundOn((on) => !on)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [active, goTo])

  return (
    <div className="flex flex-col md:absolute md:inset-0">
      {/* Phones: floats over the reels, so each reel can fill the screen */}
      <CanvasHeader
        className="max-md:fixed max-md:inset-x-0 max-md:top-0 max-md:z-30 max-md:bg-linear-to-b max-md:from-scrim/70 max-md:to-transparent max-md:pb-6"
        center={<ScopeTabs label="Show reels from" options={SCOPES} value={scope} onChange={changeScope} />} />
      <h1 className="sr-only">Discover</h1>

      {list.length > 0 ? (
        <div
          ref={scrollerRef}
          aria-label="Reels"
          className="no-scrollbar md:min-h-0 md:flex-1 md:snap-y md:snap-mandatory md:overflow-y-scroll md:overscroll-contain"
        >
          {list.map((entry, i) => (
            <Reel
              key={entry.listing.id}
              entry={entry}
              index={i}
              active={i === active}
              near={Math.abs(i - active) <= 1}
              soundOn={soundOn}
              soundBlocked={soundBlocked}
              onSoundBlocked={() => setSoundBlocked(true)}
              onHide={() => hide(entry.listing.slug)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
          <p className="type-section">No reels from people you follow yet</p>
          <p className="max-w-sm text-muted-foreground">
            Tap the plus under a creator&apos;s avatar to follow them. Their new recipes show up here.
          </p>
          <Button size="pill" onClick={() => changeScope("all")}>
            Browse For you
          </Button>
        </div>
      )}
    </div>
  )
}
