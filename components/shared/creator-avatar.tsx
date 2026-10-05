import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { initials } from "@/lib/format"
import type { Creator } from "@/lib/types"
import { cn } from "@/lib/utils"

export function CreatorAvatar({
  creator,
  className,
}: {
  creator: Pick<Creator, "displayName" | "avatarUrl">
  className?: string
}) {
  return (
    <Avatar className={cn("bg-muted", className)}>
      {creator.avatarUrl && <AvatarImage src={creator.avatarUrl} alt="" />}
      <AvatarFallback>{initials(creator.displayName)}</AvatarFallback>
    </Avatar>
  )
}
