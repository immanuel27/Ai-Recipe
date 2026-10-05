import { ExploreGridSkeleton } from "@/components/explore/explore-grid"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-12 md:px-6 md:pb-16">
      <div className="flex flex-col items-center gap-3 pt-8 pb-10 md:pt-14 md:pb-14">
        <Skeleton className="size-8 rounded-md" />
        <Skeleton className="h-12 w-48" />
        <Skeleton className="h-5 w-56" />
        <Skeleton className="mt-4 h-11 w-full max-w-md rounded-full" />
      </div>
      <Skeleton className="mx-auto h-9 w-56 rounded-full" />
      <div className="mt-8 mb-6 flex items-center justify-between md:mt-12">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-10 w-48 rounded-full" />
      </div>
      <ExploreGridSkeleton />
    </div>
  )
}
