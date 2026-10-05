"use client"

import * as React from "react"
import { usePathname, useRouter } from "next/navigation"

import { useAppStore } from "@/components/providers/app-store"

/** Redirects to /signin (and back) once the client session has loaded. */
export function useRequireUser() {
  const store = useAppStore()
  const router = useRouter()
  const pathname = usePathname()

  React.useEffect(() => {
    if (store.hydrated && !store.user) {
      router.replace(`/signin?next=${encodeURIComponent(pathname)}`)
    }
  }, [store.hydrated, store.user, router, pathname])

  return { ...store, ready: store.hydrated && !!store.user }
}
