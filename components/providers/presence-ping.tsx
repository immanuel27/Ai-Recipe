"use client"

import * as React from "react"

import { useAppStore } from "@/components/providers/app-store"
import { createClient } from "@/lib/supabase/client"
import { supabaseConfigured } from "@/lib/supabase/env"

const EVERY_MS = 2 * 60_000

/** From the first ping of this visit: when they were last here, and when they joined */
export interface VisitInfo {
  previousSeenAt: string | null
  joinedAt: string | null
}

let visit: VisitInfo | null = null
const listeners = new Set<() => void>()

/** This visit's info once the first ping has answered (null until then) */
export function useVisitInfo() {
  return React.useSyncExternalStore(
    (onChange) => {
      listeners.add(onChange)
      return () => listeners.delete(onChange)
    },
    () => visit,
    () => null
  )
}

/**
 * Tells the database "I'm here" while a signed-in person has the site open (every
 * 2 minutes, only when the tab is visible). Powers "online now" and "active today"
 * on the admin dashboard; stored privately, never shown publicly.
 */
export function PresencePing() {
  const { user, hydrated } = useAppStore()
  const enabled = supabaseConfigured && hydrated && !!user?.profileId

  React.useEffect(() => {
    if (!enabled) return
    const ping = () => {
      if (document.visibilityState !== "visible") return
      void createClient()
        .rpc("touch_presence")
        .then(({ data }) => {
          if (visit || !data) return
          visit = data as VisitInfo
          listeners.forEach((l) => l())
        }, () => {})
    }
    ping()
    const timer = window.setInterval(ping, EVERY_MS)
    document.addEventListener("visibilitychange", ping)
    return () => {
      window.clearInterval(timer)
      document.removeEventListener("visibilitychange", ping)
    }
  }, [enabled])

  return null
}
