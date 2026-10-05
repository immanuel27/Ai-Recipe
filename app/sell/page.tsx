import type { Metadata } from "next"

import { SellFlow } from "@/components/sell/sell-flow"
import { PageContainer } from "@/components/shell/page-container"

export const metadata: Metadata = { title: "Sell" }

export default function SellPage() {
  return (
    <PageContainer>
      <SellFlow />
    </PageContainer>
  )
}
