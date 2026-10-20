import { FoundingIcon } from "@/components/icons"
import { cn } from "@/lib/utils"

/** One of the first 50 creators to post on Ai Recipy, with their number. */
export function FoundingBadge({
  number,
  onMedia,
  compact,
  className,
}: {
  number: number
  /** Frosted style for use over images and video */
  onMedia?: boolean
  /** Just the star and number (tight spaces) */
  compact?: boolean
  className?: string
}) {
  return (
    <span
      title={`Founding Creator #${number}: one of the first 50 creators on Ai Recipy`}
      className={cn(
        "inline-flex w-fit shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
        onMedia ? "bg-scrim/60 text-on-media backdrop-blur-md" : "bg-highlight/15 text-highlight",
        className
      )}
    >
      <FoundingIcon weight="fill" className="size-3.5" aria-hidden />
      {compact ? `#${number}` : `Founding Creator #${number}`}
      {compact && <span className="sr-only">Founding Creator</span>}
    </span>
  )
}
