"use client"

import * as React from "react"

import { useAppStore } from "@/components/providers/app-store"
import { createClient } from "@/lib/supabase/client"
import { supabaseConfigured } from "@/lib/supabase/env"

const EVERY_MS = 2 * 60_000

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
      void createClient().rpc("touch_presence").then(() => {}, () => {})
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
