"use client"

import { BookmarkIcon, HeartIcon, ShoppingBagIcon } from "lucide-react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PostsGrid } from "@/components/profile/posts-grid"
import { useListingLookup } from "@/components/profile/use-listing-lookup"
import { useAppStore } from "@/components/providers/app-store"

/** Everything you've bought, saved or liked. Private to you. */
export function LibraryView() {
  const { purchased, saved, liked } = useAppStore()
  const lookup = useListingLookup()

  const tabs = [
    {
      value: "purchased",
      label: "Purchased",
      items: lookup([...purchased].reverse()),
      empty: {
        icon: ShoppingBagIcon,
        title: "No recipes yet",
        description: "Recipes you buy or get for free live here forever.",
        action: { label: "Explore recipes", href: "/explore" },
      },
    },
    {
      value: "saved",
      label: "Saved",
      items: lookup([...saved].reverse()),
      empty: {
        icon: BookmarkIcon,
        title: "Nothing saved",
        description: "Tap the bookmark on any post to save it for later.",
        action: { label: "Browse the feed", href: "/" },
      },
    },
    {
      value: "liked",
      label: "Liked",
      items: lookup([...liked].reverse()),
      empty: {
        icon: HeartIcon,
        title: "No likes yet",
        description: "Double-tap a post you love and it'll show up here.",
        action: { label: "Browse the feed", href: "/" },
      },
    },
  ]

  return (
    <Tabs defaultValue="purchased" className="gap-6">
      <TabsList className="h-11! rounded-full bg-card p-1 ring-1 ring-foreground/10">
        {tabs.map((t) => (
          <TabsTrigger
            key={t.value}
            value={t.value}
            className="rounded-full! px-4 data-[state=active]:bg-primary! data-[state=active]:text-primary-foreground!"
          >
            {t.label}
            <span className="tabular-nums opacity-70">{t.items.length}</span>
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((t) => (
        <TabsContent key={t.value} value={t.value}>
          <PostsGrid items={t.items} empty={t.empty} />
        </TabsContent>
      ))}
    </Tabs>
  )
}
