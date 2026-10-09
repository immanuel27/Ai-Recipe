import type { Metadata } from "next"

import { ProfileShell } from "@/components/profile/profile-shell"
import { PageContainer } from "@/components/shell/page-container"

export const metadata: Metadata = { title: { default: "Profile", template: "%s · Profile · Ai Recipy" } }

export default function ProfileLayout({ children }: LayoutProps<"/profile">) {
  return (
    <PageContainer>
      <ProfileShell>{children}</ProfileShell>
    </PageContainer>
  )
}
