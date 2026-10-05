"use client"

import { useRouter } from "next/navigation"
import { CheckIcon, ListFilterIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SORT_OPTIONS, exploreHref } from "@/lib/explore-params"
import { TOOLS } from "@/lib/mock/tools"
import type { ExploreFilters } from "@/lib/types"

/** Tool dropdown + sort menu. Both write to the URL. */
export function FilterBar({ filters }: { filters: ExploreFilters }) {
  const router = useRouter()

  function update(patch: Partial<ExploreFilters>) {
    router.push(exploreHref({ ...filters, ...patch, page: 1 }), { scroll: false })
  }

  return (
    <div className="flex items-center gap-2">
      <Select
        value={filters.tool}
        onValueChange={(v) => update({ tool: v as ExploreFilters["tool"] })}
      >
        <SelectTrigger
          aria-label="Filter by tool"
          className="h-10! w-36 rounded-full bg-card px-4 shadow-xs"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="end">
          <SelectItem value="all">All tools</SelectItem>
          {TOOLS.map((t) => (
            <SelectItem key={t.id} value={t.id}>
              {t.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon-pill"
            className="size-10 bg-card shadow-xs"
            aria-label={`Sort: ${SORT_OPTIONS.find((o) => o.value === filters.sort)?.label}`}
          >
            <ListFilterIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Sort by</DropdownMenuLabel>
          {SORT_OPTIONS.map((o) => (
            <DropdownMenuItem key={o.value} onSelect={() => update({ sort: o.value })}>
              {o.label}
              {filters.sort === o.value && <CheckIcon className="ml-auto" aria-hidden />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
