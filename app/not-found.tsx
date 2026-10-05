import { CompassIcon } from "lucide-react"

import { EmptyState } from "@/components/shared/empty-state"

export default function NotFound() {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12 md:py-16">
      <EmptyState
        icon={CompassIcon}
        title="Page not found"
        description="That link doesn't go anywhere. Let's find you a recipe."
        action={{ label: "Explore recipes", href: "/explore" }}
      />
    </div>
  )
}
