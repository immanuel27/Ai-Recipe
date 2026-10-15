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
