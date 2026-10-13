"use client"

import { createClient } from "@/lib/supabase/client"

export type NotificationType = "like" | "save" | "unlock"

export interface AppNotification {
  id: number
  type: NotificationType
  createdAt: string
  read: boolean
  actor: { username: string; displayName: string; avatarUrl?: string } | null
  listing: { slug: string; title: string; posterUrl: string } | null
}

type Row = {
  id: number
  type: NotificationType
  created_at: string
  read_at: string | null
  actor: { username: string; display_name: string; avatar_url: string | null } | null
  listing: { slug: string; title: string; poster_url: string } | null
}

/** Your latest notifications, newest first (RLS returns only your own). */
export async function fetchNotifications(limit = 60): Promise<AppNotification[]> {
  const { data, error } = await createClient()
    .from("notifications")
    .select(
      "id, type, created_at, read_at, actor:profiles!notifications_actor_id_fkey(username, display_name, avatar_url), listing:listings(slug, title, poster_url)"
    )
    .order("created_at", { ascending: false })
    .limit(limit)
  if (error) throw error
  return ((data ?? []) as unknown as Row[]).map((r) => ({
    id: r.id,
    type: r.type,
    createdAt: r.created_at,
    read: !!r.read_at,
    actor: r.actor
      ? { username: r.actor.username, displayName: r.actor.display_name, avatarUrl: r.actor.avatar_url ?? undefined }
      : null,
    listing: r.listing ? { slug: r.listing.slug, title: r.listing.title, posterUrl: r.listing.poster_url } : null,
  }))
}

/** How many notifications you haven't seen yet. */
export async function countUnread(): Promise<number> {
  const { count, error } = await createClient()
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .is("read_at", null)
  if (error) throw error
  return count ?? 0
}

/** Mark everything as seen (when you open the Notifications page). */
export async function markAllRead() {
  const { error } = await createClient()
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .is("read_at", null)
  if (error) throw error
}
