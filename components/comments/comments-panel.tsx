"use client"

import * as React from "react"
import Link from "next/link"
import { toast } from "sonner"

import { CommentsIcon, DeleteIcon, SendIcon, SpinnerIcon } from "@/components/icons"
import { useAppStore, userCreatorId } from "@/components/providers/app-store"
import { CreatorAvatar } from "@/components/shared/creator-avatar"
import { Textarea } from "@/components/ui/textarea"
import { addComment, deleteComment, fetchComments, type PostComment } from "@/lib/supabase/comments"
import { supabaseConfigured } from "@/lib/supabase/env"
import { formatAge } from "@/lib/format"
import { profileHref } from "@/lib/profile"
import type { Listing } from "@/lib/types"
import { cn } from "@/lib/utils"

const MAX = 500

/**
 * A post's comments: newest first, with a box to add yours. Authors delete their
 * own; the post's creator can delete any comment on it (the database enforces it).
 */
export function CommentsPanel({
  listing,
  onCountChange,
  className,
  autoFocus = false,
}: {
  listing: Pick<Listing, "id" | "creatorId">
  onCountChange?: (count: number) => void
  className?: string
  autoFocus?: boolean
}) {
  const { user } = useAppStore()
  const [comments, setComments] = React.useState<PostComment[] | null>(null)
  const [failed, setFailed] = React.useState(false)
  const [text, setText] = React.useState("")
  const [sending, setSending] = React.useState(false)
  const isCreator = !!user && listing.creatorId === userCreatorId(user.username)

  React.useEffect(() => {
    if (!supabaseConfigured) return
    let cancelled = false
    fetchComments(listing.id).then(
      (c) => {
        if (cancelled) return
        setComments(c)
        onCountChange?.(c.length)
      },
      () => !cancelled && setFailed(true)
    )
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once per post
  }, [listing.id])

  async function send(e: React.FormEvent) {
    e.preventDefault()
    const body = text.trim()
    if (!body || !user?.profileId || sending) return
    setSending(true)
    try {
      const comment = await addComment(listing.id, user.profileId, body)
      const next = [comment, ...(comments ?? [])]
      setComments(next)
      onCountChange?.(next.length)
      setText("")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't post your comment. Try again.")
    } finally {
      setSending(false)
    }
  }

  async function remove(id: string) {
    try {
      await deleteComment(id)
      const next = (comments ?? []).filter((c) => c.id !== id)
      setComments(next)
      onCountChange?.(next.length)
      toast.success("Comment deleted")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't delete the comment.")
    }
  }

  if (!supabaseConfigured) {
    return <p className={cn("text-sm text-muted-foreground", className)}>Comments are available on the live site.</p>
  }

  return (
    <div className={cn("flex min-h-0 flex-col gap-4", className)}>
      <form onSubmit={send} className="flex items-end gap-2">
        <label htmlFor={`comment-${listing.id}`} className="sr-only">
          Add a comment
        </label>
        <Textarea
          id={`comment-${listing.id}`}
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, MAX))}
          onKeyDown={(e) => {
            // Enter sends, Shift+Enter makes a new line
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault()
              void send(e)
            }
          }}
          rows={1}
          autoFocus={autoFocus}
          placeholder="Add a comment…"
          className="max-h-32 min-h-11 resize-none rounded-2xl"
        />
        <button
          type="submit"
          disabled={!text.trim() || sending}
          aria-label="Post comment"
          className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground outline-none transition-opacity disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-ring"
        >
          {sending ? <SpinnerIcon aria-hidden className="size-5 animate-spin" /> : <SendIcon aria-hidden weight="fill" className="size-5" />}
        </button>
      </form>

      {failed && <p className="text-sm text-muted-foreground">Couldn&apos;t load comments. Try again later.</p>}
      {!failed && comments === null && (
        <div className="flex justify-center py-6 text-muted-foreground">
          <SpinnerIcon aria-label="Loading comments" className="size-5 animate-spin" />
        </div>
      )}
      {comments?.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-8 text-center text-muted-foreground">
          <CommentsIcon aria-hidden className="size-8" />
          <p className="text-sm">No comments yet. Be the first to say something.</p>
        </div>
      )}
      {!!comments?.length && (
        <ul className="flex min-h-0 flex-col gap-4 overflow-y-auto overscroll-contain">
          {comments.map((c) => {
            const name = c.author?.displayName || c.author?.username || "Someone"
            const canDelete = !!user?.profileId && (c.authorId === user.profileId || isCreator)
            return (
              <li key={c.id} className="group flex items-start gap-3">
                {c.author ? (
                  <Link href={profileHref(c.author.username)} className="shrink-0 rounded-full" aria-label={`${name} profile`}>
                    <CreatorAvatar creator={{ displayName: name, avatarUrl: c.author.avatarUrl ?? undefined }} className="size-8" />
                  </Link>
                ) : (
                  <CreatorAvatar creator={{ displayName: name }} className="size-8 shrink-0" />
                )}
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <p className="text-sm">
                    <span className="font-semibold">{c.author ? `@${c.author.username}` : name}</span>{" "}
                    <span className="text-muted-foreground">{formatAge(c.createdAt)}</span>
                  </p>
                  <p className="text-sm whitespace-pre-wrap break-words">{c.body}</p>
                </div>
                {canDelete && (
                  <button
                    type="button"
                    onClick={() => void remove(c.id)}
                    aria-label="Delete comment"
                    className="flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground outline-none hover:bg-destructive/10 hover:text-destructive focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <DeleteIcon aria-hidden className="size-4" />
                  </button>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
