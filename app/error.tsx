"use client"

import { useEffect } from "react"
import { TriangleAlertIcon } from "lucide-react"

import { EmptyState } from "@/components/shared/empty-state"

export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12 md:py-16">
      <EmptyState
        icon={TriangleAlertIcon}
        title="Something went wrong"
        description="This page didn't load properly. Try again in a moment."
        action={{ label: "Try again", onClick: retry }}
      />
    </div>
  )
}
