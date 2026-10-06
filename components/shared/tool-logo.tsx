import Image from "next/image"

import { getTool } from "@/lib/mock/tools"
import { cn } from "@/lib/utils"

/** A model's logo as a 12px circle, sitting left of its name. Falls back to its initial. */
export function ToolLogo({ tool, className }: { tool: string; className?: string }) {
  const t = getTool(tool)
  if (t?.logo) {
    return (
      <Image
        src={t.logo}
        alt=""
        width={12}
        height={12}
        className={cn("size-3 shrink-0 rounded-full bg-on-media object-cover", className)}
      />
    )
  }
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-3 shrink-0 items-center justify-center rounded-full bg-foreground text-[0.5rem] leading-none font-bold text-background",
        className
      )}
    >
      {(t?.name ?? tool).charAt(0)}
    </span>
  )
}
