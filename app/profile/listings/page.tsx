import type { Metadata } from "next"

import { ListingsView } from "@/components/dashboard/views"

export const metadata: Metadata = { title: "Listings" }

export default function Page() {
  return <ListingsView />
}
