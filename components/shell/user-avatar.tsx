import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { initials } from "@/lib/format"
import { cn } from "@/lib/utils"

/** The signed-in user's avatar: their profile picture, or initials. */
export function UserAvatar({
  username,
  avatarUrl,
  className,
}: {
  username: string
  avatarUrl?: string
  className?: string
}) {
  return (
    <Avatar className={cn("size-6", className)}>
      {avatarUrl && <AvatarImage src={avatarUrl} alt="" className="object-cover" />}
      <AvatarFallback className="bg-link text-xs font-semibold text-on-media">
        {initials(username)}
      </AvatarFallback>
    </Avatar>
  )
}
