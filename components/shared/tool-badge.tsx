import { ToolLogo } from "@/components/shared/tool-logo"
import { getToolName } from "@/lib/mock/tools"
import { cn } from "@/lib/utils"

/** The tools used, each with its round logo, e.g. "Lovable · Claude". */
export function ToolBadge({
  tools,
  onMedia,
  className,
}: {
  tools: string[]
  onMedia?: boolean
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex flex-wrap items-center gap-x-3 gap-y-1 type-meta font-semibold",
        onMedia ? "text-on-media" : "text-foreground",
        className
      )}
    >
      {tools.map((tool) => (
        <span key={tool} className="inline-flex items-center gap-2">
          <ToolLogo tool={tool} />
          {getToolName(tool)}
        </span>
      ))}
    </span>
  )
}
