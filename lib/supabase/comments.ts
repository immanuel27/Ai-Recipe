"use client"

import { createClient } from "@/lib/supabase/client"
import { friendlyError } from "@/lib/supabase/errors"

export interface PostComment {
  id: string
  body: string
  createdAt: string
  authorId: string
  author: { username: string; displayName: string | null; avatarUrl: string | null } | null
}

type Row = {
  id: string
  body: string
  created_at: string
  author_id: string
  author: { username: string; display_name: string | null; avatar_url: string | null } | null
}

const COLUMNS = "id, body, created_at, author_id, author:profiles!comments_author_id_fkey(username, display_name, avatar_url)"

function fromRow(r: Row): PostComment {
  return {
    id: r.id,
    body: r.body,
    createdAt: r.created_at,
    authorId: r.author_id,
    author: r.author ? { username: r.author.username, displayName: r.author.display_name, avatarUrl: r.author.avatar_url } : null,
  }
}

/** A post's comments, newest first */
export async function fetchComments(listingId: string): Promise<PostComment[]> {
  const { data, error } = await createClient()
    .from("comments")
    .select(COLUMNS)
    .eq("listing_id", listingId)
    .order("created_at", { ascending: false })
    .limit(200)
  if (error) throw new Error(friendlyError(error.message))
  return ((data ?? []) as unknown as Row[]).map(fromRow)
}

export async function addComment(listingId: string, authorId: string, body: string): Promise<PostComment> {
  const { data, error } = await createClient()
    .from("comments")
    .insert({ listing_id: listingId, author_id: authorId, body: body.trim() })
    .select(COLUMNS)
    .single()
  if (error) throw new Error(friendlyError(error.message))
  return fromRow(data as unknown as Row)
}

/** Delete a comment (yours, one on your post, or as admin) */
export async function deleteComment(id: string) {
  const { data, error } = await createClient().from("comments").delete().eq("id", id).select("id")
  if (error) throw new Error(friendlyError(error.message))
  if (!data?.length) throw new Error("You can't delete this comment.")
}
