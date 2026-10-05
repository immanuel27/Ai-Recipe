import type { Metadata } from "next"
import { SparklesIcon } from "lucide-react"

import { LocalProfile } from "@/components/profile/local-profile"
import { PostsGrid } from "@/components/profile/posts-grid"
import { ProfileHeader } from "@/components/profile/profile-header"
import { ShareProfileButton } from "@/components/profile/share-profile-button"
import { PageContainer } from "@/components/shell/page-container"
import { getCreatorByUsername, getCreatorListings } from "@/lib/data"
import { formatCompact } from "@/lib/format"

export async function generateMetadata(props: PageProps<"/u/[username]">): Promise<Metadata> {
  const { username } = await props.params
  const creator = getCreatorByUsername(decodeURIComponent(username))
  return creator
    ? { title: `${creator.displayName} (@${creator.username})`, description: creator.bio }
    : { title: "Profile" }
}

export default async function PublicProfilePage(props: PageProps<"/u/[username]">) {
  const username = decodeURIComponent((await props.params).username)
  const creator = getCreatorByUsername(username)

  // Creators who signed up in this browser live in client state
  if (!creator) {
    return (
      <PageContainer className="max-w-5xl">
        <LocalProfile username={username} />
      </PageContainer>
    )
  }

  const posts = getCreatorListings(creator.id)
  const likes = posts.reduce((sum, l) => sum + l.stats.likes, 0)
  const sales = posts.reduce((sum, l) => sum + l.stats.sales, 0)

  return (
    <PageContainer className="flex max-w-5xl flex-col gap-8">
      <ProfileHeader
        displayName={creator.displayName}
        username={creator.username}
        bio={creator.bio}
        avatarUrl={creator.avatarUrl}
        stats={[
          { label: "Posts", value: posts.length },
          { label: "Likes", value: formatCompact(likes) },
          { label: "Sold", value: formatCompact(sales) },
        ]}
        action={<ShareProfileButton username={creator.username} name={creator.displayName} />}
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
            description: `${creator.displayName} hasn't published a recipe yet.`,
          }}
        />
      </section>
    </PageContainer>
  )
}
