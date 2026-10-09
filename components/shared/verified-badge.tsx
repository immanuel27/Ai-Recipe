import { VerifiedIcon } from "@/components/icons"
import { getToolName } from "@/lib/mock/tools"
import { cn } from "@/lib/utils"

/** Our team checked the creator's share link from the tool (listing.verified). */
export function VerifiedBadge({
  tool,
  onMedia,
  className,
}: {
  tool: string
  /** Frosted style for use over images and video */
  onMedia?: boolean
  className?: string
}) {
  return (
    <span
      title={`Verified: our team checked the creator's original ${getToolName(tool)} link`}
      className={cn(
        "inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
        onMedia ? "bg-scrim/60 text-on-media backdrop-blur-md" : "bg-primary/10 text-primary",
        className
      )}
    >
      <VerifiedIcon weight="fill" className="size-3.5" aria-hidden />
      Verified
    </span>
  )
}
