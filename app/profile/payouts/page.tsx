import type { Metadata } from "next"

import { PayoutsView } from "@/components/dashboard/views"

export const metadata: Metadata = { title: "Payouts" }

export default function Page() {
  return <PayoutsView />
}
