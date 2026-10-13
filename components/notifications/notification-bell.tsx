"use client"

import Link from "next/link"

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { NotificationsIcon } from "@/components/icons"
import { useUnreadCount } from "@/components/notifications/use-unread-count"
import { cn } from "@/lib/utils"

/** Bell with the unread count; opens the Notifications page. */
export function NotificationBell({ className }: { className?: string }) {
  const unread = useUnreadCount()
  const label = unread > 0 ? `Notifications, ${unread} new` : "Notifications"
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link href="/notifications" aria-label={label} className={cn("relative", className)}>
          <NotificationsIcon aria-hidden weight={unread > 0 ? "fill" : "regular"} className="size-5" />
          {unread > 0 && (
            <span
              aria-hidden
              className="absolute -top-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1 text-[0.6875rem] font-bold text-brand-foreground tabular-nums ring-2 ring-background"
            >
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </Link>
      </TooltipTrigger>
      <TooltipContent>Notifications</TooltipContent>
    </Tooltip>
  )
}
