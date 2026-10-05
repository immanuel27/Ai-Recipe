"use client"

import { SparklesIcon } from "lucide-react"

import { EditProfileDialog } from "@/components/profile/edit-profile-dialog"
import { PostsGrid } from "@/components/profile/posts-grid"
import { ProfileHeader } from "@/components/profile/profile-header"
import { creatorFromUser, useAppStore, userCreatorId } from "@/components/providers/app-store"
import { formatCompact } from "@/lib/format"

/** Your profile: header + your posts. */
export function OwnProfileView() {
  const { user, createdListings, purchased } = useAppStore()
  if (!user) return null

  const creator = creatorFromUser(user)
  const posts = createdListings.filter((l) => l.creatorId === userCreatorId(user.username))
  const likes = posts.reduce((sum, l) => sum + l.stats.likes, 0)

  return (
    <div className="flex flex-col gap-8">
      <ProfileHeader
        displayName={creator.displayName}
        username={user.username}
        bio={user.bio}
        stats={[
          { label: "Posts", value: posts.length },
          { label: "Likes", value: formatCompact(likes) },
          { label: "Library", value: purchased.length },
        ]}
        action={<EditProfileDialog />}
      />
      <section aria-labelledby="posts-heading" className="flex flex-col gap-4">
        <h2 id="posts-heading" className="text-xl font-semibold tracking-tight">
          Posts
        </h2>
        <PostsGrid
          items={posts.map((listing) => ({ listing, creator }))}
          empty={{
            icon: SparklesIcon,
            title: "Share your first recipe",
            description: "Recipes you publish show up here for everyone to see.",
            action: { label: user.isSeller ? "Create a listing" : "Start selling", href: "/sell" },
          }}
        />
      </section>
    </div>
  )
}
