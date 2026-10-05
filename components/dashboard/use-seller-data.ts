"use client"

import * as React from "react"

import { useAppStore, userCreatorId } from "@/components/providers/app-store"
import { LISTINGS } from "@/lib/mock/listings"
import {
  SAMPLE_CLAIMABLE_GROSS,
  SAMPLE_EARNINGS,
  SAMPLE_NEXT_PAYOUT,
  SAMPLE_SALES,
  SAMPLE_SELLER_CREATOR_ID,
} from "@/lib/mock/sales"
import type { Listing, MonthlyEarning, Sale } from "@/lib/types"

export interface SellerData {
  listings: Listing[]
  sales: Sale[]
  earnings: MonthlyEarning[]
  nextPayout: { date: string; amount: number } | null
  claimableGross: number
  hasData: boolean
}

function emptyMonths(now = new Date()): MonthlyEarning[] {
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1)
    return {
      month: d.toLocaleString("en-US", { month: "short" }),
      earnings: 0,
      sales: 0,
    }
  })
}

/** The signed-in seller's listings plus (optionally) sample sales data. */
export function useSellerData(): SellerData {
  const { user, createdListings, sampleData } = useAppStore()

  return React.useMemo(() => {
    const own = user
      ? createdListings.filter((l) => l.creatorId === userCreatorId(user.username))
      : []
    const sample = sampleData
      ? LISTINGS.filter((l) => l.creatorId === SAMPLE_SELLER_CREATOR_ID)
      : []
    const listings = [...own, ...sample]
    return {
      listings,
      sales: sampleData ? SAMPLE_SALES : [],
      earnings: sampleData ? SAMPLE_EARNINGS : emptyMonths(),
      nextPayout: sampleData ? SAMPLE_NEXT_PAYOUT : null,
      claimableGross: sampleData ? SAMPLE_CLAIMABLE_GROSS : 0,
      hasData: listings.length > 0,
    }
  }, [user, createdListings, sampleData])
}
