"use client"

import Link from "next/link"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CaretDownIcon, CheckIcon } from "@/components/icons"
import { SORT_OPTIONS, exploreHref } from "@/lib/explore-params"
import type { ExploreFilters } from "@/lib/types"
import { cn } from "@/lib/utils"

const TABS = [
  { value: "video", label: "Videos" },
  { value: "image", label: "Images" },
  { value: "website", label: "Websites" },
] as const

/**
 * The row under the title: media type as one segmented control on the left
 * (tap the active side again for everything), the result count and sort
 * grouped quietly on the right.
 */
export function ExploreChips({
  filters,
  count,
  filtered,
}: {
  filters: ExploreFilters
  count: number
  filtered: boolean
}) {
  const sortLabel = SORT_OPTIONS.find((o) => o.value === filters.sort)?.label
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <nav aria-label="Media type" className="glass inline-flex items-center gap-1 rounded-full p-1">
        {TABS.map((t) => {
          const active = filters.type === t.value
          return (
            <Link
              key={t.value}
              href={exploreHref({ ...filters, type: active ? "all" : t.value, page: 1 })}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex h-9 items-center rounded-full px-5 type-body font-semibold outline-none transition-colors duration-160 focus-visible:ring-2 focus-visible:ring-ring",
                active ? "bg-foreground text-background" : "text-muted-foreground hover:bg-foreground/8 hover:text-foreground"
              )}
            >
              {t.label}
            </Link>
          )
        })}
      </nav>

      <div className="flex items-center gap-4">
        <p className="flex items-center gap-3 type-body text-muted-foreground" aria-live="polite">
          <span className="tabular-nums">
            {count} {count === 1 ? "recipe" : "recipes"}
            {filters.q && <> for “{filters.q}”</>}
          </span>
          {filtered && (
            <Link href="/explore" className="font-semibold text-link hover:underline">
              Clear
            </Link>
          )}
        </p>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label={`Sort: ${sortLabel}`}
              className="flex h-9 items-center gap-2 rounded-full px-3 type-body text-muted-foreground outline-none transition-colors duration-160 hover:bg-foreground/8 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            >
              Sort
              <span className="font-semibold text-foreground">{sortLabel}</span>
              <CaretDownIcon aria-hidden className="size-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={8} className="w-56">
            {SORT_OPTIONS.map((o) => (
              <DropdownMenuItem key={o.value} asChild>
                <Link href={exploreHref({ ...filters, sort: o.value, page: 1 })} scroll={false}>
                  {o.label}
                  {filters.sort === o.value && <CheckIcon aria-hidden className="ml-auto" />}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
