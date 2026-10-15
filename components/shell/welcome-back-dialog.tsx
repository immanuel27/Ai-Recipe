"use client"

import * as React from "react"
import Link from "next/link"

import { DocumentIcon, NotificationsIcon, UserIcon, type IconType } from "@/components/icons"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useAppStore } from "@/components/providers/app-store"
import { useVisitInfo, type VisitInfo } from "@/components/providers/presence-ping"
import { LogoMark } from "@/components/shell/logo-mark"

/**
 * What's new. Bump UPDATE_ID and edit UPDATES when shipping something worth
 * telling people about: everyone who comes back after AWAY_MS sees it once.
 */
const UPDATE_ID = "2026-10-15"
const UPDATES: { icon: IconType; title: string; text: string }[] = [
  { icon: UserIcon, title: "Profile pictures", text: "Add a photo so people know it's you." },
  { icon: NotificationsIcon, title: "Notifications", text: "See who liked, saved or unlocked your posts." },
  { icon: DocumentIcon, title: "Richer recipes", text: "Attach PDFs for long prompts, plus reference images." },
]

const AWAY_MS = 2 * 24 * 60 * 60_000
const SEEN_KEY = "airecipy-whats-new"

function readSeen() {
  try {
    return localStorage.getItem(SEEN_KEY)
  } catch {
    return null
  }
}

/** Back after 2+ days, with an update they haven't seen (needs this visit's info) */
export function isWelcomeBack(visit: VisitInfo | null) {
  if (!visit || readSeen() === UPDATE_ID) return false
  // Before visits were tracked there's no last visit: go by how long they've had an account
  const since = visit.previousSeenAt ?? visit.joinedAt
  return !!since && Date.now() - new Date(since).getTime() >= AWAY_MS
}

/** "Welcome back, we missed you": for signed-in people returning after 2+ days. */
export function WelcomeBackDialog() {
  const { user, dismissWelcome } = useAppStore()
  const visit = useVisitInfo()
  const [closed, setClosed] = React.useState(false)
  const signedIn = !!user
  // Decided once per visit, from the first ping's answer (?whats-new previews it)
  const show = React.useMemo(
    () => signedIn && (isWelcomeBack(visit) || new URLSearchParams(window.location.search).has("whats-new")),
    [signedIn, visit]
  )
  const open = show && !closed

  function close() {
    try {
      localStorage.setItem(SEEN_KEY, UPDATE_ID)
    } catch {
      // Private mode: it may show again next visit
    }
    dismissWelcome() // and skip the first-visit welcome
    setClosed(true)
  }

  if (!user) return null
  const needsPhoto = !user.avatarUrl

  return (
    <Dialog open={open} onOpenChange={(o) => !o && close()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="items-center gap-3 text-center">
          <LogoMark className="size-14 rounded-2xl" />
          <DialogTitle className="text-2xl font-bold tracking-tight">Welcome back, @{user.username} 👋</DialogTitle>
          <DialogDescription className="text-base text-balance">
            We missed you! Here&apos;s what&apos;s new on Ai Recipy:
          </DialogDescription>
        </DialogHeader>

        <ul className="flex flex-col gap-3">
          {UPDATES.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex items-start gap-3 rounded-lg bg-muted p-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-card text-primary ring-1 ring-foreground/10">
                <Icon className="size-4" aria-hidden />
              </span>
              <span className="flex flex-col">
                <span className="text-sm font-semibold">{title}</span>
                <span className="text-sm text-muted-foreground">{text}</span>
              </span>
            </li>
          ))}
        </ul>

        <DialogFooter className="flex-col gap-3 sm:flex-col">
          {needsPhoto ? (
            <Button asChild size="pill" className="w-full">
              <Link href="/profile?edit=1" onClick={close}>
                Add your photo
              </Link>
            </Button>
          ) : (
            <Button asChild size="pill" className="w-full">
              <Link href="/sell" onClick={close}>
                Post a recipe
              </Link>
            </Button>
          )}
          <Button variant="ghost" size="sm" className="font-semibold text-muted-foreground" onClick={close}>
            Maybe later
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
