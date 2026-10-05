import { Badge } from "@/components/ui/badge"
import { getToolName } from "@/lib/mock/tools"
import { cn } from "@/lib/utils"

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
    <Badge
      variant="secondary"
      className={cn(
        onMedia && "bg-on-media/15 text-on-media backdrop-blur-md",
        className
      )}
    >
      {getToolName(tool)}
      {version && <span className="opacity-70">{version}</span>}
    </Badge>
  )
}
