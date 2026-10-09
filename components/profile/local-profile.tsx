"use client"

import Link from "next/link"
import { SparklesIcon, UserXIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/shared/empty-state"
import { PostsGrid } from "@/components/profile/posts-grid"
import { ProfileHeader } from "@/components/profile/profile-header"
import { creatorFromUser, useAppStore, userCreatorId } from "@/components/providers/app-store"
import { formatCompact } from "@/lib/format"

/** Public view of a profile created in this browser (mock auth): only your own exists. */
export function LocalProfile({ username }: { username: string }) {
  const { user, createdListings, hydrated } = useAppStore()

  if (!hydrated) {
    return (
      <div className="flex flex-col gap-8" role="status" aria-label="Loading profile">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    )
  }

  if (!user || user.username !== username) {
    return (
      <div className="py-12">
        <EmptyState
          icon={UserXIcon}
          title="Profile not found"
          description={`There's no one called @${username} here.`}
          action={{ label: "Explore recipes", href: "/explore" }}
        />
      </div>
    )
  }

  const creator = creatorFromUser(user)
  const posts = createdListings.filter((l) => l.creatorId === userCreatorId(user.username))
  const likes = posts.reduce((sum, l) => sum + l.stats.likes, 0)

  return (
    <div className="flex flex-col gap-8">
      <title>{`${creator.displayName} (@${user.username}) · Ai Recipy`}</title>
      <ProfileHeader
        displayName={creator.displayName}
        username={user.username}
        bio={user.bio}
        stats={[
          { label: "Posts", value: posts.length },
          { label: "Likes", value: formatCompact(likes) },
          { label: "Sold", value: formatCompact(posts.reduce((s, l) => s + l.stats.sales, 0)) },
        ]}
        action={
          <Button asChild size="pill" variant="outline" className="w-full">
            <Link href="/profile">This is you: go to your profile</Link>
          </Button>
        }
      />
      <section aria-labelledby="posts-heading" className="flex flex-col gap-4">
        <h2 id="posts-heading" className="text-xl font-semibold tracking-tight">
          Posts
        </h2>
        <PostsGrid
          items={posts.map((listing) => ({ listing, creator }))}
          empty={{
            icon: SparklesIcon,
            title: "No posts yet",
            description: "Recipes you publish show up here.",
            action: { label: "Create a listing", href: "/sell" },
          }}
        />
      </section>
    </div>
  )
}
