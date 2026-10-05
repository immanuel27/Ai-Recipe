import type { Metadata } from "next"

import { SalesView } from "@/components/dashboard/views"

export const metadata: Metadata = { title: "Sales" }

export default function Page() {
  return <SalesView />
}
