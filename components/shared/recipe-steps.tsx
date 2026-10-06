import type * as React from "react"

import type { IconType } from "@/components/icons"

/** How much of a locked prompt reaches the page: enough to taste, never the whole thing. */
export const TEASER_CHARS = 120

/**
 * One numbered part of a recipe: a badge, a thread down to the next part, and
 * whatever preview the part has. An empty part says so instead of showing 0.
 */
export function RecipeStep({
  n,
  icon: Icon,
  label,
  count,
  last = false,
  children,
}: {
  n: number
  icon: IconType
  label: string
  count: number
  /** The final step has no line running on to a next one */
  last?: boolean
  children?: React.ReactNode
}) {
  return (
    <li className="relative grid grid-cols-[24px_minmax(0,1fr)] gap-x-3 gap-y-2">
      <span
        aria-hidden
        className="flex size-6 items-center justify-center rounded-full bg-brand/15 type-meta font-semibold text-link tabular-nums ring-1 ring-brand/35 ring-inset"
      >
        {n}
      </span>
      {/* The thread from this step down to the next one */}
      {!last && <span aria-hidden className="absolute top-8 -bottom-3 left-3 w-px -translate-x-1/2 bg-foreground/12" />}
      <span className="flex min-h-6 items-center gap-2 font-semibold">
        <span className="sr-only">Step {n}:</span>
        <Icon aria-hidden className="size-4 text-muted-foreground" />
        {label}
        {count > 0 && <span className="font-normal text-muted-foreground tabular-nums">{count}</span>}
      </span>
      <div className="col-start-2">
        {count === 0 ? <p className="type-meta text-muted-foreground">None in this recipe</p> : children}
      </div>
    </li>
  )
}

/** The opening of a locked prompt: the first line reads, the second fades out. */
export function TeaserSnippet({ text, className }: { text: string; className?: string }) {
  return (
    <p className={["fade-snippet line-clamp-2 type-meta text-muted-foreground", className].filter(Boolean).join(" ")}>
      <span className="sr-only">Preview, the rest unlocks with the recipe: </span>
      {text.slice(0, TEASER_CHARS)}
    </p>
  )
}
