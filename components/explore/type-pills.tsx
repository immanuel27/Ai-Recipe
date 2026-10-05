import Link from "next/link"

import { TYPE_OPTIONS, exploreHref } from "@/lib/explore-params"
import type { ExploreFilters } from "@/lib/types"
import { cn } from "@/lib/utils"

export function TypePills({ filters }: { filters: ExploreFilters }) {
  return (
    <nav aria-label="Media type" className="flex justify-center gap-2">
      {TYPE_OPTIONS.map((o) => {
        const active = filters.type === o.value
        return (
          <Link
            key={o.value}
            href={exploreHref({ ...filters, type: o.value, page: 1 })}
            scroll={false}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-full px-5 py-2 text-sm font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              active
                ? "bg-primary text-primary-foreground"
                : "bg-card text-foreground ring-1 ring-foreground/10 hover:bg-muted"
            )}
          >
            {o.label}
          </Link>
        )
      })}
    </nav>
  )
}
