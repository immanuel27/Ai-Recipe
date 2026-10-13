"use client"

import * as React from "react"
import Link from "next/link"

import { Skeleton } from "@/components/ui/skeleton"
import { LikeIcon, NotificationsIcon, PromptsIcon, SaveIcon, type IconType } from "@/components/icons"
import { announceNotificationsRead } from "@/components/notifications/use-unread-count"
import { CreatorAvatar } from "@/components/shared/creator-avatar"
import { EmptyState } from "@/components/shared/empty-state"
import { MediaImage } from "@/components/shared/media-image"
import { PageHeader } from "@/components/shell/page-container"
import { useRequireUser } from "@/hooks/use-require-user"
import { formatRelative } from "@/lib/format"
import { profileHref } from "@/lib/profile"
import { supabaseConfigured } from "@/lib/supabase/env"
import {
  fetchNotifications,
  markAllRead,
  type AppNotification,
  type NotificationType,
} from "@/lib/supabase/notifications"
import { cn } from "@/lib/utils"

const WHAT: Record<NotificationType, { verb: string; icon: IconType }> = {
  like: { verb: "liked your post", icon: LikeIcon },
  save: { verb: "saved your post", icon: SaveIcon },
  unlock: { verb: "unlocked your recipe", icon: PromptsIcon },
}

/** Who liked, saved or unlocked your posts, newest first. Opening the page marks them seen. */
export function NotificationsView() {
  const { ready } = useRequireUser()
  const [items, setItems] = React.useState<AppNotification[] | null>(supabaseConfigured ? null : [])
  const [failed, setFailed] = React.useState(false)

  React.useEffect(() => {
    if (!ready || !supabaseConfigured) return
    let cancelled = false
    fetchNotifications()
      .then((list) => {
        if (cancelled) return
        setItems(list)
        // Seen now: clear the bell (the list keeps showing which ones were new)
        if (list.some((n) => !n.read)) {
          markAllRead()
            .then(announceNotificationsRead)
            .catch(() => {})
        }
      })
      .catch(() => !cancelled && setFailed(true))
    return () => {
      cancelled = true
    }
  }, [ready])

  return (
    <div className="mx-auto w-full max-w-2xl">
      <PageHeader title="Notifications" description="Who liked, saved or unlocked your recipes." />

      {failed ? (
        <EmptyState
          icon={NotificationsIcon}
          title="Couldn't load notifications"
          description="Check your connection and try again."
          action={{ label: "Try again", href: "/notifications" }}
        />
      ) : items === null ? (
        <div className="flex flex-col gap-3" role="status" aria-label="Loading notifications">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-18 rounded-xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={NotificationsIcon}
          title="No notifications yet"
          description="When people like, save or unlock your recipes, you'll see it here."
          action={{ label: "Post a recipe", href: "/sell" }}
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((n) => (
            <NotificationRow key={n.id} n={n} />
          ))}
        </ul>
      )}
    </div>
  )
}

function NotificationRow({ n }: { n: AppNotification }) {
  const { verb, icon: Icon } = WHAT[n.type]
  const who = n.actor?.displayName ?? "Someone"
  return (
    <li
      className={cn(
        "glass relative flex items-center gap-3 rounded-xl p-3 transition-colors",
        !n.read && "ring-1 ring-brand/40"
      )}
    >
      <div className="relative shrink-0">
        {n.actor ? (
          <Link href={profileHref(n.actor.username)} aria-label={`${who}'s profile`} className="relative z-10 block rounded-full">
            <CreatorAvatar creator={{ displayName: who, avatarUrl: n.actor.avatarUrl }} className="size-11" />
          </Link>
        ) : (
          <CreatorAvatar creator={{ displayName: who }} className="size-11" />
        )}
        <span className="absolute -right-1 -bottom-1 flex size-5 items-center justify-center rounded-full bg-brand text-brand-foreground ring-2 ring-background">
          <Icon aria-hidden weight="fill" className="size-3" />
        </span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="type-body text-pretty">
          <span className="font-semibold">{who}</span> {verb}
          {n.listing && (
            <>
              {" "}
              <Link href={`/r/${n.listing.slug}`} className="font-semibold after:absolute after:inset-0 hover:underline">
                {n.listing.title}
              </Link>
            </>
          )}
        </p>
        <span className="type-meta text-muted-foreground">
          {formatRelative(n.createdAt)}
          {!n.read && <span className="ml-2 font-semibold text-brand">New</span>}
        </span>
      </div>

      {n.listing && (
        <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-muted">
          <MediaImage src={n.listing.posterUrl} alt="" fill sizes="48px" className="object-cover" />
        </div>
      )}
    </li>
  )
}
