"use client"

import * as React from "react"
import posthog from "posthog-js"

import { useAppStore } from "@/components/providers/app-store"
import { loadAccount } from "@/lib/supabase/account"
import { createClient } from "@/lib/supabase/client"
import { supabaseConfigured } from "@/lib/supabase/env"

/** Keeps the client store in step with the Supabase session (sign in/out, other tabs). */
export function AccountSync() {
  const { applyAccount } = useAppStore()
  const persistedDistinctId = posthog.get_property("$user_id")
  const distinctIdRef = React.useRef(
    typeof persistedDistinctId === "string" ? persistedDistinctId : null,
  )
  const identifiedRef = React.useRef(false)

  React.useEffect(() => {
    if (!supabaseConfigured) return
    const supabase = createClient()
    let cancelled = false
    const refresh = () =>
      loadAccount()
        .then((account) => {
          if (cancelled) return
          applyAccount(account)

          if (!account) {
            if (distinctIdRef.current) posthog.reset()
            distinctIdRef.current = null
            identifiedRef.current = false
            return
          }

          if (distinctIdRef.current && distinctIdRef.current !== account.identity.id) posthog.reset()
          if (!identifiedRef.current || distinctIdRef.current !== account.identity.id) {
            posthog.identify(account.identity.id, {
              ...(account.identity.email ? { email: account.identity.email } : {}),
              provider: account.identity.provider,
              ...(account.user ? { is_seller: account.user.isSeller } : {}),
            })
          }
          distinctIdRef.current = account.identity.id
          identifiedRef.current = true
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
