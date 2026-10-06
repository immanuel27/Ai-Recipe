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
  const [muted, setMuted] = React.useState(true)
  const [announcement, setAnnouncement] = React.useState("")
  const reducedMotion = usePrefersReducedMotion()
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
  }

  // Which reel is on screen
  React.useEffect(() => {
    const root = scrollerRef.current
    if (!root) return
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.index))
        }
      },
      { root, threshold: 0.6 }
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
      const root = scrollerRef.current
      if (!root) return
      const clamped = Math.max(0, Math.min(list.length - 1, i))
      root.scrollTo({ top: clamped * root.clientHeight, behavior: reducedMotion ? "auto" : "smooth" })
    },
    [list.length, reducedMotion]
  )

  const toggleMute = React.useCallback(() => {
    setMuted((m) => {
      setAnnouncement(m ? "Sound on" : "Sound off")
      return !m
    })
  }, [])

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey || isTypingTarget(e.target)) return
      if (NEXT_KEYS.includes(e.key)) {
        e.preventDefault()
        goTo(active + 1)
      } else if (PREV_KEYS.includes(e.key)) {
        e.preventDefault()
        goTo(active - 1)
      } else if (e.key === "m") toggleMute()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [active, goTo, toggleMute])

  return (
    <div className="absolute inset-0 flex flex-col">
      <CanvasHeader center={<ScopeTabs label="Show reels from" options={SCOPES} value={scope} onChange={changeScope} />} />
      <h1 className="sr-only">Discover</h1>

      {list.length > 0 ? (
        <div
          ref={scrollerRef}
          aria-label="Reels"
          className="no-scrollbar min-h-0 flex-1 snap-y snap-mandatory overflow-y-scroll overscroll-contain"
        >
          {list.map((entry, i) => (
            <Reel
              key={entry.listing.id}
              entry={entry}
              index={i}
              active={i === active}
              near={Math.abs(i - active) <= 1}
              muted={muted}
              reducedMotion={reducedMotion}
              onToggleMute={toggleMute}
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
      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>
    </div>
  )
}
