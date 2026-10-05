import type { Metadata } from "next"
import { FileTextIcon } from "lucide-react"

import { EmptyState } from "@/components/shared/empty-state"

export const metadata: Metadata = { title: "Privacy policy" }

export default function Page() {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12 md:py-16">
      <EmptyState
        icon={FileTextIcon}
        title="Privacy policy"
        description="We're finalising this page. It'll be published before launch."
        action={{ label: "Back to explore", href: "/explore" }}
      />
    </div>
  )
}
