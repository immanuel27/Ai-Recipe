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

const chip =
  "flex h-10 shrink-0 items-center rounded-full px-5 type-body font-semibold outline-none transition-colors duration-160 focus-visible:ring-2 focus-visible:ring-ring"

const TABS = [
  { value: "video", label: "Videos" },
  { value: "image", label: "Images" },
] as const

/** Videos and Images as glassy tabs (tap the active one again for everything), sort on the right. */
export function ExploreChips({ filters }: { filters: ExploreFilters }) {
  const sortLabel = SORT_OPTIONS.find((o) => o.value === filters.sort)?.label
  return (
    <div className="flex items-center gap-4">
      <nav aria-label="Media type" className="flex min-w-0 flex-1 items-center gap-2">
        {TABS.map((t) => {
          const active = filters.type === t.value
          return (
            <Link
              key={t.value}
              href={exploreHref({ ...filters, type: active ? "all" : t.value, page: 1 })}
              aria-current={active ? "page" : undefined}
              className={cn(chip, active ? "bg-foreground text-background" : "glass-button text-foreground/80")}
            >
              {t.label}
            </Link>
          )
        })}
      </nav>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button" aria-label={`Sort: ${sortLabel}`} className={cn(chip, "glass-button gap-2")}>
            {sortLabel}
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
  )
}
