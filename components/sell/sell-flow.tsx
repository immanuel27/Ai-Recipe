"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { CreateListingForm } from "@/components/sell/create-listing-form"
import { SellerSetup } from "@/components/sell/seller-setup"
import { PageHeader } from "@/components/shell/page-container"
import { useRequireUser } from "@/hooks/use-require-user"
import { PAYMENTS_ENABLED } from "@/lib/flags"

export function SellFlow() {
  const { ready, user } = useRequireUser()

  if (!ready || !user) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4" role="status" aria-label="Loading">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    )
  }

  if (!user.isSeller) {
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
