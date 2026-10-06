import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { initials } from "@/lib/format"
import { cn } from "@/lib/utils"

/** The signed-in user's avatar (initials until profile photos exist). */
export function UserAvatar({ username, className }: { username: string; className?: string }) {
  return (
    <Avatar className={cn("size-6", className)}>
      <AvatarFallback className="bg-link text-xs font-semibold text-on-media">
        {initials(username)}
      </AvatarFallback>
    </Avatar>
  )
}
