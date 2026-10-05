"use client"

import * as React from "react"

import { FeedItem, type FeedEntry } from "@/components/feed/feed-item"
import { Logo } from "@/components/shell/logo"
import { UserMenu } from "@/components/shell/user-menu"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"

const NAV_KEYS_NEXT = ["ArrowDown", "PageDown", "j"]
const NAV_KEYS_PREV = ["ArrowUp", "PageUp", "k"]

function isTypingTarget(el: EventTarget | null) {
  if (!(el instanceof HTMLElement)) return false
  return (
    el.isContentEditable ||
    ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName) ||
    !!el.closest("[role=dialog],[role=menu],[role=listbox]")
  )
}

export function Feed({ items }: { items: FeedEntry[] }) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [active, setActive] = React.useState(0)
  const [muted, setMuted] = React.useState(true)
  const [announcement, setAnnouncement] = React.useState("")
  const reducedMotion = usePrefersReducedMotion()

  // Track which item is on screen
  React.useEffect(() => {
    const root = containerRef.current
    if (!root) return
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(Number((entry.target as HTMLElement).dataset.index))
          }
        }
      },
      { root, threshold: 0.6 }
    )
    root.querySelectorAll("[data-feed-item]").forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [items.length])

  const goTo = React.useCallback(
    (index: number) => {
      const root = containerRef.current
      if (!root) return
      const clamped = Math.max(0, Math.min(items.length - 1, index))
      root.scrollTo({
        top: clamped * root.clientHeight,
        behavior: reducedMotion ? "auto" : "smooth",
      })
    },
    [items.length, reducedMotion]
  )

  const toggleMute = React.useCallback(() => {
    setMuted((m) => {
      setAnnouncement(m ? "Sound on" : "Sound off")
      return !m
    })
  }, [])

  // Keyboard navigation: up/down (and j/k) move between items, m toggles sound
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey || isTypingTarget(e.target)) return
      if (NAV_KEYS_NEXT.includes(e.key)) {
        e.preventDefault()
        goTo(active + 1)
      } else if (NAV_KEYS_PREV.includes(e.key)) {
        e.preventDefault()
        goTo(active - 1)
      } else if (e.key === "m") {
        toggleMute()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [active, goTo, toggleMute])

  return (
    <div className="flex flex-1 justify-center md:px-6 md:py-4 short:p-0!">
      <h1 className="sr-only">Recipe feed</h1>
      <section
        aria-label="Recipe feed"
        className="relative h-dvh w-full overflow-hidden bg-scrim md:h-[calc(100dvh-7rem)] md:max-w-[420px] md:rounded-3xl md:shadow-lg md:ring-1 md:ring-foreground/10 short:h-dvh! short:max-w-none! short:rounded-none! short:shadow-none! short:ring-0!"
      >
        {/* Mobile overlay header (the site header is hidden on the mobile feed) */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between bg-linear-to-b from-scrim/70 to-transparent px-4 pt-[calc(env(safe-area-inset-top)+0.75rem)] pb-8 md:hidden">
          <div className="pointer-events-auto">
            <Logo onMedia />
          </div>
          <div className="pointer-events-auto">
            <UserMenu />
          </div>
        </div>

        <div
          ref={containerRef}
          className="no-scrollbar h-full snap-y snap-mandatory overflow-y-scroll overscroll-contain"
        >
          {items.map((item, i) => (
            <FeedItem
              key={item.listing.id}
              entry={item}
              index={i}
              active={i === active}
              near={Math.abs(i - active) <= 1}
              muted={muted}
              reducedMotion={reducedMotion}
              onToggleMute={toggleMute}
            />
          ))}
        </div>
        <p className="sr-only" aria-live="polite">
          {announcement}
        </p>
      </section>
    </div>
  )
}
