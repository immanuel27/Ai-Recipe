"use client"

import * as React from "react"

import { useAppStore } from "@/components/providers/app-store"
import { supabaseConfigured } from "@/lib/supabase/env"
import { countUnread } from "@/lib/supabase/notifications"

const POLL_MS = 60_000
const EVENT = "airecipy:notifications-read"

/** Tell every bell on the page that notifications were just read. */
export function announceNotificationsRead() {
  window.dispatchEvent(new Event(EVENT))
}

/** Unread notifications for the signed-in creator: on load, every minute, and when the tab is back in focus. */
export function useUnreadCount() {
  const { user, hydrated } = useAppStore()
  const [count, setCount] = React.useState(0)
  const enabled = supabaseConfigured && hydrated && !!user?.profileId

  React.useEffect(() => {
    if (!enabled) return
    let cancelled = false
    const refresh = () =>
      countUnread()
        .then((n) => !cancelled && setCount(n))
        .catch(() => {})
    const onRead = () => setCount(0)
    const onVisible = () => document.visibilityState === "visible" && void refresh()
    void refresh()
    const timer = window.setInterval(refresh, POLL_MS)
    window.addEventListener(EVENT, onRead)
    document.addEventListener("visibilitychange", onVisible)
    return () => {
      cancelled = true
      window.clearInterval(timer)
      window.removeEventListener(EVENT, onRead)
      document.removeEventListener("visibilitychange", onVisible)
    }
  }, [enabled])

  return enabled ? count : 0
}
