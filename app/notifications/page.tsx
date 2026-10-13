import type { Metadata } from "next"

import { NotificationsView } from "@/components/notifications/notifications-view"
import { PageContainer } from "@/components/shell/page-container"

export const metadata: Metadata = { title: "Notifications" }

export default function NotificationsPage() {
  return (
    <PageContainer>
      <NotificationsView />
    </PageContainer>
  )
}
