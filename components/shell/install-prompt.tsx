"use client"

import * as React from "react"

import { AddToHomeIcon, CloseIcon, IosShareIcon } from "@/components/icons"
import { useAppStore } from "@/components/providers/app-store"
import { useVisitInfo } from "@/components/providers/presence-ping"
import { LogoMark } from "@/components/shell/logo-mark"
import { Button } from "@/components/ui/button"

const DISMISS_KEY = "airecipy-install-dismissed"
const SNOOZE_MS = 14 * 24 * 60 * 60_000
/** A visit counts as "coming back" when the last one was at least this long ago */
const RETURN_GAP_MS = 30 * 60_000
const ENGAGED_EVENT = "airecipy:engaged"

/** Call after a moment people enjoy (copying a prompt, publishing): a good time to offer the app. */
export function markEngaged() {
  window.dispatchEvent(new Event(ENGAGED_EVENT))
}

type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> }

function snoozed() {
  try {
    const at = Number(localStorage.getItem(DISMISS_KEY) ?? 0)
    return Date.now() - at < SNOOZE_MS
  } catch {
    return false
  }
}

function standalone() {
  return window.matchMedia("(display-mode: standalone)").matches || (navigator as { standalone?: boolean }).standalone === true
}

const isIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
const isPhone = () => window.matchMedia("(pointer: coarse)").matches && window.innerWidth < 1024

/**
 * "Keep Ai Recipy on your phone": a small card above the dock, offered to signed-in
 * phone users once they're coming back or have just enjoyed something. Android gets
 * the real one-tap install; iPhone gets the two Share-menu steps (Apple has no API).
 * Never shown in the installed app; "Not now" hides it for two weeks.
 */
export function InstallPrompt() {
  const { user } = useAppStore()
  const visit = useVisitInfo()
  const [installEvent, setInstallEvent] = React.useState<InstallEvent | null>(null)
  const [engaged, setEngaged] = React.useState(false)
  const [open, setOpen] = React.useState(false)
  const [ios, setIos] = React.useState(false)

  // Android/Chrome: keep the browser's install prompt for our own button
  React.useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault()
      setInstallEvent(e as InstallEvent)
    }
    const onInstalled = () => setOpen(false)
    const onEngaged = () => setEngaged(true)
    window.addEventListener("beforeinstallprompt", onPrompt)
    window.addEventListener("appinstalled", onInstalled)
    window.addEventListener(ENGAGED_EVENT, onEngaged)
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt)
      window.removeEventListener("appinstalled", onInstalled)
      window.removeEventListener(ENGAGED_EVENT, onEngaged)
    }
  }, [])

  // Decide once the moment is right (a short pause so it never lands on top of page load)
  React.useEffect(() => {
    const returning = !!visit?.previousSeenAt && Date.now() - new Date(visit.previousSeenAt).getTime() > RETURN_GAP_MS
    if (open || !user || !(returning || engaged)) return
    if (standalone() || !isPhone() || snoozed()) return
    const onIos = isIos()
    if (!onIos && !installEvent) return // nothing we can offer on this browser
    const t = window.setTimeout(() => {
      setIos(onIos)
      setOpen(true)
    }, engaged ? 1500 : 8000)
    return () => window.clearTimeout(t)
  }, [open, user, visit, engaged, installEvent])

  function dismiss() {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()))
    } catch {
      // Private mode: it may come back next visit
    }
    setOpen(false)
  }

  async function install() {
    if (!installEvent) return
    await installEvent.prompt()
    const { outcome } = await installEvent.userChoice
    setInstallEvent(null)
    if (outcome === "accepted") setOpen(false)
    else dismiss()
  }

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-labelledby="install-title"
      className="fixed inset-x-3 bottom-[calc(var(--spacing-dock-bar)+0.75rem)] z-40 mx-auto max-w-md rounded-2xl bg-popover p-4 text-popover-foreground shadow-2xl ring-1 ring-foreground/10 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-4 md:bottom-6"
    >
      <button
        type="button"
        onClick={dismiss}
        aria-label="Not now"
        className="absolute top-3 right-3 flex size-8 items-center justify-center rounded-full text-muted-foreground outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
      >
        <CloseIcon aria-hidden className="size-4" />
      </button>
      <div className="flex items-start gap-3 pr-8">
        <LogoMark className="size-12 rounded-xl" />
        <div className="flex min-w-0 flex-col gap-1">
          <p id="install-title" className="font-semibold">
            Keep Ai Recipy on your phone
          </p>
          <p className="text-sm text-muted-foreground">One tap to your favourite recipes, full screen like an app.</p>
        </div>
      </div>

      {ios ? (
        <ol className="mt-4 flex flex-col gap-2 rounded-xl bg-muted p-3 text-sm">
          <li className="flex items-center gap-2">
            <span className="font-semibold">1.</span> Tap <IosShareIcon aria-label="Share" className="size-5 text-link" />{" "}
            <span className="font-semibold">Share</span> in your browser
          </li>
          <li className="flex items-center gap-2">
            <span className="font-semibold">2.</span> Choose <AddToHomeIcon aria-hidden className="size-5 text-link" />{" "}
            <span className="font-semibold">Add to Home Screen</span>
          </li>
        </ol>
      ) : (
        <div className="mt-4 flex gap-2">
          <Button size="pill" className="flex-1" onClick={() => void install()}>
            Add to home screen
          </Button>
          <Button size="pill" variant="ghost" onClick={dismiss}>
            Not now
          </Button>
        </div>
      )}
    </div>
  )
}
