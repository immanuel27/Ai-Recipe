"use client"

import * as React from "react"

import { useAppStore } from "@/components/providers/app-store"
import { loadAccount } from "@/lib/supabase/account"
import { createClient } from "@/lib/supabase/client"
import { supabaseConfigured } from "@/lib/supabase/env"
import { identify, resetIdentity } from "@/lib/analytics"

/** Keeps the client store in step with the Supabase session (sign in/out, other tabs). */
export function AccountSync() {
  const { applyAccount } = useAppStore()

  React.useEffect(() => {
    if (!supabaseConfigured) return
    const supabase = createClient()
    let cancelled = false
    const refresh = () =>
      loadAccount()
        .then((account) => {
          if (cancelled) return
          applyAccount(account)
          if (!account) return resetIdentity()
          identify(account.identity.id, {
            username: account.user?.username,
            provider: account.identity.provider,
            founding_number: account.user?.foundingNumber ?? null,
          })
        })
        .catch((error) => console.error("Couldn't load your account", error))

    void refresh()
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") void refresh()
    })
    return () => {
      cancelled = true
      data.subscription.unsubscribe()
    }
  }, [applyAccount])

  return null
}
