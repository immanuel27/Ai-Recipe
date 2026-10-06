import { ToolLogo } from "@/components/shared/tool-logo"
import { getToolName } from "@/lib/mock/tools"
import { cn } from "@/lib/utils"

/** Model name with its round logo on the left. */
export function ToolBadge({
  tool,
  version,
  onMedia,
  className,
}: {
  tool: string
  version?: string
  onMedia?: boolean
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 type-meta font-semibold",
        onMedia ? "text-on-media" : "text-foreground",
        className
      )}
    >
      <ToolLogo tool={tool} />
      {getToolName(tool)}
      {version && <span className="font-normal opacity-70">{version}</span>}
    </span>
  )
}
