"use client"

import { createClient } from "@/lib/supabase/client"

export interface AdminOverview {
  generatedAt: string
  onlineNow: number
  activeToday: number
  activeYesterday: number
  totalUsers: number
  outsideUsers: number
  signupsToday: number
  signupsYesterday: number
  stuckNoUsername: number
  withPhoto: number
  unlocksToday: number
  unlocksTotal: number
  usersWhoUnlocked: number
  likesToday: number
  likesTotal: number
  savesTotal: number
  postsToday: number
  postsTotal: number
  signupsByDay: { day: string; count: number }[]
  topPosts: { slug: string; title: string; creator: string; unlocks: number; likes: number; saves: number; verified: boolean }[]
  pendingVerification: { id: string; slug: string; title: string; creator: string; proof: string; unlocks: number; created_at: string }[]
  activity: { kind: "signup" | "post" | "unlock" | "like"; at: string; who: string | null; title: string | null; slug: string | null }[]
}

/** Whether the signed-in person is an admin (checked in the database). */
export async function amIAdmin() {
  const { data, error } = await createClient().rpc("am_i_admin")
  if (error) return false
  return data === true
}

/** Everything the admin dashboard shows (the database refuses non-admins). */
export async function fetchAdminOverview(): Promise<AdminOverview> {
  const { data, error } = await createClient().rpc("admin_overview")
  if (error) throw error
  return data as AdminOverview
}

/** Verify (or unverify) a post: shows the Verified badge. */
export async function setPostVerified(listingId: string, verified: boolean) {
  const { error } = await createClient().rpc("admin_set_verified", { target: listingId, verified })
  if (error) throw error
  // Badges show in cached feeds: refresh them
  await fetch("/api/revalidate", { method: "POST" }).catch(() => {})
}

export interface AdminVideo {
  id: string
  slug: string
  title: string
  media_url: string
  bytes: number
}

/** Video posts with the size of their stored file, biggest first */
export async function fetchAdminVideos(): Promise<AdminVideo[]> {
  const { data, error } = await createClient().rpc("admin_videos")
  if (error) throw error
  return (data ?? []) as AdminVideo[]
}

const PUBLIC_PREFIX = "/storage/v1/object/public/media/"

/**
 * Upload an optimised copy next to the original video and point the post at it.
 * Returns the new size in bytes.
 */
export async function replaceWithOptimised(video: AdminVideo, file: File) {
  const supabase = createClient()
  const path = video.media_url.split(PUBLIC_PREFIX)[1]
  if (!path) throw new Error("This video isn't in our storage.")
  const folder = path.slice(0, path.lastIndexOf("/"))
  const newPath = `${folder}/media-opt-${Date.now().toString(36)}.mp4`
  const { error } = await supabase.storage.from("media").upload(newPath, file, { contentType: "video/mp4" })
  if (error) throw new Error(`Upload failed: ${error.message}`)
  const url = supabase.storage.from("media").getPublicUrl(newPath).data.publicUrl
  const { error: rpcError } = await supabase.rpc("admin_replace_video", { target: video.id, new_url: url })
  if (rpcError) throw rpcError
  return file.size
}

/** Refresh the cached feeds after changing posts */
export async function refreshCatalog() {
  await fetch("/api/revalidate", { method: "POST" }).catch(() => {})
}
