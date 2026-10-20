"use client"

import * as React from "react"

import { useAppStore } from "@/components/providers/app-store"
import { Skeleton } from "@/components/ui/skeleton"
import { CreateListingForm } from "@/components/sell/create-listing-form"
import { SellerSetup } from "@/components/sell/seller-setup"
import { PageHeader } from "@/components/shell/page-container"
import { useRequireUser } from "@/hooks/use-require-user"
import { PAYMENTS_ENABLED } from "@/lib/flags"

export function SellFlow() {
  const { ready, user } = useRequireUser()
  const { becomeSeller } = useAppStore()
  // While payments are off there's nothing to set up: go straight to posting
  // (marking them a creator keeps their Listings tab and seller tools working)
  const skipSetup = !PAYMENTS_ENABLED
  React.useEffect(() => {
    if (skipSetup && ready && user && !user.isSeller) {
      becomeSeller({ payoutMethod: "none", country: "none", proofOfWorkUrl: "" })
    }
  }, [skipSetup, ready, user, becomeSeller])

  if (!ready || !user) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4" role="status" aria-label="Loading">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    )
  }

  if (!user.isSeller && !skipSetup) {
    return (
      <>
        <div className="mx-auto w-full max-w-md">
          <PageHeader
            title={PAYMENTS_ENABLED ? "Start selling" : "Start posting"}
            description="A one-time setup before your first recipe."
          />
        </div>
        <SellerSetup />
      </>
    )
  }

  return <CreateListingForm />
}
