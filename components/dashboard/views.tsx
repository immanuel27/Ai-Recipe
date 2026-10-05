"use client"

import { ClaimableCard } from "@/components/dashboard/claimable-card"
import { EarningsCard } from "@/components/dashboard/earnings-card"
import { MyListingsCard, RecentSalesCard } from "@/components/dashboard/lists"
import { PayoutHistoryCard } from "@/components/dashboard/payout-history"
import { ThresholdCard } from "@/components/dashboard/threshold-card"
import { useSellerData } from "@/components/dashboard/use-seller-data"

export function OverviewView() {
  const d = useSellerData()
  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <div className="xl:col-span-2">
        <EarningsCard earnings={d.earnings} nextPayout={d.nextPayout} />
      </div>
      <ClaimableCard gross={d.claimableGross} />
      <div className="xl:col-span-2">
        <RecentSalesCard sales={d.sales} listings={d.listings} limit={5} />
      </div>
      <ThresholdCard />
      <div className="xl:col-span-3">
        <MyListingsCard listings={d.listings} />
      </div>
    </div>
  )
}

export function ListingsView() {
  return <MyListingsCard listings={useSellerData().listings} />
}

export function SalesView() {
  const d = useSellerData()
  return <RecentSalesCard sales={d.sales} listings={d.listings} />
}

export function PayoutsView() {
  const d = useSellerData()
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <ClaimableCard gross={d.claimableGross} />
      <ThresholdCard />
      <div className="lg:col-span-2">
        <PayoutHistoryCard earnings={d.earnings} />
      </div>
    </div>
  )
}
