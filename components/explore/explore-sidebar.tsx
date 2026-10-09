import Link from "next/link"

import { ForwardIcon } from "@/components/icons"
import { Logo } from "@/components/shell/logo"
import { LogoMark } from "@/components/shell/logo-mark"
import { ToolLogo } from "@/components/shared/tool-logo"
import { exploreHref } from "@/lib/explore-params"
import { formatPrice, PLATFORM_FEE } from "@/lib/format"
import { TOOLS } from "@/lib/mock/tools"
import type { ExploreFilters } from "@/lib/types"
import { cn } from "@/lib/utils"

function Item({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex items-center gap-2 rounded-lg py-1 type-read outline-none transition-colors duration-160 focus-visible:ring-2 focus-visible:ring-ring",
          active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
        )}
      >
        {children}
        {active && <span aria-hidden className="size-1.5 rounded-full bg-foreground" />}
      </Link>
    </li>
  )
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <nav aria-label={label} className="flex flex-col gap-2">
      <h2 className="type-body text-muted-foreground/70">{label}</h2>
      <ul className="flex flex-col gap-1">{children}</ul>
    </nav>
  )
}

/** Every way into the catalogue, with the active one marked by a dot. */
export function ExploreSidebar({ filters, toolCounts }: { filters: ExploreFilters; toolCounts: Record<string, number> }) {
  const onlyType = (t: ExploreFilters["type"]) =>
    filters.type === t && !filters.tag && filters.tool === "all" && filters.price === "any" && !filters.q
  return (
    <div className="flex h-full flex-col gap-8">
      <div className="flex h-12 items-center">
        <Logo />
      </div>
      <Group label="Browse">
        <Item href="/explore" active={onlyType("all")}>
          All recipes
        </Item>
        <Item href={exploreHref({ type: "video" })} active={onlyType("video")}>
          Videos
        </Item>
        <Item href={exploreHref({ type: "image" })} active={onlyType("image")}>
          Images
        </Item>
        <Item href={exploreHref({ type: "website" })} active={onlyType("website")}>
          Websites
        </Item>
        <Item href={exploreHref({ price: "free" })} active={filters.price === "free"}>
          Free to try
        </Item>
        <Item href={exploreHref({ price: "under-10" })} active={filters.price === "under-10"}>
          Under $10
        </Item>
      </Group>

      <Group label="Tools">
        {TOOLS.filter((t) => toolCounts[t.id]).map((t) => (
          <Item key={t.id} href={exploreHref({ tool: t.id })} active={filters.tool === t.id}>
            <ToolLogo tool={t.id} className="size-4" />
            {t.name}
            <span className="type-meta text-muted-foreground/70 tabular-nums">{toolCounts[t.id]}</span>
          </Item>
        ))}
      </Group>

      {/* For creators: the other side of the marketplace */}
      <Link
        href="/sell"
        className="glass group mt-auto flex flex-col gap-4 rounded-2xl p-4 outline-none transition-colors duration-160 hover:bg-glass/80 focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-foreground text-background">
            <LogoMark className="h-4 w-5" />
          </span>
          <span className="flex flex-col gap-1">
            <span className="font-semibold">For creators</span>
            <span className="type-meta text-muted-foreground">Sell your recipes</span>
          </span>
        </span>
        <span className="type-body text-muted-foreground">
          Turn the prompts behind your best shot into income. You keep {Math.round((1 - PLATFORM_FEE) * 100)}% of
          every sale, from {formatPrice(400)}.
        </span>
        <span className="flex items-center gap-2 type-body font-semibold">
          Start selling
          <ForwardIcon aria-hidden className="size-4 transition-transform duration-160 group-hover:translate-x-1" />
        </span>
      </Link>
    </div>
  )
}
