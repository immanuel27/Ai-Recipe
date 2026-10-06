import { Skeleton } from "@/components/ui/skeleton"

const HEIGHTS = ["h-72", "h-96", "h-64", "h-80", "h-56", "h-96"]

export default function ExploreLoading() {
  return (
    <div
      role="status"
      aria-label="Loading Explore"
      className="grid w-full gap-6 px-3 pt-24 pb-16 md:px-6 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-x-12 lg:px-10"
    >
      <div className="hidden flex-col gap-3 lg:flex">
        {Array.from({ length: 8 }, (_, i) => (
          <Skeleton key={i} className="h-6 w-32 rounded-lg" />
        ))}
      </div>
      <div className="flex flex-col gap-6">
        <Skeleton className="h-10 w-1/2 rounded-full" />
        <Skeleton className="h-10 rounded-full" />
        <div className="columns-2 gap-4 xl:columns-3 2xl:columns-4">
          {HEIGHTS.map((h, i) => (
            <Skeleton key={i} className={`mb-4 ${h} rounded-2xl`} />
          ))}
        </div>
      </div>
    </div>
  )
}
