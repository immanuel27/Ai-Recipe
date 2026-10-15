import type { Metadata } from "next"

import { AdminDashboard } from "@/components/admin/admin-dashboard"
import { PageContainer } from "@/components/shell/page-container"

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } }

export default function AdminPage() {
  return (
    <PageContainer>
      <AdminDashboard />
    </PageContainer>
  )
}
