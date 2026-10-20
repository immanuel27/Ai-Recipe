"use client"

import * as React from "react"

import { FoundingIcon } from "@/components/icons"
import { useAppStore } from "@/components/providers/app-store"
import { createClient } from "@/lib/supabase/client"
import { supabaseConfigured } from "@/lib/supabase/env"

const SPOTS = 50

/** How many Founding Creator spots are left (shown until you have one, or they run out). */
export function FoundingSpots() {
  const { user } = useAppStore()
  const [taken, setTaken] = React.useState<number | null>(null)

  React.useEffect(() => {
    if (!supabaseConfigured) return
    createClient()
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .not("founding_number", "is", null)
      .then(({ count }) => setTaken(count ?? null))
  }, [])

  if (taken === null || user?.foundingNumber || taken >= SPOTS) return null
  const left = SPOTS - taken

  return (
    <div className="flex items-start gap-3 rounded-xl bg-highlight/10 p-4 ring-1 ring-highlight/30">
      <FoundingIcon aria-hidden weight="fill" className="mt-0.5 size-5 shrink-0 text-highlight" />
      <p className="text-sm">
        <span className="font-semibold">
          {left} of {SPOTS} Founding Creator spots left.
        </span>{" "}
        <span className="text-muted-foreground">
          Post your first recipe to claim one. The badge stays on your profile and posts for good.
        </span>
      </p>
    </div>
  )
}
