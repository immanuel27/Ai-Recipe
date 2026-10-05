import Image from "next/image"
import { LibraryBigIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { ExploreFilters } from "@/lib/types"
import { cn } from "@/lib/utils"

/**
 * AI platform logos floating around the hero (desktop only, decorative).
 * Files live in public/logos/. Logos are their owners' trademarks.
 */
const ORBS: { src: string; className: string; inset?: boolean; delay: string }[] = [
  { src: "/logos/gradient-loop.jpg", className: "top-6 left-[4%] size-24", delay: "0s" },
  { src: "/logos/kling.webp", className: "top-28 left-[19%] size-24", delay: "-2s" },
  { src: "/logos/gemini.svg", className: "top-52 left-[7%] size-24", inset: true, delay: "-4s" },
  { src: "/logos/claude.png", className: "top-0 right-[5%] size-24", delay: "-1s" },
  { src: "/logos/higgsfield.webp", className: "top-32 right-[19%] size-24", delay: "-3s" },
  { src: "/logos/openai.webp", className: "top-48 right-[5%] size-22", delay: "-5s" },
]

export function ExploreHero({ filters }: { filters: ExploreFilters }) {
  return (
    <section className="relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 mx-auto hidden max-w-7xl lg:block">
        {ORBS.map((o) => (
          <span
            key={o.src}
            style={{ animationDelay: o.delay }}
            className={cn(
              "absolute overflow-hidden rounded-full shadow-lg ring-1 ring-foreground/10 motion-safe:animate-[float_7s_ease-in-out_infinite]",
              o.inset && "bg-card",
              o.className
            )}
          >
            <Image
              src={o.src}
              alt=""
              fill
              sizes="96px"
              unoptimized={o.src.endsWith(".svg")}
              className={o.inset ? "object-contain p-5" : "object-cover"}
            />
          </span>
        ))}
      </div>

      <div className="relative mx-auto flex max-w-xl flex-col items-center gap-3 px-4 pt-8 pb-10 text-center md:pt-14 md:pb-14">
        <LibraryBigIcon className="size-8 text-primary" aria-hidden />
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Explore</h1>
        <p className="text-muted-foreground">Find the recipe behind the shot.</p>

        {/* Plain GET form: works without JS and keeps the other filters */}
        <form action="/explore" role="search" className="mt-4 flex w-full max-w-md gap-2">
          {filters.type !== "all" && <input type="hidden" name="type" value={filters.type} />}
          {filters.tool !== "all" && <input type="hidden" name="tool" value={filters.tool} />}
          {filters.sort !== "trending" && <input type="hidden" name="sort" value={filters.sort} />}
          <label htmlFor="explore-search" className="sr-only">
            Search recipes
          </label>
          <Input
            id="explore-search"
            name="q"
            type="search"
            defaultValue={filters.q}
            placeholder="Search prompts, styles, tools…"
            className="h-11 flex-1 rounded-full bg-card px-5"
          />
          <Button type="submit" size="pill" className="px-6">
            Search
          </Button>
        </form>
      </div>
    </section>
  )
}
